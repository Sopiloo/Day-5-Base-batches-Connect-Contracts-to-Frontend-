// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IVotingContract.sol";

/// @title VotingContract - Un contrat de vote simple en Solidity
/// @author 
/// @notice Permet d'ajouter des propositions et de voter une seule fois
contract VotingContract is IVotingContract {

    // Structs are defined in the IVotingContract interface

    // Adresse de l'administrateur (créateur du contrat)
    address public owner;

    // Liste des propositions
    Proposal[] public proposals;

    // Liste des électeurs enregistrés
    mapping(address => Voter) public voters;

    // État du vote
    bool public votingOpen;

    // Events are defined in the IVotingContract interface

    // Modificateurs
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le proprietaire peut faire cela");
        _;
    }

    modifier votingIsOpen() {
        require(votingOpen, "Le vote n'est pas ouvert");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Fonction pour ajouter une proposition
    function addProposal(string memory _name) external onlyOwner {
        proposals.push(Proposal({name: _name, voteCount: 0}));
        emit ProposalAdded(proposals.length - 1, _name);
    }

    // Fonction pour ouvrir les votes
    function openVoting() external onlyOwner {
        require(!votingOpen, "Le vote est deja ouvert");
        votingOpen = true;
        emit VotingOpened();
    }

    // Fonction pour fermer les votes
    function closeVoting() external onlyOwner {
        require(votingOpen, "Le vote est deja ferme");
        votingOpen = false;
        emit VotingClosed();
    }

    // Fonction pour voter
    function vote(uint256 _proposalId) external votingIsOpen {
        require(_proposalId < proposals.length, "Proposition invalide");
        Voter storage sender = voters[msg.sender];
        require(!sender.hasVoted, "Deja vote");

        sender.hasVoted = true;
        sender.votedProposalId = _proposalId;

        proposals[_proposalId].voteCount += 1;

        emit VoteCast(msg.sender, _proposalId);
    }

    // Fonction pour récupérer le gagnant
    function getWinningProposal() public view returns (uint256 winningProposalId) {
        uint256 highestVotes = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > highestVotes) {
                highestVotes = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
    }

    // Fonction pour obtenir le nom du gagnant
    function getWinnerName() external view returns (string memory winnerName) {
        winnerName = proposals[getWinningProposal()].name;
    }

    // Récupérer le nombre total de propositions
    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }
}
