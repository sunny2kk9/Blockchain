require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: { chainId: 1337 },
    localhost: { url: "http://127.0.0.1:8545" },
    ...(process.env.ALCHEMY_URL && process.env.PRIVATE_KEY && {
      sepolia: {
        url: process.env.ALCHEMY_URL,
        accounts: [process.env.PRIVATE_KEY],
      },
    }),
  },
};

