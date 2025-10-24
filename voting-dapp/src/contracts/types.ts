import { ContractInterface } from 'ethers';

export interface VotingContract extends ContractInterface {
  // Properties
  votingOpen(): Promise<boolean>;
  owner(): Promise<string>;
  
  // Views
  getProposalCount(): Promise<bigint>;
  getWinningProposal(): Promise<bigint>;
  getWinnerName(): Promise<string>;
  proposals(arg0: bigint): Promise<{ name: string; voteCount: bigint }>;
  voters(arg0: string): Promise<{ hasVoted: boolean; votedProposalId: bigint }>;
  
  // Transactions
  addProposal(name: string): Promise<any>;
  vote(proposalId: bigint): Promise<any>;
  openVoting(): Promise<any>;
  closeVoting(): Promise<any>;
  
  // Events
  on(event: 'ProposalAdded', listener: (proposalId: bigint, name: string) => void): this;
  on(event: 'VoteCast', listener: (voter: string, proposalId: bigint) => void): this;
  on(event: 'VotingOpened', listener: () => void): this;
  on(event: 'VotingClosed', listener: () => void): this;
  
  // Remove event listeners
  off(event: string, listener: (...args: any[]) => void): this;
}

export type Proposal = {
  id: number;
  name: string;
  voteCount: number;
};

export type Voter = {
  hasVoted: boolean;
  votedProposalId: number;
};
