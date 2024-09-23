import hardhat from "hardhat";
import { safeVerify } from "../utils/safeVerify.mjs";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0xFaBd7d8D3540254E94811FB33A94537c04D3fEB7";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const Referee16 = await ethers.getContractFactory("contracts/upgrades/referee/Referee16.sol:Referee16");
    console.log("Got factory");

    const refereeContract = await upgrades.upgradeProxy(address, Referee16, { call: { fn: "initialize", args: [19] } });
    const impAddress = await refereeContract.getAddress();
    console.log("Address of the upgraded contract", impAddress);
    console.log("Upgraded Referee16");

    // verify contract
    await run("verify:verify", {
      address: impAddress,
      constructorArguments: [],
      contract: "contracts/upgrades/referee/Referee16.sol:Referee16"
  });
  console.log("verified")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });