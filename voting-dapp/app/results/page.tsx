'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import { useVoting } from '@/hooks/useVoting';

type Winner = {
  id: number;
  name: string;
  voteCount: number;
  isTie: boolean;
} | null;

const ResultsPage = () => {
  const { isConnected } = useAccount();
  const {
    proposals,
    isVotingOpen,
    isLoading,
    getWinningProposal,
    getVoterStatus,
    isOwner,
  } = useVoting();
  
  const [winner, setWinner] = useState<Winner>(null);
  const [isLoadingWinner, setIsLoadingWinner] = useState<boolean>(true);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Check if the connected wallet is the owner
  useEffect(() => {
    const checkIfAdmin = async () => {
      if (isOwner) {
        const adminStatus = await isOwner();
        setIsAdmin(adminStatus);
      }
    };
    
    checkIfAdmin();
  }, [isOwner]);

  // Fetch winner and voting status
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoadingWinner(true);
        
        // Get winning proposal
        const winningProposal = await getWinningProposal();
        
        if (winningProposal) {
          setWinner({
            id: winningProposal.id,
            name: winningProposal.name,
            voteCount: winningProposal.voteCount,
            isTie: false, // This would need to be calculated based on tie conditions
          });
        }
        
        // Check if current user has voted
        const { address } = await (window as any).ethereum?.request({ 
          method: 'eth_accounts' 
        });
        
        if (address?.[0]) {
          const status = await getVoterStatus(address[0]);
          if (status) {
            setHasVoted(status.hasVoted);
          }
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        toast.error('Failed to load voting results');
      } finally {
        setIsLoadingWinner(false);
      }
    };
    
    fetchResults();
  }, [getWinningProposal, getVoterStatus]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Refresh data
      const winningProposal = await getWinningProposal();
      
      if (winningProposal) {
        setWinner({
          id: winningProposal.id,
          name: winningProposal.name,
          voteCount: winningProposal.voteCount,
          isTie: false,
        });
      }
      
      toast.success('Results refreshed');
    } catch (error) {
      console.error('Error refreshing results:', error);
      toast.error('Failed to refresh results');
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalVotes = proposals.reduce((sum, proposal) => sum + proposal.voteCount, 0);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Voting Results
          </h1>
          <p className="text-xl text-gray-300">
            {isVotingOpen 
              ? 'Live voting results. Voting is still open!'
              : 'Final voting results.'
            }
          </p>
          
          {!isVotingOpen && winner && (
            <div className="mt-6">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30">
                <span className="text-lg font-medium text-blue-300">
                  {winner.isTie 
                    ? 'It\'s a tie!'
                    : `Winner: ${winner.name}`
                  }
                </span>
              </div>
              {winner.isTie && (
                <p className="mt-2 text-gray-400 text-sm">
                  Multiple proposals received the same number of votes
                </p>
              )}
            </div>
          )}
        </div>

        {isLoading || isLoadingWinner ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No proposals available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Voting Summary</h2>
                <Button 
                  onClick={handleRefresh}
                  variant="ghost"
                  size="sm"
                  isLoading={isRefreshing}
                  className="text-sm"
                >
                  Refresh
                </Button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-400">{proposals.length}</div>
                  <div className="text-gray-400 mt-1">Total Proposals</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-400">{totalVotes}</div>
                  <div className="text-gray-400 mt-1">Total Votes Cast</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {isVotingOpen ? 'Active' : 'Completed'}
                  </div>
                  <div className="text-gray-400 mt-1">Status</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Detailed Results</h2>
              
              {proposals
                .sort((a, b) => b.voteCount - a.voteCount)
                .map((proposal, index) => {
                  const percentage = totalVotes > 0 
                    ? Math.round((proposal.voteCount / totalVotes) * 100) 
                    : 0;
                  
                  return (
                    <div 
                      key={proposal.id}
                      className={`bg-gray-800/50 border rounded-xl p-4 ${
                        winner && winner.id === proposal.id && !winner.isTie
                          ? 'border-yellow-400/50 bg-yellow-500/5'
                          : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-white">
                            {index + 1}. {proposal.name}
                          </span>
                          {winner && winner.id === proposal.id && !winner.isTie && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded-full">
                              {winner.isTie ? 'Tied' : 'Winner'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {proposal.voteCount} votes
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div 
                          className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {percentage}% of total
                        </span>
                        {hasVoted && (
                          <span className="text-xs text-green-400">
                            You voted for this proposal
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {isAdmin && !isVotingOpen && (
              <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-300 mb-2">Admin Actions</h3>
                <p className="text-sm text-blue-100 mb-4">
                  As an admin, you can open a new voting session when ready.
                </p>
                <Button 
                  onClick={() => {}}
                  variant="outline"
                  size="sm"
                  className="border-blue-400 text-blue-300 hover:bg-blue-900/30"
                >
                  Open New Voting Session
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ResultsPage;
