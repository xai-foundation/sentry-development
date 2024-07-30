import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { safeVerify } from "../utils/safeVerify.mjs";
import { esXaiAbi } from "@sentry/core";

const config = {
    refereeAddress: "0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b",
    poolFactoryAddress: "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
    esXaiAddress: "0x5776784C2012887D1f2FA17281E406643CBa5330",
    gasSubsidyAddress: "0x91401a742b40802673b85AaEFeE0c999942Dc17c",
    xaiAddress: "0x724E98F16aC707130664bb00F4397406F74732D0",
    nodeLicenseAddress: "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2"
};

/**
 * Main function to deploy and upgrade contracts
 * @async
 * @function main
 * @description This function deploys new contracts and upgrades existing ones in the following order:
 * 1. Deploy RefereeCalculations
 * 2. Deploy TinyKeysAirdrop
 * 3. Upgrade esXai6
 * 4. Upgrade NodeLicense10
 * 5. Upgrade PoolFactory10
 * 6. Upgrade Referee16
 * 7. Add NodeLicense to esXai transfer whitelist
 * 8. Verify all deployed and upgraded contracts
 */
async function main() {
    const BLOCKS_TO_WAIT = 3;

    const airDropKeyMultiplier = 99; // Number of new NodeLicense received per 1 NodeLicense currently owned 
    const maxKeysNonKyc = 100;//Maximum number of keys that a non-KYC user can own and still complete esXai redemptions

    const ethToUsdPrice = 300000000000; // Price of 1 ETH in USD
    const xaiToUsdPrice = 100000000; // Price of 1 XAI in USD 

    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    // Deploy Mock Chainlink Price Feeds
    console.log("Deploying Chainlink Price Feeds...");

    const chainlinkEthUsdPriceFeed = await ethers.deployContract("contracts/mock/MockChainlinkPriceFeed.sol:MockChainlinkPriceFeed", [ethToUsdPrice]);
    await chainlinkEthUsdPriceFeed.waitForDeployment();
    const chainlinkEthUsdPriceFeedAddress = await chainlinkEthUsdPriceFeed.getAddress();

    const chainlinkXaiUsdPriceFeed = await ethers.deployContract("contracts/mock/MockChainlinkPriceFeed.sol:MockChainlinkPriceFeed", [xaiToUsdPrice]);
    await chainlinkXaiUsdPriceFeed.waitForDeployment();
    const chainlinkXaiUsdPriceFeedAddress = await chainlinkXaiUsdPriceFeed.getAddress();

    console.log("Chainlink Price Feeds deployed to:", chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress);
    console.log("Chainlink Price Feeds deployed to:", chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress);
    console.log("Chainlink Price Feeds deployed to:", chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress);
    console.log("Chainlink Price Feeds deployed to:", chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress);
    console.log("Chainlink Price Feeds deployed to:", chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress);
    console.log("Chainlink Price Feeds deployed to:", chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress);
    console.log("Chainlink Price Feeds deployed to:", chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress);
    console.log("Chainlink Price Feeds deployed to:", chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress);





    /**
     * Deploy RefereeCalculations Contract
     * @description Deploys the RefereeCalculations contract as an upgradeable proxy
     */
    console.log("Deploying RefereeCalculations Upgradable...");
    const RefereeCalculations = await ethers.getContractFactory("contracts/RefereeCalculations.sol:RefereeCalculations");
    console.log("Got RefereeCalculations factory");

    const refereeCalculations = await upgrades.deployProxy(RefereeCalculations, [], { kind: "transparent", deployer });
    const txRefereeCalc = await refereeCalculations.deploymentTransaction();

    await txRefereeCalc.wait(BLOCKS_TO_WAIT);

    const refereeCalculationsAddress = await refereeCalculations.getAddress();
    console.log("RefereeCalculations deployed to:", refereeCalculationsAddress);
    console.log("RefereeCalculations deployed to:", refereeCalculationsAddress);
    console.log("RefereeCalculations deployed to:", refereeCalculationsAddress);
    console.log("RefereeCalculations deployed to:", refereeCalculationsAddress);
    console.log("RefereeCalculations deployed to:", refereeCalculationsAddress);

    /**
     * Deploy TinyKeysAirdrop Contract
     * @description Deploys the TinyKeysAirdrop contract as an upgradeable proxy
     * @param {string} nodeLicenseAddress - Address of the NodeLicense contract
     * @param {string} refereeAddress - Address of the Referee contract
     * @param {string} poolFactoryAddress - Address of the PoolFactory contract
     * @param {number} airDropKeyMultiplier - Number of new NodeLicense received per 1 NodeLicense currently owned
     */
    console.log("Deploying Airdrop Upgradable...");
    const TinyKeysAirdrop = await ethers.getContractFactory("contracts/drops/TinyKeysAirdrop.sol:TinyKeysAirdrop");
    console.log("Got TinyKeysAirdrop factory");

    const tinyKeysAirdropParams = [config.nodeLicenseAddress, config.refereeAddress, config.poolFactoryAddress, airDropKeyMultiplier];
    const tinyKeysAirdrop = await upgrades.deployProxy(TinyKeysAirdrop, tinyKeysAirdropParams, { kind: "transparent", deployer });

    const txAirdrop = await tinyKeysAirdrop.deploymentTransaction();
    await txAirdrop.wait(BLOCKS_TO_WAIT);

    const tinyKeysAirdropAddress = await tinyKeysAirdrop.getAddress();
    console.log("TinyKeysAirdrop deployed to:", tinyKeysAirdropAddress);
    console.log("TinyKeysAirdrop deployed to:", tinyKeysAirdropAddress);
    console.log("TinyKeysAirdrop deployed to:", tinyKeysAirdropAddress);
    console.log("TinyKeysAirdrop deployed to:", tinyKeysAirdropAddress);
    console.log("TinyKeysAirdrop deployed to:", tinyKeysAirdropAddress);
    console.log("TinyKeysAirdrop deployed to:", tinyKeysAirdropAddress);
    console.log("TinyKeysAirdrop deployed to:", tinyKeysAirdropAddress);

    /**
     * Upgrade esXai6 Contract
     * @description Upgrades the existing esXai contract to esXai6
     * @param {string} refereeAddress - Address of the Referee contract
     * @param {string} nodeLicenseAddress - Address of the NodeLicense contract
     * @param {number} maxKeysNonKyc - Maximum number of keys that a non-KYC user can own
     */
    console.log("Upgrading esXai6...");
    const EsXai3 = await ethers.getContractFactory("contracts/upgrades/esXai/esXai6.sol:esXai6");
    console.log("Got esXai factory");

    const esXaiUpgradeParams = [config.refereeAddress, config.nodeLicenseAddress, maxKeysNonKyc];
    await upgrades.upgradeProxy(config.esXaiAddress, EsXai3, { call: { fn: "initialize", args: esXaiUpgradeParams } });
    console.log("Upgraded esXai6");

    /**
     * Upgrade NodeLicense Contract
     * @description Upgrades the existing NodeLicense contract to NodeLicense10
     * @param {string} xaiAddress - Address of the XAI token contract
     * @param {string} esXaiAddress - Address of the esXai contract
     * @param {string} chainlinkEthUsdPriceFeed - Address of the Chainlink ETH/USD price feed
     * @param {string} chainlinkXaiUsdPriceFeed - Address of the Chainlink XAI/USD price feed
     * @param {string} tinyKeysAirdropAddress - Address of the TinyKeysAirdrop contract
     */
    console.log("Upgrading NodeLicense...");
    const NodeLicense10 = await ethers.getContractFactory("contracts/upgrades/node-license/NodeLicense10.sol:NodeLicense10");
    console.log("Got NodeLicense factory");

    const nodeLicenseUpgradeParams = [config.xaiAddress, config.esXaiAddress, chainlinkEthUsdPriceFeedAddress, chainlinkXaiUsdPriceFeedAddress, tinyKeysAirdropAddress];
    await upgrades.upgradeProxy(config.nodeLicenseAddress, NodeLicense10, { call: { fn: "initialize", args: nodeLicenseUpgradeParams } });

    /**
     * Upgrade PoolFactory Contract
     * @description Upgrades the existing PoolFactory contract to PoolFactory10
     * @param {string} tinyKeysAirdropAddress - Address of the TinyKeysAirdrop contract
     */
    console.log("Upgrading PoolFactory...");
    const PoolFactory10 = await ethers.getContractFactory("contracts/upgrades/pool-factory/PoolFactory10.sol:PoolFactory10");
    console.log("Got PoolFactory factory");

    const poolFactoryUpgradeParams = [tinyKeysAirdropAddress];
    await upgrades.upgradeProxy(config.poolFactoryAddress, PoolFactory10, { call: { fn: "initialize", args: poolFactoryUpgradeParams } });

    /**
     * Upgrade Referee Contract
     * @description Upgrades the existing Referee contract to Referee16
     * @param {string} refereeCalculationsAddress - Address of the RefereeCalculations contract
     */
    console.log("Upgrading Referee...");
    const Referee16 = await ethers.getContractFactory("contracts/upgrades/referee/Referee16.sol:Referee16");
    console.log("Got Referee factory");

    const refereeUpgradeParams = [refereeCalculationsAddress];
    await upgrades.upgradeProxy(config.refereeAddress, Referee16, { call: { fn: "initialize", args: refereeUpgradeParams } });

    /**
     * Add NodeLicense to esXai transfer whitelist
     * @description Grants the required role and adds NodeLicense to the esXai transfer whitelist
     * @param {Contract} esXai - Instance of the esXai contract
     */
    console.log("Adding NodeLicense to esXai transfer whitelist...");
    const esXai = await new ethers.Contract(config.esXaiAddress, esXaiAbi, deployer);
    await esXai.addToWhitelist(config.nodeLicenseAddress);
    console.log("Successfully Added NodeLicense to esXai transfer whitelist");

    const deployedContracts = {
        refereeCalculations: refereeCalculationsAddress,
        tinyKeysAirdrop: tinyKeysAirdropAddress,
    }

    console.log("Deployed contracts: ");
    console.log(deployedContracts);

    /**
     * Verify Contracts
     * @description Verifies all deployed and upgraded contracts on the blockchain explorer
     */
    console.log("Starting verification... ");

    await run("verify:verify", {
        address: refereeCalculationsAddress,
        constructorArguments: [],
        contract: "contracts/RefereeCalculations.sol:RefereeCalculations"
    });

    console.log("Verified RefereeCalculations");
    await new Promise((resolve)=> setTimeout(resolve, 3000));

    await run("verify:verify", {
        address: tinyKeysAirdropAddress,
        constructorArguments: [],
        contract: "contracts/drops/TinyKeysAirdrop.sol:TinyKeysAirdrop"
    });
    console.log("Verified TinyKeysAirdrop");
    await new Promise((resolve)=> setTimeout(resolve, 3000));

    await run("verify:verify", {
        address: config.esXaiAddress,
        constructorArguments: [],
        contract: "contracts/upgrades/esXai/esXai6.sol:esXai6"
    });
    console.log("Verified esXai6");
    await new Promise((resolve)=> setTimeout(resolve, 3000));

    await run("verify:verify", {
        address: config.nodeLicenseAddress,
        constructorArguments: [],
        contract: "contracts/upgrades/node-license/NodeLicense10.sol:NodeLicense10"
    });
    console.log("Verified NodeLicense10");
    await new Promise((resolve)=> setTimeout(resolve, 3000));

    await run("verify:verify", {
        address: config.poolFactoryAddress,
        constructorArguments: [],
        contract: "contracts/upgrades/pool-factory/PoolFactory10.sol:PoolFactory10"
    });
    console.log("Verified PoolFactory10");
    await new Promise((resolve)=> setTimeout(resolve, 3000));

    await run("verify:verify", {
        address: config.refereeAddress,
        constructorArguments: [],
        contract: "contracts/upgrades/referee/Referee16.sol:Referee16"
    });
    console.log("Verified Referee16");
    await new Promise((resolve)=> setTimeout(resolve, 3000));
    
    await run("verify:verify", {
        address: chainlinkEthUsdPriceFeedAddress,
        constructorArguments: [ethToUsdPrice],
        contract: "contracts/mock/MockChainlinkPriceFeed.sol:MockChainlinkPriceFeed"
    });
    console.log("Verified MockChainlinkPriceFeed eth");
    await new Promise((resolve)=> setTimeout(resolve, 3000));

    await run("verify:verify", {
        address: chainlinkXaiUsdPriceFeedAddress,
        constructorArguments: [xaiToUsdPrice],
        contract: "contracts/mock/MockChainlinkPriceFeed.sol:MockChainlinkPriceFeed"
    });
    console.log("Verified MockChainlinkPriceFeed xai");

    console.log("Verification complete ");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});