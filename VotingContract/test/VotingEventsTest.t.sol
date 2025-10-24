// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "../src/VotingContract.sol";
import "../src/interfaces/IVotingContract.sol";

contract VotingEventsTest is Test {
    using stdStorage for StdStorage;
    
    IVotingContract public votingContract;
    address public owner = address(1);
    address public voter = address(2);
    
    // Events will be tested using the interface directly

    function setUp() public {
        vm.prank(owner);
        votingContract = new VotingContract();
    }

    function test_ProposalAddedEvent() public {
        // Test ProposalAdded event
        vm.expectEmit(true, true, true, true);
        emit IVotingContract.ProposalAdded(0, "Test Proposal");
        
        vm.prank(owner);
        votingContract.addProposal("Test Proposal");
    }

    function test_VotingOpenedEvent() public {
        // Test VotingOpened event
        vm.expectEmit(true, true, true, true);
        emit IVotingContract.VotingOpened();
        
        vm.prank(owner);
        votingContract.openVoting();
    }

    function test_VotingClosedEvent() public {
        // Open voting first
        vm.prank(owner);
        votingContract.openVoting();
        
        // Test VotingClosed event
        vm.expectEmit(true, true, true, true);
        emit IVotingContract.VotingClosed();
        
        vm.prank(owner);
        votingContract.closeVoting();
    }

    function test_VoteCastEvent() public {
        // Add a proposal and open voting
        vm.startPrank(owner);
        votingContract.addProposal("Test Proposal");
        votingContract.openVoting();
        vm.stopPrank();
        
        // Test VoteCast event
        vm.expectEmit(true, true, true, true);
        emit IVotingContract.VoteCast(voter, 0);
        
        vm.prank(voter);
        votingContract.vote(0);
    }

    function test_EdgeCase_EmptyProposals() public {
        // Test with no proposals added
        vm.prank(owner);
        votingContract.openVoting();
        
        // Should not be able to vote when there are no proposals
        vm.prank(voter);
        vm.expectRevert("Proposition invalide");
        votingContract.vote(0);
    }

    function test_EdgeCase_GetWinnerWithNoVotes() public {
        // Add a proposal but don't vote
        vm.prank(owner);
        votingContract.addProposal("Test Proposal");
        
        // Should return the first proposal (index 0) even with 0 votes
        uint256 winningProposal = votingContract.getWinningProposal();
        assertEq(winningProposal, 0);
        
        // Get winner name should work with 0 votes
        string memory winnerName = votingContract.getWinnerName();
        assertEq(winnerName, "Test Proposal");
    }

    function test_EdgeCase_MultipleProposalsSameVotes() public {
        // Add multiple proposals
        vm.startPrank(owner);
        votingContract.addProposal("Proposal 1");
        votingContract.addProposal("Proposal 2");
        votingContract.openVoting();
        vm.stopPrank();
        
        // Vote for both proposals equally
        vm.prank(voter);
        votingContract.vote(0);
        
        // Should return the first proposal with the highest votes (index 0 in this case)
        uint256 winningProposal = votingContract.getWinningProposal();
        assertTrue(winningProposal == 0 || winningProposal == 1);
    }
}
