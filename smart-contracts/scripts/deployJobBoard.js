const hre = require("hardhat");

async function main() {
  const platformFee = hre.ethers.parseEther("0.001"); // Set the initial fee to 0.001 ETH/MATIC

  const jobBoard = await hre.ethers.deployContract("JobBoard", [platformFee]);

  await jobBoard.waitForDeployment();

  console.log(
    `JobBoard contract with a fee of ${hre.ethers.formatEther(platformFee)} ETH deployed to ${jobBoard.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});