'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import { useVoting } from '@/hooks/useVoting';

const ProposalsPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const {
    proposals,
    isVotingOpen,
    isLoading,
    addProposal,
    isAdmin,
    hasVoted,
    votedProposalId,
    toggleVotingStatus,
    vote
  } = useVoting();
  
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newProposal, setNewProposal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<number | null>(null);

  const handleCreateProposal = async () => {
    if (!newProposal.trim()) {
      toast.error('Veuillez entrer un nom pour la proposition');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const success = await addProposal(newProposal.trim());
      
      if (success) {
        toast.success('Proposition créée avec succès !');
        setNewProposal('');
        setIsCreating(false);
        // Les propositions seront mises à jour automatiquement via le hook
      } else {
        toast.error('Échec de la création de la proposition');
      }
    } catch (err) {
      console.error('Erreur lors de la création de la proposition :', err);
      toast.error('Erreur lors de la création de la proposition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteClick = (proposalId: number) => {
    router.push(`/vote#proposal-${proposalId}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              Proposals
            </h1>
            <p className="text-gray-300">
              {isVotingOpen 
                ? 'Voting is currently open. Cast your vote now!'
                : 'Voting is currently closed.'
              }
            </p>
          </div>
          
          {isAdmin && (
            <div className="mt-4 md:mt-0">
              {isCreating ? (
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    value={newProposal}
                    onChange={(e) => setNewProposal(e.target.value)}
                    placeholder="Enter proposal name"
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    disabled={isSubmitting}
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCreateProposal}
                      isLoading={isSubmitting}
                      className="flex-1"
                    >
                      Submit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setNewProposal('');
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsCreating(true)}
                  className="w-full md:w-auto"
                >
                  Create Proposal
                </Button>
              )}
            </div>
          )}
        </div>

        {proposals.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-400 text-lg">No proposals have been created yet.</p>
            {isAdmin && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="mt-4"
              >
                Create Your First Proposal
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const hasUserVoted = hasVoted && votedProposalId === proposal.id;
              const isVotingForThis = isVoting === proposal.id;
              
              return (
                <div 
                  key={proposal.id}
                  id={`proposal-${proposal.id}`}
                  className={`bg-gray-800/50 border ${hasUserVoted ? 'border-green-500' : 'border-gray-700'} rounded-xl p-6 hover:border-gray-600 transition-colors duration-200`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">
                        #{proposal.id + 1}: {proposal.name}
                      </h3>
                      <div className="mt-2 flex items-center">
                        <span className="text-blue-400 font-medium">
                          {proposal.voteCount} {proposal.voteCount === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleVoteClick(proposal.id)}
                        className="w-full md:w-auto"
                      >
                        {isVotingOpen ? 'Vote Now' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {isVotingOpen && (
          <div className="mt-8 text-center">
            <Button 
              onClick={() => router.push('/vote')}
              variant="primary"
              className="px-8 py-3 text-lg"
            >
              Go to Voting Page
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProposalsPage;
