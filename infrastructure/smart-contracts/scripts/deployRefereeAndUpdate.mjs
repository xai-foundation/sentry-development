import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { XaiAbi, esXaiAbi } from "@sentry/core";

const config = {
  refereeAddress: "0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b",
  poolFactory: "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
  esXaiAddress: "0x5776784C2012887D1f2FA17281E406643CBa5330",
  gasSubsidyAddress: "0x91401a742b40802673b85AaEFeE0c999942Dc17c",
  xaiAddress: "0x724E98F16aC707130664bb00F4397406F74732D0",
  nodeLicenseAddress: "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2",
  tinyKeysAirdrop: "0xA65E7524b4714d1BB3208aEd9e9fC666806148a5",
  refereeCalculations: "0x86Ca7fF8F3450672E6e7404dfce147CC9DBCaF51"
};

async function main() {
  const [deployer] = (await ethers.getSigners());
  const deployerAddress = await deployer.getAddress();
  console.log("Deployer address", deployerAddress);

  // console.log("Deploying Referee...");
  // const Referee = await ethers.getContractFactory("Referee");
  // const referee = await upgrades.deployProxy(Referee, [config.esXaiAddress, config.xaiAddress, config.gasSubsidyAddress, 15], { deployer: deployer });
  // const { blockNumber: refereeDeployedBlockNumber } = await referee.deploymentTransaction();
  // const refereeAddress = await referee.getAddress();
  // console.log("Referee deployed to:", refereeAddress);
  // console.log("Referee deployed to:", refereeAddress);
  // console.log("Referee deployed to:", refereeAddress);
  // console.log("Referee deployed to:", refereeAddress);
  // console.log("Referee deployed to:", refereeAddress);
  // console.log("Referee deployed to:", refereeAddress);

  // //INIT DEPLOY REF
  // await referee.setNodeLicenseAddress(config.nodeLicenseAddress);

  // const esXai = new ethers.Contract(config.esXaiAddress, esXaiAbi, deployer);
  // const xai = new ethers.Contract(config.xaiAddress, XaiAbi, deployer);

  // const minterRoleEsXai = await esXai.MINTER_ROLE();
  // await esXai.grantRole(minterRoleEsXai, refereeAddress);
  // console.log(`Granted minter role to ${refereeAddress} on esXai`);
  // const minterRoleXai = await xai.MINTER_ROLE();
  // await xai.grantRole(minterRoleXai, refereeAddress);
  // console.log(`Granted minter role to ${refereeAddress} on Xai`);

  // //UDPATE TO VERSION 4
  const referee2 = await ethers.getContractFactory("contracts/upgrades/referee/Referee16.sol:Referee16");
  console.log("Got factory referee2");
  await upgrades.upgradeProxy(config.refereeAddress, referee2);
  console.log("Upgraded referee2");

  // const tinyKeysAirdrop = await ethers.getContractFactory("contracts/drops/TinyKeysAirdrop.sol:TinyKeysAirdrop");
  // console.log("Got factory tinyKeysAirdrop");
  // await upgrades.upgradeProxy(config.tinyKeysAirdrop, tinyKeysAirdrop);
  // console.log("Upgraded tinyKeysAirdrop");

  // const refereeCalculations = await ethers.getContractFactory("contracts/RefereeCalculations.sol:RefereeCalculations");
  // console.log("Got factory refereeCalculations");
  // await upgrades.upgradeProxy(config.refereeCalculations, refereeCalculations);
  // console.log("Upgraded refereeCalculations");


  // const referee = await ethers.getContractFactory("contracts/upgrades/referee/Referee15.sol:Referee15");
  // const referee = await ethers.getContractFactory("contracts/drops/TinyKeysAirdrop2.sol:TinyKeysAirdrop2");
  // console.log("Got factory");
  // await upgrades.upgradeProxy(TINY_KEYS_AIRDROP_ADDRESS, referee);
  // console.log("Upgraded TinyKeysAirdrop2");


  // console.log("Upgrading Referee...");
  // const Referee16 = await ethers.getContractFactory("contracts/upgrades/esXai/esXai6.sol:esXai6");
  // console.log("Got Referee factory");

  // await upgrades.upgradeProxy(config.esXaiAddress, Referee16);

  // const referee6 = await ethers.getContractFactory("contracts/upgrades/node-license/NodeLicense10.sol:NodeLicense10");
  // console.log("Got factory");
  // await upgrades.upgradeProxy(config.nodeLicenseAddress, referee6);
  // console.log("Upgraded nodeLicenseAddress");

  // const referee6 = await ethers.getContractFactory("contracts/upgrades/pool-factory/PoolFactory10.sol:PoolFactory10");
  // console.log("Got factory");
  // await upgrades.upgradeProxy(config.poolFactory, referee6);
  // console.log("Upgraded referee4");


  // await run("verify:verify", {
  //   address: config.poolFactory,
  //   constructorArguments: [],
  //   contract: "contracts/staking-v2/PoolFactory9.sol:PoolFactory9"
  // });
  // await run("verify:verify", {
  //   address: TINY_KEYS_AIRDROP_ADDRESS,
  //   constructorArguments: [],
  //   // contract: "contracts/upgrades/referee/Referee15.sol:Referee15"
  //   contract: "contracts/drops/TinyKeysAirdrop2.sol:TinyKeysAirdrop2"
  // });
  await run("verify:verify", {
    address: config.refereeAddress,
    constructorArguments: [],
    contract: "contracts/upgrades/referee/Referee16.sol:Referee16"
  });
  // await run("verify:verify", {
  //   address: config.poolFactory,
  //   constructorArguments: [],
  //   contract: "contracts/upgrades/pool-factory/PoolFactory10.sol:PoolFactory10"
  // });
  // await run("verify:verify", {
  //   address: config.refereeCalculations,
  //   constructorArguments: [],
  //   contract: "contracts/RefereeCalculations.sol:RefereeCalculations"
  // });


  // await run("verify:verify", {
  //   address: config.nodeLicenseAddress,
  //   constructorArguments: [],
  //   contract: "contracts/upgrades/node-license/NodeLicense10.sol:NodeLicense10"
  // });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});