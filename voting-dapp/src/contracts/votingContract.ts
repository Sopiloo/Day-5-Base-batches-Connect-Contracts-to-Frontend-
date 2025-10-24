import { VotingContract } from '@/contracts/types';
import votingContractABI from './VotingContractABI.json';
import { useContract, useProvider, useSigner } from 'wagmi';
import { baseSepolia } from 'viem/chains';

// Replace with your deployed contract address
const VOTING_CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';

export const useVotingContract = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  const contract = useContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: votingContractABI,
    signerOrProvider: signer || provider,
  }) as unknown as VotingContract;

  return contract;
};

// Contract event types
export type VotingEvent = 
  | { type: 'ProposalAdded'; proposalId: number; name: string; }
  | { type: 'VoteCast'; voter: string; proposalId: number; }
  | { type: 'VotingOpened' }
  | { type: 'VotingClosed' };
