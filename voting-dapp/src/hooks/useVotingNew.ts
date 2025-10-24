import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import votingContractABI from '@/contracts/VotingContractABI.json';

export const VOTING_CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS'; // Replace with your deployed contract address

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
  
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
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
          proposalPromises.push(
            useReadContract({
              address: VOTING_CONTRACT_ADDRESS,
              abi: votingContractABI,
              functionName: 'proposals',
              args: [BigInt(i)],
              chainId: baseSepolia.id,
            })
          );
        }
        
        const proposalResults = await Promise.all(proposalPromises);
        const formattedProposals = proposalResults.map((result: any, index: number) => ({
          id: index,
          name: result.data?.[1] || '',
          voteCount: Number(result.data?.[2] || 0),
        }));
        
        setProposals(formattedProposals);
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
      return true;
    } catch (err: any) {
      console.error('Error adding proposal:', err);
      setError(err.message || 'Failed to add proposal');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle voting status (admin only)
  const toggleVotingStatus = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return false;
    }

    try {
      setIsLoading(true);
      
      await writeContractAsync({
        address: VOTING_CONTRACT_ADDRESS,
        abi: votingContractABI,
        functionName: 'toggleVotingStatus',
        chainId: baseSepolia.id,
      });
      
      // Refresh voting status
      await refetchVotingStatus();
      return true;
    } catch (err: any) {
      console.error('Error toggling voting status:', err);
      setError(err.message || 'Failed to toggle voting status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the connected wallet is the admin
  const { data: isAdmin } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    functionName: 'admin',
    chainId: baseSepolia.id,
    query: {
      select: (data) => data?.toLowerCase() === address?.toLowerCase(),
    },
  });

  // Get voter info
  const { data: voterInfo } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    functionName: 'voters',
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    enabled: !!address,
  });

  return {
    proposals,
    isVotingOpen,
    isLoading,
    error,
    vote,
    addProposal,
    toggleVotingStatus,
    isAdmin: !!isAdmin,
    hasVoted: voterInfo ? Boolean(voterInfo[0]) : false,
    votedProposalId: voterInfo ? Number(voterInfo[1]) : -1,
  };
};

export default useVoting;
