import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0x5776784C2012887D1f2FA17281E406643CBa5330";
const foundationReceiver = "0x490A5C858458567Bd58774C123250de11271f165"
const foundationBasePoints = BigInt(500);


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const esXai2 = await ethers.getContractFactory("contracts/upgrades/esXai/esXai6.sol:esXai6");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, esXai2);
    console.log("Upgraded");

    await run("verify:verify", {
        address: address,
        constructorArguments: [],
        contract: "contracts/upgrades/esXai/esXai6.sol:esXai6"
    });
    console.log("verified")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });