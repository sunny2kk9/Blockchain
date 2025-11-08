require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28", // keep your version, perfectly fine
  networks: {
    hardhat: {
      chainId: 1337, // important for MetaMask local testing
    },
    localhost: {
      url: "http://127.0.0.1:8545", // when running `npx hardhat node`
      chainId: 1337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
