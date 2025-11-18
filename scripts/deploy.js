const { ethers } = require("hardhat");


async function main() {
  console.log("Deploying Storage contract...");

  // Get the contract factory
  const Storage = await ethers.getContractFactory("Storage");
  
  // Deploy the contract
  const storage = await Storage.deploy();

  await storage.waitForDeployment();

  const address = await storage.getAddress();
  console.log("Storage contract deployed to:", address);

  // Get the initial value
  const initialValue = await storage.getValue();
  console.log("Initial stored value:", initialValue.toString());

  // Save contract address to a file for frontend use
  const fs = require("fs");
  const hre = require("hardhat");
  const contractInfo = {
    address: address,
    network: hre.network.name,
    chainId: hre.network.config.chainId
  };
  
  fs.writeFileSync(
    "./frontend/src/contractInfo.json",
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("Contract info saved to frontend/src/contractInfo.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

