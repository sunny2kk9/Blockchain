const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Entry point for deployment. This function deploys the GetSet contract,
 * waits for it to be mined, verifies the deployment, and then persists
 * the ABI and address for use in a frontend.
 */
async function main() {
    // Optional pre-deploy diagnostics
    await logEnvironmentSnapshot();

    // Obtain a contract factory for the GetSet contract
    const ContractFactory = await ethers.getContractFactory("GetSet");
    console.log("[deploy] ContractFactory prepared for: GetSet");

    // Trigger the deployment transaction (add constructor args if needed)
    const contract = await ContractFactory.deploy(/* constructor arguments if any */);
    console.log(`[deploy] Sent deployment tx: ${safeTxHash(contract)}`);

    // Wait for the deployment transaction to be confirmed and contract to be ready
    await contract.waitForDeployment();
    console.log("[deploy] Deployment transaction confirmed");

    // Retrieve the deployed address from the contract instance
    const contractAddress = await contract.getAddress();
    console.log(`[deploy] Contract deployed to: ${contractAddress}`);

    // Basic on-chain verification: ensure code exists at the deployed address
    await verifyDeployedBytecode(contractAddress);

    // Persist artifacts for the frontend (address + ABI)
    saveFrontendFiles(contract, "GetSet");

    console.log("[deploy] Done");
}

/**
 * Persist the deployed address and ABI to a known frontend directory.
 * Keeps variable names identical to the original implementation.
 */
function saveFrontendFiles(contract, name) {
    const contractsDir = path.join(__dirname, "../src/contract_data/");

    // Ensure the directory exists (create if missing)
    try {
        if (!fs.existsSync(contractsDir)) {
            fs.mkdirSync(contractsDir, { recursive: true });
            console.log(`[files] Created directory: ${contractsDir}`);
        } else {
            console.log(`[files] Using existing directory: ${contractsDir}`);
        }
    } catch (err) {
        console.error(`[files] Failed ensuring directory: ${contractsDir}`);
        throw err;
    }

    // Persist the contract address (uses contract.target for ethers v6)
    try {
        fs.writeFileSync(
            path.join(contractsDir, `${name}-address.json`),
            JSON.stringify({ address: contract.target }, null, 2)
        );
        console.log(`[files] Wrote address file: ${name}-address.json`);
    } catch (err) {
        console.error("[files] Failed writing address file");
        throw err;
    }

    // Persist the contract ABI artifact
    try {
        const contractArtifact = artifacts.readArtifactSync(name);
        fs.writeFileSync(
            path.join(contractsDir, `${name}.json`),
            JSON.stringify(contractArtifact, null, 2)
        );
        console.log(`[files] Wrote ABI file: ${name}.json`);
    } catch (err) {
        console.error("[files] Failed writing ABI file");
        throw err;
    }
}

/**
 * Log some environment context useful for debugging deployments.
 */
async function logEnvironmentSnapshot() {
    try {
        const [deployer] = await ethers.getSigners();
        const balance = await ethers.provider.getBalance(deployer.address);
        const network = await ethers.provider.getNetwork();

        console.log(`[env] Deployer: ${deployer.address}`);
        console.log(`[env] Balance: ${ethers.formatEther(balance)} ETH`);
        console.log(`[env] Network: chainId=${network.chainId} name=${network.name ?? "unknown"}`);
    } catch {
        // Non-fatal; continue even if diagnostics fail
        console.log("[env] Skipped environment snapshot");
    }
}

/**
 * Verify that there is bytecode at the deployed address.
 */
async function verifyDeployedBytecode(address) {
    try {
        const code = await ethers.provider.getCode(address);
        if (!code || code === "0x") {
            throw new Error(`No bytecode found at ${address}`);
        }
        console.log("[verify] On-chain bytecode detected");
    } catch (err) {
        console.error("[verify] Bytecode verification failed");
        throw err;
    }
}

/**
 * Safely access the deployment transaction hash if available.
 */
function safeTxHash(contract) {
    try {
        const tx = contract.deploymentTransaction && contract.deploymentTransaction();
        return tx && tx.hash ? tx.hash : "(pending or unavailable)";
    } catch {
        return "(unavailable)";
    }
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
