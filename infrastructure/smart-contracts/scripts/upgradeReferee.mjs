import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0xFaBd7d8D3540254E94811FB33A94537c04D3fEB7";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const referee = await ethers.getContractFactory("contracts/upgrades/referee/NewReferee6.sol:NewReferee6");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, referee);
    console.log("Upgraded");

    await run("verify:verify", {
        address: address,
        constructorArguments: [],
        contract: "contracts/upgrades/referee/NewReferee6.sol:NewReferee6"
    });
    console.log("verified")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });