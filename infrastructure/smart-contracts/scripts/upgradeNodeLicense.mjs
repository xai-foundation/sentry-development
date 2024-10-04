import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
const address = "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const NodeLicense = await ethers.getContractFactory("contracts/upgrades/node-license/NodeLicense10.sol:NodeLicense10");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, NodeLicense, { call: { fn: "initialize", args: [13] } });
    console.log("Upgraded");

    await run("verify:verify", {
        address: address,
        constructorArguments: [],
        contract: "contracts/upgrades/node-license/NodeLicense10.sol:NodeLicense10"
    });
    console.log("verified")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });