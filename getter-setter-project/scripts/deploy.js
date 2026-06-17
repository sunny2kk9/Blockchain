const hre = require("hardhat");

async function main() {
  const initial = "Hello, world!";

  // Get the contract factory
  const GetterSetter = await hre.ethers.getContractFactory("GetterSetter");

  // Deploy contract (ethers v6 syntax)
  const contract = await GetterSetter.deploy(initial);

  // Wait for deployment to finish
  await contract.waitForDeployment();

  // Print the deployed address
  console.log("GetterSetter deployed to:", await contract.getAddress());
}

// Run the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
