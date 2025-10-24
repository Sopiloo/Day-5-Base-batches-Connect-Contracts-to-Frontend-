import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { VotingContract, VotingContract__factory } from "../typechain-types";

dotenv.config();

async function main() {
  console.log("Deploying VotingContract to Base Sepolia...");
  
  // Get the deployer's address
  const [deployer]: HardhatEthersSigner[] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Account balance: ${(await deployer.provider?.getBalance(deployer.address))?.toString() || '0'}`);

  // Deploy the contract
  const VotingContractFactory: VotingContract__factory = await ethers.getContractFactory("VotingContract");
  const votingContract: VotingContract = await VotingContractFactory.deploy();
  
  await votingContract.waitForDeployment();
  
  console.log(`VotingContract deployed to: ${await votingContract.getAddress()}`);
  console.log(`Transaction hash: ${votingContract.deploymentTransaction()?.hash}`);
  
  // Verify the contract on BaseScan
  console.log("Waiting for block confirmations...");
  await votingContract.deploymentTransaction()?.wait(5);
  
  console.log("Deployment completed!");
  console.log("\nNext steps:");
  console.log(`1. Update the contract address in the frontend: ${await votingContract.getAddress()}`);
  console.log("2. Run the verification command (if needed):");
  console.log(`   npx hardhat verify --network baseSepolia ${await votingContract.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
