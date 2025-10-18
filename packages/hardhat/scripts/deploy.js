const hre = require("hardhat");

async function main() {
  
  const DataCollector = await hre.ethers.getContractFactory("DataCollector");

  const collector = await DataCollector.deploy();

  console.log("DataCollector deployed to:", collector.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
