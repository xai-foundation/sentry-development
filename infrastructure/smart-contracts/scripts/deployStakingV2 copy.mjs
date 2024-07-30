import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { safeVerify } from "../utils/safeVerify.mjs";
import { esXaiAbi } from "@sentry/core";


const config = {
    refereeAddress: "0xFaBd7d8D3540254E94811FB33A94537c04D3fEB7",
    esXaiAddress: "0x5776784C2012887D1f2FA17281E406643CBa5330",
    gasSubsidyAddress: "0x91401a742b40802673b85AaEFeE0c999942Dc17c",
    xaiAddress: "0x724E98F16aC707130664bb00F4397406F74732D0",
    nodeLicenseAddress: "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2"
};

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    //DEPLOY POOL IMPL
    console.log("Deploying StakingPool implementation...");
    const StakingPool = await ethers.deployContract("StakingPool");
    await StakingPool.waitForDeployment();
    const poolImplAddress = await StakingPool.getAddress();
    console.log("Deployed Impl", poolImplAddress)
    
    await run("verify:verify", {
        address: poolImplAddress,
        constructorArguments: [],
    });

    // // //DEPLOY BUCKET TRACKER KEY IMPL
    console.log("Deploying BucketTracker implementation...");
    const KeyBucketTracker = await ethers.deployContract("BucketTracker");
    await KeyBucketTracker.waitForDeployment();
    const keyBucketImplAddress = await KeyBucketTracker.getAddress();
    console.log("Deployed Impl", keyBucketImplAddress)
    
    await run("verify:verify", {
        address: keyBucketImplAddress,
        constructorArguments: [],
    });

    // // //DEPLOY BUCKET TRACKER ESXAI IMPL
    console.log("Deploying BucketTracker implementation...");
    const EsXaiBucketTracker = await ethers.deployContract("BucketTracker");
    await EsXaiBucketTracker.waitForDeployment();
    const esXaiBucketImplAddress = await EsXaiBucketTracker.getAddress();
    console.log("Deployed Impl", esXaiBucketImplAddress)

    await run("verify:verify", {
        address: esXaiBucketImplAddress,
        constructorArguments: [],
    });

    //TODO DEPLOY BEACON
    console.log("Deploying PoolBeacon");
    const PoolBeacon = await ethers.deployContract("PoolBeacon", [poolImplAddress]);
    await PoolBeacon.waitForDeployment();
    const poolBeaconAddress = await PoolBeacon.getAddress();
    console.log("Deployed PoolBeacon", poolBeaconAddress);

    await run("verify:verify", {
        address: poolBeaconAddress,
        constructorArguments: [poolImplAddress],
    });

    console.log("Deploying BeaconProxy for PoolBeacon for auto verification");
    const PoolBeaconProxy = await ethers.deployContract("BeaconProxy", [poolBeaconAddress, "0x"]);
    await PoolBeaconProxy.waitForDeployment();
    const poolBeaconProxyAddress = await PoolBeaconProxy.getAddress();
    console.log("Deployed BeaconProxy for PoolBeacon", poolBeaconProxyAddress);

    await run("verify:verify", {
        address: poolBeaconProxyAddress,
        constructorArguments: [poolBeaconAddress, "0x"],
    });

    console.log("Deploying EsXaiBucketBeacon");
    const EsXaiBucketBeacon = await ethers.deployContract("PoolBeacon", [esXaiBucketImplAddress]);
    await EsXaiBucketBeacon.waitForDeployment();
    const esXaiBucketBeaconAddress = await EsXaiBucketBeacon.getAddress();
    console.log("Deployed EsXaiBucketBeacon", esXaiBucketBeaconAddress);

    await run("verify:verify", {
        address: esXaiBucketBeaconAddress,
        constructorArguments: [esXaiBucketImplAddress],
    });

    console.log("Deploying BeaconProxy for EsXaiBucketBeaconProxy for auto verification");
    const EsXaiBucketBeaconProxy = await ethers.deployContract("BeaconProxy", [esXaiBucketBeaconAddress, "0x"]);
    await EsXaiBucketBeaconProxy.waitForDeployment();
    const esXaiBucketBeaconProxyAddress = await EsXaiBucketBeaconProxy.getAddress();
    console.log("Deployed BeaconProxy for EsXaiBucketBeaconProxy", esXaiBucketBeaconProxyAddress);

    await run("verify:verify", {
        address: esXaiBucketBeaconProxyAddress,
        constructorArguments: [esXaiBucketBeaconAddress, "0x"],
    });

    console.log("Deploying KeyBucketBeacon");
    const KeyBucketBeacon = await ethers.deployContract("PoolBeacon", [keyBucketImplAddress]);
    await KeyBucketBeacon.waitForDeployment();
    const keyBucketBeaconAddress = await KeyBucketBeacon.getAddress();
    console.log("Deployed KeyBucketBeacon", keyBucketBeaconAddress);

    await run("verify:verify", {
        address: keyBucketBeaconAddress,
        constructorArguments: [keyBucketImplAddress],
    });


    console.log("Deploying BeaconProxy for KeyBucketBeaconProxy for auto verification");
    const KeyBucketBeaconProxy = await ethers.deployContract("BeaconProxy", [keyBucketBeaconAddress, "0x"]);
    await KeyBucketBeaconProxy.waitForDeployment();
    const keyBucketBeaconProxyAddress = await KeyBucketBeaconProxy.getAddress();
    console.log("Deployed BeaconProxy for KeyBucketBeaconProxy", keyBucketBeaconProxyAddress);

    await run("verify:verify", {
        address: keyBucketBeaconProxyAddress,
        constructorArguments: [keyBucketBeaconAddress, "0x"],
    });


    console.log("Deploying PoolFactory Upgradable...");
    const PoolFactory = await ethers.getContractFactory("contracts/staking-v2/PoolFactory.sol:PoolFactory");

    const poolFactory = await upgrades.deployProxy(
        PoolFactory,
        [config.refereeAddress, config.esXaiAddress, config.nodeLicenseAddress],
        { kind: "transparent", deployer }
    );

    const tx = await poolFactory.deploymentTransaction();
    await tx.wait(3);
    const poolFactoryAddress = await poolFactory.getAddress();
    console.log("PoolFactory deployed to:", poolFactoryAddress);
    
    await run("verify:verify", {
        address: poolFactoryAddress,
        constructorArguments: [],
        contract: "contracts/staking-v2/PoolFactory.sol:PoolFactory"
    });

    
    console.log("Deploying PoolProxyDeployer Upgradable...");
    const PoolProxyDeployer = await ethers.getContractFactory("contracts/staking-v2/PoolProxyDeployer.sol:PoolProxyDeployer");

    const poolProxyDeployer = await upgrades.deployProxy(
        PoolProxyDeployer,
        [poolFactoryAddress, poolBeaconAddress, keyBucketBeaconAddress, esXaiBucketBeaconAddress],
        { kind: "transparent", deployer }
    );

    const tx2 = await poolProxyDeployer.deploymentTransaction();
    await tx2.wait(3);
    const poolProxyDeployerAddress = await poolProxyDeployer.getAddress();
    console.log("PoolProxyDeployer deployed to:", poolProxyDeployerAddress);
    
    await run("verify:verify", {
        address: poolProxyDeployerAddress,
        constructorArguments: [],
        contract: "contracts/staking-v2/PoolProxyDeployer.sol:PoolProxyDeployer"
    });

    console.log("Update PoolFactory updatePoolProxyDeployer...");
    await poolFactory.updatePoolProxyDeployer(poolProxyDeployerAddress);
    console.log("Updated PoolFactory added poolProxyDeployerAddress", poolProxyDeployerAddress);

    // // Upgrade the referee
    // const referee = await ethers.getContractFactory("Referee5");
    // console.log("Got factory");
    // await upgrades.upgradeProxy(config.refereeAddress, referee, { call: { fn: "initialize", args: [poolFactoryAddress] } });
    // console.log("Upgraded");

    // await run("verify:verify", {
    //     address: config.refereeAddress,
    //     constructorArguments: [],
    //     contract: "Referee5"
    // });

    // Give PoolFactory auth to whitelist new pools & buckets on esXai
    console.log("Adding esXai DEFAULT_ADMIN_ROLE to PoolFactory...");
    const esXai = await new ethers.Contract(config.esXaiAddress, esXaiAbi, deployer);
    const esXaiAdminRole = await esXai.DEFAULT_ADMIN_ROLE();
    await esXai.grantRole(esXaiAdminRole, poolFactoryAddress);
    console.log("Granted role");
    //Add PoolFactory to whitelist
    await esXai.addToWhitelist(poolFactoryAddress);
    console.log("Added PoolFactory to esXai whitelist");


    console.log("Deployed Staking V2 setup")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});