const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...");

  // Get the contract factory
  const GetSet = await ethers.getContractFactory("GetSet");

  // Deploy the contract (add constructor args if required)
  const contract = await GetSet.deploy();

  console.log("⏳ Waiting for contract deployment...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract successfully deployed to: ${contractAddress}`);

  // Save contract details for frontend
  saveFrontendFiles(contract, "GetSet");
}

/**
 * Saves contract address and ABI for frontend integration
 */
function saveFrontendFiles(contract, name) {
  const contractsDir = path.join(__dirname, "../src/contract_data");

  // Ensure directory exists
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save contract address
  fs.writeFileSync(
    path.join(contractsDir, `${name}-address.json`),
    JSON.stringify({ address: contract.target }, null, 2)
  );

  // Save contract ABI
  const contractArtifact = artifacts.readArtifactSync(name);
  fs.writeFileSync(
    path.join(contractsDir, `${name}.json`),
    JSON.stringify(contractArtifact, null, 2)
  );

  console.log(`📁 Contract artifacts saved to ${contractsDir}`);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
