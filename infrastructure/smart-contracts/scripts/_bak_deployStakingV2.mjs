import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { safeVerify } from "../utils/safeVerify.mjs";
import { esXaiAbi, config } from "@sentry/core";

const address = "0x41Bdf5c462e79Cef056B12B801Fd854c13e2BEE6";

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    // //DEPLOY POOL IMPL
    // console.log("Deploying StakingPool implementation...");
    // const StakingPool = await ethers.deployContract("StakingPool");
    // await StakingPool.waitForDeployment();
    // const poolImplAddress = await StakingPool.getAddress();
    // console.log("Deployed Impl", poolImplAddress)

    // //DEPLOY BUCKET TRACKER IMPL
    // console.log("Deploying BucketTracker implementation...");
    // const BucketTracker = await ethers.deployContract("BucketTracker");
    // await BucketTracker.waitForDeployment();
    // const bucketImplAddress = await BucketTracker.getAddress();
    // console.log("Deployed Impl", bucketImplAddress)

    // console.log("Deploying TransparentUpgradeableProxyImplementationPool...");
    // const TransparentUpgradeableProxyImplementationPool = await ethers.deployContract("TransparentUpgradeableProxyImplementation", [poolImplAddress, deployerAddress, "0x"]);
    // await TransparentUpgradeableProxyImplementationPool.waitForDeployment();
    // const transparentUpgradeableProxyImplementationPool = await TransparentUpgradeableProxyImplementationPool.getAddress();
    // console.log("Deployed TransparentUpgradeableProxyImplementationPool", transparentUpgradeableProxyImplementationPool);

    // console.log("Deploying transparentUpgradeableProxyImplementationBucket...");
    // const TransparentUpgradeableProxyImplementationBucket = await ethers.deployContract("TransparentUpgradeableProxyImplementation", [bucketImplAddress, deployerAddress, "0x"]);
    // await TransparentUpgradeableProxyImplementationBucket.waitForDeployment();
    // const transparentUpgradeableProxyImplementationBucket = await TransparentUpgradeableProxyImplementationBucket.getAddress();
    // console.log("Deployed transparentUpgradeableProxyImplementationBucket", transparentUpgradeableProxyImplementationBucket);

    // // // console.log("Deploying PoolFactory Upgradable...");
    // // // const PoolFactory = await ethers.getContractFactory("PoolFactory");
    // // // const poolFactory = await upgrades.deployProxy(PoolFactory, [deployerAddress, poolImplAddress, bucketImplAddress], { kind: "transparent", deployer });
    // // // const tx = await poolFactory.deploymentTransaction();
    // // // await tx.wait(3);
    // // // const poolFactoryAddress = await poolFactory.getAddress();
    // // // console.log("PoolFactory deployed to:", poolFactoryAddress);

    // //Upgrade the referee  D:\Projects\Expopulus\gitlab-sentry\infrastructure\smart-contracts\contracts\staking-v2\PoolFactory14.sol
    // const poolFactory = await ethers.getContractFactory("contracts/staking-v2/PoolFactory14.sol:PoolFactory14");
    // console.log("Got factory");
    // await upgrades.upgradeProxy("0xc4C684EC2e55b7dff50a328F65423A4641537EEE", poolFactory, { call: { fn: "initialize", args: [address, "0x5776784C2012887D1f2FA17281E406643CBa5330", deployerAddress, poolImplAddress, bucketImplAddress] } });
    // console.log("Upgraded, PoolFactory");

    // //Give PoolFactory auth to whitelist new pools & buckets on esXai
    // // const esXai = await new ethers.Contract("0x5776784C2012887D1f2FA17281E406643CBa5330", esXaiAbi, deployer);
    // // const esXaiAdminRole = await esXai.DEFAULT_ADMIN_ROLE();
    // // await esXai.grantRole(esXaiAdminRole, "0xc4C684EC2e55b7dff50a328F65423A4641537EEE");
    
    // await esXai.addToWhitelist(poolFactoryAddress);

    // Upgrade the referee
    // const referee = await ethers.getContractFactory("contracts/upgrades/referee/Referee12.sol:Referee12");
    // console.log("Got factory");
    // // await upgrades.upgradeProxy(address, referee, { call: { fn: "initialize", args: [] } });
    // await upgrades.upgradeProxy(address, referee);
    // console.log("Upgraded");

    // await run("verify:verify", {
    //     address: "0xc4C684EC2e55b7dff50a328F65423A4641537EEE",
    //     constructorArguments: [],
    //     contract: "contracts/staking-v2/PoolFactory14.sol:PoolFactory14"
    // });

    // await run("verify:verify", {
    //     address: address,
    //     constructorArguments: [],
    //     contract: "contracts/upgrades/referee/Referee12.sol:Referee12"
    // });

    // await run("verify:verify", {
    //     address: bucketImplAddress,
    //     constructorArguments: [],
    // });

    // await run("verify:verify", {
    //     address: poolImplAddress,
    //     constructorArguments: [],
    // });

    await run("verify:verify", {
        address: "0x4bEEE8E3A8da85284feEd69D8056f7DB36F4733b",
        constructorArguments: ["0x213560DF5eEB0875FF26e9DD7dB74d2c6a7BaE5C", deployerAddress, "0x"],
        contract: "contracts/staking-v2/TransparentUpgradable.sol:TransparentUpgradeableProxyImplementation"
    });

    await run("verify:verify", {
        address: "0xddF4de7338c9e0b6D371802C3E4D2d633D9C21bE",
        constructorArguments: ["0x67dDE8Eca06582d75b34962A03beAf1811142dfa", deployerAddress, "0x"],
        contract: "contracts/staking-v2/TransparentUpgradable.sol:TransparentUpgradeableProxyImplementation"
    });

    console.log("verified")
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});