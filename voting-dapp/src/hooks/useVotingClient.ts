'use client';

import { useState, useEffect } from 'react';
import { 
  useReadContract, 
  useWriteContract, 
  useAccount, 
  useWatchContractEvent 
} from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { toast } from 'sonner';
import votingContractABI from '@/contracts/VotingContractABI.json';

// Adresse du contrat déployé sur Base Sepolia
export const VOTING_CONTRACT_ADDRESS = '0xbDa441A907D5549Ac9A5f8e04e66328836BE4F71';

type Proposal = {
  id: number;
  name: string;
  voteCount: number;
};

type Voter = {
  hasVoted: boolean;
  votedProposalId: number;
};

export const useVoting = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isVotingOpen, setIsVotingOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Watch for contract events
  useWatchContractEvent({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    eventName: 'VoteCast',
    onLogs: (logs) => {
      toast.success('Nouveau vote enregistré !');
      refetchProposalCount();
      refetchVotingStatus();
    },
  });

  useWatchContractEvent({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    eventName: 'ProposalAdded',
    onLogs: () => {
      toast.success('Nouvelle proposition ajoutée !');
      refetchProposalCount();
    },
  });

  useWatchContractEvent({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    eventName: 'VotingOpened',
    onLogs: () => {
      toast.success('Le vote est maintenant ouvert !');
      setIsVotingOpen(true);
    },
  });

  useWatchContractEvent({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    eventName: 'VotingClosed',
    onLogs: () => {
      toast.info('Le vote est maintenant fermé.');
      setIsVotingOpen(false);
    },
  });
  
  // Read contract state
  const { 
    data: proposalCount,
    isLoading: isLoadingProposalCount,
    error: proposalCountError,
    refetch: refetchProposalCount
  } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    functionName: 'getProposalCount',
    chainId: baseSepolia.id,
  });
  
  const { 
    data: votingOpen,
    isLoading: isLoadingVotingStatus,
    error: votingStatusError,
    refetch: refetchVotingStatus
  } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    functionName: 'isVotingOpen',
    chainId: baseSepolia.id,
  });

  // Vérifier si l'utilisateur est l'administrateur
  const { 
    data: ownerAddress,
    isLoading: isLoadingOwner,
    error: ownerError
  } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    functionName: 'owner',
    chainId: baseSepolia.id,
  });

  const isAdmin = ownerAddress && address && 
    typeof ownerAddress === 'string' && 
    ownerAddress.toLowerCase() === address.toLowerCase();

  // Update voting status when it changes
  useEffect(() => {
    if (votingOpen !== undefined) {
      setIsVotingOpen(Boolean(votingOpen));
    }
  }, [votingOpen]);

  // Update loading state
  useEffect(() => {
    setIsLoading(isLoadingProposalCount || isLoadingVotingStatus);
  }, [isLoadingProposalCount, isLoadingVotingStatus]);

  // Update error state
  useEffect(() => {
    if (proposalCountError || votingStatusError) {
      setError(proposalCountError?.message || votingStatusError?.message || 'An error occurred');
    } else {
      setError(null);
    }
  }, [proposalCountError, votingStatusError]);

  // Fetch all proposals
  useEffect(() => {
    const fetchProposals = async () => {
      if (!proposalCount) return;
      
      try {
        setIsLoading(true);
        const count = Number(proposalCount);
        const proposalPromises = [];
        
        for (let i = 0; i < count; i++) {
          const result = await useReadContract({
            address: VOTING_CONTRACT_ADDRESS,
            abi: votingContractABI,
            functionName: 'proposals',
            args: [BigInt(i)],
            chainId: baseSepolia.id,
          });
          
          if (result.data) {
            // Type assertion pour indiquer que data est un tuple [string, bigint]
            const proposalData = result.data as [string, bigint];
            proposalPromises.push({
              id: i,
              name: String(proposalData[0] || ''),
              voteCount: Number(proposalData[1] || 0),
            });
          }
        }
        
        setProposals(proposalPromises);
      } catch (err) {
        console.error('Error fetching proposals:', err);
        setError('Failed to load proposals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [proposalCount]);

  // Vote for a proposal
  const vote = async (proposalId: number) => {
    if (!address) {
      setError('Please connect your wallet to vote');
      return false;
    }

    try {
      setIsLoading(true);
      
      await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: votingContractABI,
        functionName: 'vote',
        args: [BigInt(proposalId)],
        chainId: baseSepolia.id,
      });
      
      // Refresh data after voting
      await Promise.all([refetchProposalCount(), refetchVotingStatus()]);
      return true;
    } catch (err: any) {
      console.error('Error voting:', err);
      setError(err.message || 'Failed to cast vote');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new proposal (admin only)
  const addProposal = async (name: string) => {
    if (!address) {
      setError('Please connect your wallet');
      return false;
    }

    try {
      setIsLoading(true);
      
      await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: votingContractABI,
        functionName: 'addProposal',
        args: [name],
        chainId: baseSepolia.id,
      });
      
      // Refresh data after adding proposal
      await refetchProposalCount();
      toast.success(`Proposal "${name}" added successfully!`);
      return true;
    } catch (err: any) {
      console.error('Error adding proposal:', err);
      const errorMessage = err.message || 'Failed to add proposal';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get owner
  const { data: owner } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    functionName: 'owner',
    chainId: baseSepolia.id,
  });

  // Get voter info
  const { data: voterInfo } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    functionName: 'voters',
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address,
    },
  });

  // Admin functions
  const isAdmin = address?.toLowerCase() === owner?.toLowerCase();

  const openVoting = async () => {
    try {
      await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: votingContractABI,
        functionName: 'openVoting',
        chainId: baseSepolia.id,
      });
      toast.success('Voting has been opened!');
      await refetchVotingStatus();
    } catch (error) {
      console.error('Error opening voting:', error);
      toast.error('Failed to open voting');
      throw error;
    }
  };

  const closeVoting = async () => {
    try {
      await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: votingContractABI,
        functionName: 'closeVoting',
        chainId: baseSepolia.id,
      });
      toast.success('Voting has been closed!');
      await refetchVotingStatus();
    } catch (error) {
      console.error('Error closing voting:', error);
      toast.error('Failed to close voting');
      throw error;
    }
  };

