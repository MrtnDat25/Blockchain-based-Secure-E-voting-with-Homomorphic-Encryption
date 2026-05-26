const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();

  console.log("Deploying from:", accounts[0].address);

  const Factory = await hre.ethers.getContractFactory("ElectionFactory");

  const factory = await Factory.deploy();

  await factory.waitForDeployment();

  console.log("Contract:", await factory.getAddress());
}

main();