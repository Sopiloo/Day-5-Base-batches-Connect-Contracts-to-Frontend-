// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "../src/VotingContract.sol";
import "../src/interfaces/IVotingContract.sol";

contract VotingTest is Test {
    using stdStorage for StdStorage;
    
    IVotingContract public votingContract;
    address public owner = address(1);
    address public voter1 = address(2);
    address public voter2 = address(3);
    address public voter3 = address(4);
    
    string[] public proposalNames = ["Proposal A", "Proposal B", "Proposal C"];

    function setUp() public {
        // Deploy the contract as the owner
        vm.prank(owner);
        votingContract = new VotingContract();
        
        // Add proposals as the owner
        vm.startPrank(owner);
        for (uint i = 0; i < proposalNames.length; i++) {
            votingContract.addProposal(proposalNames[i]);
        }
        
        // Open voting as the owner
        votingContract.openVoting();
        vm.stopPrank();
    }

    function test_Vote() public {
        // Test event emission for voter1's vote
        vm.expectEmit(true, true, true, true);
        emit IVotingContract.VoteCast(voter1, 0);
        
        // Voter1 votes for proposal 0
        vm.prank(voter1);
        votingContract.vote(0);
        
        // Check voter's state
        (bool hasVoted, uint256 votedProposalId) = votingContract.voters(voter1);
        assertTrue(hasVoted);
        assertEq(votedProposalId, 0);
        
        // Check proposal vote count
        (, uint256 voteCount) = votingContract.proposals(0);
        assertEq(voteCount, 1);
    }

    function test_CannotVoteTwice() public {
        // First vote should succeed
        vm.prank(voter1);
        votingContract.vote(0);
        
        // Second vote should fail
        vm.prank(voter1);
        vm.expectRevert("Deja vote");
        votingContract.vote(1);
        
        // Verify the vote count didn't change
        (, uint256 voteCount) = votingContract.proposals(0);
        assertEq(voteCount, 1);
    }

    function test_CannotVoteOnInvalidProposal() public {
        vm.prank(voter1);
        vm.expectRevert("Proposition invalide");
        votingContract.vote(proposalNames.length);
    }

    function test_CannotVoteWhenVotingClosed() public {
        // Close voting
        vm.prank(owner);
        votingContract.closeVoting();
        
        // Try to vote
        vm.prank(voter1);
        vm.expectRevert("Le vote n'est pas ouvert");
        votingContract.vote(0);
    }

    function test_GetWinningProposal() public {
        // Vote for different proposals
        vm.prank(voter1);
        votingContract.vote(0); // Proposal A: 1 vote
        
        vm.prank(voter2);
        votingContract.vote(1); // Proposal B: 1 vote
        
        vm.prank(voter3);
        votingContract.vote(0); // Proposal A: 2 votes
        
        // Close voting
        vm.prank(owner);
        votingContract.closeVoting();
        
        // Proposal A should be the winner with 2 votes
        uint256 winningProposalId = votingContract.getWinningProposal();
        assertEq(winningProposalId, 0);
        
        // Get winner name
        string memory winnerName = votingContract.getWinnerName();
        assertEq(winnerName, proposalNames[0]);
    }

    function test_TieScenario() public {
        // Create a tie between two proposals
        vm.prank(voter1);
        votingContract.vote(0); // Proposal A: 1 vote
        
        vm.prank(voter2);
        votingContract.vote(1); // Proposal B: 1 vote
        
        // In case of a tie, the first proposal with the highest votes is returned
        uint256 winningProposalId = votingContract.getWinningProposal();
        assertTrue(winningProposalId == 0 || winningProposalId == 1);
    }

    function test_GetProposalCount() public {
        uint256 count = votingContract.getProposalCount();
        assertEq(count, proposalNames.length);
    }
}
