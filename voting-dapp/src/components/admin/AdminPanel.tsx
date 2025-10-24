'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '../ui/Button';
import { useVoting } from '@/hooks/useVoting';

export const AdminPanel = () => {
  const { address } = useAccount();
  const {
    isAdmin,
    isVotingOpen,
    openVoting,
    closeVoting,
    addProposal,
    isLoading
  } = useVoting();
  
  const [proposalName, setProposalName] = useState('');
  const [isAddingProposal, setIsAddingProposal] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleAddProposal = async () => {
    if (!proposalName.trim()) return;
    setIsAddingProposal(true);
    try {
      await addProposal(proposalName);
      setProposalName('');
    } catch (error) {
      console.error('Error adding proposal:', error);
    } finally {
      setIsAddingProposal(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Admin Panel</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Voting Status: 
            <span className={isVotingOpen ? 'text-green-400' : 'text-red-400'}>
              {isVotingOpen ? 'Open' : 'Closed'}
            </span>
          </h3>
          <div className="flex space-x-4">
            <Button
              onClick={openVoting}
              disabled={isVotingOpen || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Open Voting
            </Button>
            <Button
              onClick={closeVoting}
              disabled={!isVotingOpen || isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Close Voting
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Add Proposal</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={proposalName}
              onChange={(e) => setProposalName(e.target.value)}
              placeholder="Enter proposal name"
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleAddProposal}
              disabled={!proposalName.trim() || isAddingProposal || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAddingProposal ? 'Adding...' : 'Add Proposal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
