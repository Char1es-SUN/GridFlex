const hre = require("hardhat");

async function main() {
  
  const DataCollector = await hre.ethers.getContractFactory("DataCollector");

  const dataCollector = await DataCollector.deploy();

  console.log("DataCollector deployed to:", dataCollector.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
