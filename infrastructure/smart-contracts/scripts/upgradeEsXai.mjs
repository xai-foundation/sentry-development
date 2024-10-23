import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0x5776784C2012887D1f2FA17281E406643CBa5330";
const foundationReceiver = "0x490A5C858458567Bd58774C123250de11271f165"
const foundationBasePoints = BigInt(500);

const implAddress = "0x1874d5a2F9020c2a5ffB38347BF97aD2D02185a3";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const esXai2 = await ethers.getContractFactory("contracts/upgrades/esXai/esXai6.sol:esXai6");
    console.log("Got factory");

    // console.log("Upgrading with forced redeployment...");
    // await upgrades.forceImport(address, esXai2, { 
    // kind: 'transparent',
    // redeployImplementation: "always", // Force new implementation deployment
    // constructorArgs: [], 
    // impl: implAddress
    // });

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