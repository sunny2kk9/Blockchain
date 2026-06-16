const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // Get signer (deployer) and show some info
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with account:', await deployer.getAddress());
    try {
        const bal = await deployer.getBalance();
        console.log('Deployer balance (wei):', bal.toString());
    } catch (e) {
        // ignore if provider doesn't support balance
    }

    // Get the contract factory connected to the deployer
    const ContractFactory = await ethers.getContractFactory("GetSet", deployer);

    // Deploy the contract
    const contract = await ContractFactory.deploy(/* constructor arguments if any */);

    // Wait for deployment to complete
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`Contract deployed to: ${contractAddress}`);

    // Save contract details for the frontend
    await saveFrontendFiles(contract, "GetSet");
}

async function saveFrontendFiles(contract, name) {
    const contractsDir = path.join(__dirname, "../src/contract_data/");

    // Ensure the directory exists
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Prefer using getAddress() result (works with ethers v6)
    let address;
    try {
        address = await contract.getAddress();
    } catch (e) {
        // Fallback to contract.target if available
        address = contract.target || null;
    }

    // Save contract address and metadata
    const addressFile = path.join(contractsDir, `${name}-address.json`);
    fs.writeFileSync(
        addressFile,
        JSON.stringify({ address }, null, 2)
    );

    // Save contract ABI / artifact
    const contractArtifact = artifacts.readArtifactSync(name);
    fs.writeFileSync(
        path.join(contractsDir, `${name}.json`),
        JSON.stringify(contractArtifact, null, 2)
    );

    console.log(`Saved contract files to ${contractsDir}`);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
