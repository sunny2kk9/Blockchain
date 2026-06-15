const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying GetterSetter contract...");

  const GetterSetter = await hre.ethers.getContractFactory("GetterSetter");
  const contract = await GetterSetter.deploy();
  await contract.deployed();

  console.log("✅ Contract successfully deployed!");
  console.log("📍 Contract Address:", contract.address);
  const fs = require("fs");
  const path = "./deployment-info.json";
  const info = {
    address: contract.address,
    abi: contract.interface.format("json"),
  };
  fs.writeFileSync(path, JSON.stringify(info, null, 2));
  console.log("📝 Deployment info saved to deployment-info.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
