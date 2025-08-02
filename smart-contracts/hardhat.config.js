require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Hardhat's local network is enabled by default.
      // No extra configuration is needed here for a basic local deployment.
    }
  }
};