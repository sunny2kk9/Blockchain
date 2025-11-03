const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("LendingAndBorrowing"); // replace with your contract name if different
  const contract = await Contract.deploy();

  await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
