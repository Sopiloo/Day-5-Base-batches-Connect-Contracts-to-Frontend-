// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "../src/VotingContract.sol";

contract VotingContractTest is Test {
    VotingContract public votingContract;
    address public owner = address(1);
    address public voter1 = address(2);
    address public voter2 = address(3);
    address public nonVoter = address(4);
    string[] public proposalNames = ["Proposal 1", "Proposal 2", "Proposal 3"];

    function setUp() public {
        vm.startPrank(owner);
        votingContract = new VotingContract();
        
        // Add some proposals
        for (uint i = 0; i < proposalNames.length; i++) {
            votingContract.addProposal(proposalNames[i]);
        }
        
        // Open voting
        votingContract.openVoting();
        vm.stopPrank();
    }
}

contract VotingContractAdminTest is Test {
    VotingContract public votingContract;
    address public owner = address(1);
    address public nonOwner = address(2);

    function setUp() public {
        vm.prank(owner);
        votingContract = new VotingContract();
    }

    function test_InitialState() public {
        assertEq(votingContract.owner(), owner);
        assertEq(votingContract.votingOpen(), false);
        assertEq(votingContract.getProposalCount(), 0);
    }

    function test_AddProposal() public {
        vm.prank(owner);
        votingContract.addProposal("New Proposal");
        
        (string memory name, uint256 voteCount) = votingContract.proposals(0);
        assertEq(name, "New Proposal");
        assertEq(voteCount, 0);
        assertEq(votingContract.getProposalCount(), 1);
    }

    function test_OnlyOwnerCanAddProposal() public {
        vm.prank(nonOwner);
        vm.expectRevert("Seul le proprietaire peut faire cela");
        votingContract.addProposal("Should Fail");
    }

    function test_OpenVoting() public {
        vm.prank(owner);
        votingContract.openVoting();
        
        assertTrue(votingContract.votingOpen());
    }

    function test_OnlyOwnerCanOpenVoting() public {
        vm.prank(nonOwner);
        vm.expectRevert("Seul le proprietaire peut faire cela");
        votingContract.openVoting();
    }

    function test_CannotOpenVotingIfAlreadyOpen() public {
        vm.startPrank(owner);
        votingContract.openVoting();
        
        // Should revert with the correct error message
        vm.expectRevert("Le vote est deja ouvert");
        votingContract.openVoting();
        vm.stopPrank();
    }

    function test_CloseVoting() public {
        vm.prank(owner);
        votingContract.openVoting();
        
        vm.prank(owner);
        votingContract.closeVoting();
        
        assertFalse(votingContract.votingOpen());
    }

    function test_OnlyOwnerCanCloseVoting() public {
        vm.prank(nonOwner);
        vm.expectRevert("Seul le proprietaire peut faire cela");
        votingContract.closeVoting();
    }

    function test_CannotCloseVotingIfAlreadyClosed() public {
        vm.prank(owner);
        vm.expectRevert("Le vote est deja ferme");
        votingContract.closeVoting();
    }
}
