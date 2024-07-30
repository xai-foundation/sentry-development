import { config, TinyKeysAirdropAbi, NodeLicenseAbi } from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = "0xA65E7524b4714d1BB3208aEd9e9fC666806148a5" // Needs to be set after tiny key airdrop contract deployment
const NODE_LICENSE_CONTRACT = "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2";

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());

    const qtyPerSegment = 10;

    // Get the total supply of node licenses

    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);

    const totalSupplyAtStart = await TinyKeysAirdrop.totalSupplyAtStart();
    const currentIndex = Number(await TinyKeysAirdrop.airdropCounter());
    let nextIndex = currentIndex;

    while (nextIndex <= totalSupplyAtStart) {
        console.log(`Processing Airdrop Segment for ${qtyPerSegment} tokens beginning at token id ${nextIndex}...`);
        try {
            await TinyKeysAirdrop.processAirdropSegmentOnlyMint(qtyPerSegment);
            //TODO we should be running this from multiple wallets so we don't get errors for tx nonce or tx queue then remove that timeout
            console.log("Processed mint, starting stake")
            await TinyKeysAirdrop.processAirdropSegmentOnlyStake([
                nextIndex,
                nextIndex + 1,
                nextIndex + 2,
                nextIndex + 3,
                nextIndex + 4,
                nextIndex + 5,
                nextIndex + 6,
                nextIndex + 7,
                nextIndex + 8,
                nextIndex + 9,
            ]);
            nextIndex += qtyPerSegment
        } catch (error) {
            console.error("Tiny Keys Airdrop error", error);
            return;
        }
    }
    console.log("Tiny Keys Airdrop Completed...");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
