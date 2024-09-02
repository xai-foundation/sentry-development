import hardhat from "hardhat";
import { safeVerify } from "../utils/safeVerify.mjs";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A";
const contractPath = "contracts/upgrades/pool-factory/PoolFactory10.sol:PoolFactory10";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.address;
    console.log("Deployer address", deployerAddress);
    const poolFactory = await ethers.getContractFactory(contractPath);
    console.log("Got factory");
    await upgrades.upgradeProxy(address, poolFactory);
    console.log("Upgraded");



    await run("verify:verify", {
        address: address,
        constructorArguments: [],
        contract: contractPath
    });
    console.log("verified")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });