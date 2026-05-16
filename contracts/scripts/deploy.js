const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const AsyncLending = await ethers.getContractFactory("AsyncLending");
  const contract = await AsyncLending.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AsyncLending deployed to:", address);

  // Fund the contract pool
  const fundTx = await contract.depositFunds({ value: ethers.parseEther("0.1") });
  await fundTx.wait();
  console.log("Contract funded with 0.1 ETH");

  console.log("\n--- Deployment Summary ---");
  console.log("Contract Address:", address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Block:", await ethers.provider.getBlockNumber());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
