// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {VotingContract} from "../src/VotingContract.sol";

contract DeployVotingContract is Script {
    function run() external {
        // Hardcoded private key for testing (REPLACE WITH YOUR PRIVATE KEY)
        uint256 deployerPrivateKey = PRIVATE_KEY;
        
        // Get the deployer address from the private key
        address deployer = vm.addr(deployerPrivateKey);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        VotingContract votingContract = new VotingContract();
        
        // Log the deployed contract address
        console.log("VotingContract deployed to:", address(votingContract));
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
    }
}
