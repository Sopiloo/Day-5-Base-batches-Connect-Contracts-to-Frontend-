'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import { useVoting } from '@/hooks/useVoting';

const VotePage = () => {
  const { address } = useAccount();
  const {
    proposals,
    isVotingOpen,
    isLoading,
    vote,
    getVoterStatus,
    refresh,
  } = useVoting();
  
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votedProposalId, setVotedProposalId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check if user has already voted
  useEffect(() => {
    const checkVoterStatus = async () => {
      if (!address) return;
      
      try {
        const status = await getVoterStatus(address);
        if (status) {
          setHasVoted(status.hasVoted);
          setVotedProposalId(status.votedProposalId);
          
          // Auto-select the proposal the user voted for
          if (status.hasVoted) {
            setSelectedProposal(status.votedProposalId);
          }
        }
      } catch (error) {
        console.error('Error checking voter status:', error);
      }
    };
    
    checkVoterStatus();
  }, [address, getVoterStatus]);

  const handleVote = async () => {
    if (selectedProposal === null) {
      toast.error('Please select a proposal to vote for');
      return;
    }
    
    if (!isVotingOpen) {
      toast.error('Voting is currently closed');
      return;
    }
    
    if (hasVoted) {
      toast.error('You have already voted');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const tx = await vote(selectedProposal);
      await tx.wait();
      
      // Refresh data
      await refresh();
      setHasVoted(true);
      setVotedProposalId(selectedProposal);
      
      toast.success('Vote submitted successfully!');
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotes = proposals.reduce((sum, proposal) => sum + proposal.voteCount, 0);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Cast Your Vote
          </h1>
          <p className="text-xl text-gray-300">
            {isVotingOpen 
              ? 'Voting is now open! Select your preferred option below.'
              : 'Voting is currently closed. Check back later for the next voting session.'
            }
          </p>
          
          {hasVoted && votedProposalId !== null && (
            <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
              <p className="text-green-300">
                You've already voted for: <span className="font-semibold">
                  {proposals[votedProposalId]?.name || 'Unknown Proposal'}
                </span>
              </p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No proposals available to vote on.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                  selectedProposal === proposal.id 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-800/70 cursor-pointer'
                }`}
                onClick={() => !hasVoted && isVotingOpen && setSelectedProposal(proposal.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{proposal.name}</h3>
                    <div className="mt-2 flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" 
                          style={{
                            width: totalVotes > 0 ? `${(proposal.voteCount / totalVotes) * 100}%` : '0%',
                            minWidth: '0.5rem',
                          }}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm text-gray-300">
                        {proposal.voteCount} {proposal.voteCount === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                  </div>
                  
                  {votedProposalId === proposal.id && (
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-300 border border-green-700">
                        Your Vote
                      </span>
                    </div>
                  )}
                </div>
                
                {!hasVoted && isVotingOpen && selectedProposal === proposal.id && (
                  <div className="absolute -top-2 -right-2">
                    <div className="flex h-5 w-5">
                      <div className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-blue-400 opacity-75"></div>
                      <div className="relative inline-flex rounded-full h-5 w-5 bg-blue-500"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-6">
              <Button
                onClick={handleVote}
                disabled={!isVotingOpen || hasVoted || selectedProposal === null || isSubmitting}
                isLoading={isSubmitting}
                className="w-full md:w-auto px-8 py-3 text-lg"
              >
                {hasVoted ? 'Already Voted' : 'Submit Vote'}
              </Button>
              
              {!isVotingOpen && (
                <p className="mt-4 text-yellow-400 text-sm">
                  Note: Voting is currently closed. You can view the proposals but cannot vote at this time.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default VotePage;
