import { TinyKeysAirdropAbi } from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = "0xA65E7524b4714d1BB3208aEd9e9fC666806148a5" // Needs to be set after tiny key airdrop contract deployment

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
  
    // Activate tiny keys airdrop
    console.log("Activating Tiny Keys Airdrop...");
    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);
    await TinyKeysAirdrop.startAirdrop();
    console.log("Tiny Keys Airdrop Started...");    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  