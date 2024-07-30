import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0x41Bdf5c462e79Cef056B12B801Fd854c13e2BEE6";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const referee = await ethers.getContractFactory("contracts/upgrades/referee/Referee6.sol:Referee6");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, referee, { call: { fn: "initialize", args: [deployerAddress] } });
    console.log("Upgraded");

    await run("verify:verify", {
        address: address,
        constructorArguments: [],
        contract: "contracts/upgrades/referee/Referee6.sol:Referee6"
    });
    console.log("verified")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });