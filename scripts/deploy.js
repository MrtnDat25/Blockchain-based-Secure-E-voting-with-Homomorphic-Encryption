const hre = require("hardhat");

async function main() {
  const ElectionFactory = await hre.ethers.getContractFactory("ElectionFactory");

  const factory = await ElectionFactory.deploy();

  await factory.waitForDeployment();

  console.log("Contract deployed to:", await factory.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });