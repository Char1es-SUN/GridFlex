import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployEventStorage: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying EventStorage contract...");

  const eventStorage = await deploy("EventStorage", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("EventStorage deployed to:", eventStorage.address);
};

export default deployEventStorage;
deployEventStorage.tags = ["EventStorage"];
