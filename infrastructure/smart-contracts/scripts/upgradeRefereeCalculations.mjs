import hardhat from "hardhat";
import { safeVerify } from "../utils/safeVerify.mjs";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0x86Ca7fF8F3450672E6e7404dfce147CC9DBCaF51";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const referee = await ethers.getContractFactory("contracts/RefereeCalculations.sol:RefereeCalculations");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, referee);
    console.log("Upgraded");

    await run("verify:verify", {
        address: address,
        constructorArguments: [],
        contract: "contracts/RefereeCalculations.sol:RefereeCalculations"
    });
    console.log("verified")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });