const { ethers } = require("ethers");

/**
 * Script to fund a MetaMask account with ETH from Hardhat test accounts
 * Usage: ACCOUNT_ADDRESS=0x... AMOUNT=100 npm run fund
 * 
 * This script connects directly to the Hardhat node running on localhost:8545
 * and uses the first test account (which has 10,000 ETH) to fund your MetaMask account.
 */
async function main() {
  // Get arguments from environment
  const accountAddress = process.env.ACCOUNT_ADDRESS;
  const amountInEth = process.env.AMOUNT || "100";

  if (!accountAddress) {
    console.error("❌ Error: Please provide an account address to fund");
    console.log("\nUsage:");
    console.log("  ACCOUNT_ADDRESS=0x1234...5678 AMOUNT=100 npm run fund");
    console.log("\nExample:");
    console.log("  ACCOUNT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3 AMOUNT=100 npm run fund");
    process.exit(1);
  }

  console.log(`\n💰 Funding account ${accountAddress} with ${amountInEth} ETH...\n`);

  // Connect to localhost Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Hardhat's first test account private key (this account has 10,000 ETH)
  // This is the default first account that Hardhat creates
  const testAccountPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  
  // Create wallet from private key
  const wallet = new ethers.Wallet(testAccountPrivateKey, provider);
  const signerAddress = await wallet.getAddress();
  
  console.log(`📤 Sending from: ${signerAddress}`);
  console.log(`📥 Sending to: ${accountAddress}`);

  // Convert ETH amount to Wei
  const amountInWei = ethers.parseEther(amountInEth);

  // Check wallet balance
  try {
    const signerBalance = await provider.getBalance(signerAddress);
    console.log(`\n💵 Sender balance: ${ethers.formatEther(signerBalance)} ETH`);

    if (signerBalance < amountInWei) {
      console.error(`❌ Error: Insufficient balance. Need ${amountInEth} ETH but only have ${ethers.formatEther(signerBalance)} ETH`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error connecting to Hardhat node:", error.message);
    console.error("\nMake sure:");
    console.error("1. Hardhat node is running: npm run node");
    console.error("2. The node is running on http://127.0.0.1:8545");
    process.exit(1);
  }

  // Send ETH
  try {
    const tx = await wallet.sendTransaction({
      to: accountAddress,
      value: amountInWei,
    });

    console.log(`\n⏳ Transaction sent: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");

    await tx.wait();

    // Check new balance
    const newBalance = await provider.getBalance(accountAddress);
    console.log(`\n✅ Success! Account funded.`);
    console.log(`💵 New balance: ${ethers.formatEther(newBalance)} ETH\n`);
  } catch (error) {
    console.error("❌ Error funding account:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

