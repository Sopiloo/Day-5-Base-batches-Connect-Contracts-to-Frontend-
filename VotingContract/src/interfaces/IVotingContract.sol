// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IVotingContract {
    struct Voter {
        bool hasVoted;
        uint256 votedProposalId;
    }
    
    struct Proposal {
        string name;
        uint256 voteCount;
    }
    
    event ProposalAdded(uint256 proposalId, string name);
    event VoteCast(address indexed voter, uint256 proposalId);
    event VotingOpened();
    event VotingClosed();
    
    // State variables
    function owner() external view returns (address);
    function votingOpen() external view returns (bool);
    
    // Voter and Proposal views
    function voters(address) external view returns (bool, uint256);
    function proposals(uint256) external view returns (string memory, uint256);
    
    // Functions
    function addProposal(string memory _name) external;
    function openVoting() external;
    function closeVoting() external;
    function vote(uint256 _proposalId) external;
    function getWinningProposal() external view returns (uint256);
    function getWinnerName() external view returns (string memory);
    function getProposalCount() external view returns (uint256);
}