// Add a new proposal (admin only)
const addProposal = async (name: string) => {
  if (!address) {
    setError('Please connect your wallet');
    return false;
  }

  try {
    setIsLoading(true);
    
    await writeContractAsync({
      address: VOTING_CONTRACT_ADDRESS,
      abi: votingContractABI,
      functionName: 'addProposal',
      args: [name],
      chainId: baseSepolia.id,
    });
    
    // Refresh data after adding proposal
    await refetchProposalCount();
    toast.success(`Proposal "${name}" added successfully!`);
    return true;
  } catch (err: any) {
    console.error('Error adding proposal:', err);
    const errorMessage = err.message || 'Failed to add proposal';
    setError(errorMessage);
    toast.error(errorMessage);
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Get owner
const { data: owner } = useReadContract({
  address: VOTING_CONTRACT_ADDRESS,
  abi: votingContractABI,
  functionName: 'owner',
  chainId: baseSepolia.id,
});

// Get voter info
const { data: voterInfo } = useReadContract({
  address: VOTING_CONTRACT_ADDRESS,
  abi: votingContractABI,
  functionName: 'voters',
  args: address ? [address] : undefined,
  chainId: baseSepolia.id,
  query: {
    enabled: !!address,
  },
});

// Admin functions
const isAdmin = address?.toLowerCase() === owner?.toLowerCase();

const openVoting = async () => {
  try {
    await writeContractAsync({
      address: VOTING_CONTRACT_ADDRESS,
      abi: votingContractABI,
      functionName: 'openVoting',
      chainId: baseSepolia.id,
    });
    toast.success('Voting has been opened!');
    await refetchVotingStatus();
  } catch (error) {
    console.error('Error opening voting:', error);
    toast.error('Failed to open voting');
    throw error;
  }
};

const closeVoting = async () => {
  try {
    await writeContractAsync({
      address: VOTING_CONTRACT_ADDRESS,
      abi: votingContractABI,
      functionName: 'closeVoting',
      chainId: baseSepolia.id,
    });
    toast.success('Voting has been closed!');
    await refetchVotingStatus();
  } catch (error) {
    console.error('Error closing voting:', error);
    toast.error('Failed to close voting');
    throw error;
  }
};
return {
  proposals,
  isVotingOpen,
  isAdmin,
  isLoading,
  error,
  vote,
  addProposal,
  openVoting,
  closeVoting,
  refetch: async () => {
    await Promise.all([refetchProposalCount(), refetchVotingStatus()]);
  },
  votedProposalId: voterInfo ? Number((voterInfo as any)[1]) : -1,
};
};

export default useVoting;
