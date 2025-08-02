// smart-contracts/hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Use the new, more generic variable name
const { MUMBAI_RPC_URL, MUMBAI_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    mumbai: {
      url: MUMBAI_RPC_URL, // Use the updated variable
      accounts: [MUMBAI_PRIVATE_KEY],
    },
  },
};