import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHEDataCollector = await deploy("FHEDataCollector", {
    from: deployer,
    log: true,
  });

  console.log(`FHEDataCollector contract: `, deployedFHEDataCollector.address);
};
export default func;
func.id = "deploy_fheDataCollector"; // id required to prevent reexecution
func.tags = ["FHEDataCollector"];
