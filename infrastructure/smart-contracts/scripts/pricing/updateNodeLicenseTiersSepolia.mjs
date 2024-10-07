import { NodeLicenseAbi } from "@sentry/core";
import hardhat from "hardhat";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const { ethers, upgrades } = hardhat;
import { parse } from "csv/sync";
import fs from 'fs'

const config = {
    refereeAddress: "0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b", //TODO !!!!!
    esXaiAddress: "0x5776784C2012887D1f2FA17281E406643CBa5330",
    gasSubsidyAddress: "0x91401a742b40802673b85AaEFeE0c999942Dc17c",
    xaiAddress: "0x724E98F16aC707130664bb00F4397406F74732D0",
    nodeLicenseAddress: "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2"
};


async function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    const nodeLicense = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, deployer);

    const tiers = parse(fs.readFileSync(join(__dirname, 'node-license-prices.csv')), { columns: true });

    const tiersJSON = [];
    // TINY KEYS:
    for (const tier of tiers) {
        console.log("Tier", tier);
        console.log(`Adding tier ${tier.tierIndex} with unit cost ${(Number(tier.unitCostInEth) / 100).toString()} and quantity ${Number(tier.quantityBeforeNextTier) * 100} to NodeLicense`);
        const newPrice = BigInt(Number(tier.unitCostInEth) / 100);
        console.log("New price", newPrice);
        const tx = await nodeLicense.setOrAddPricingTier(tier.tierIndex, newPrice, (Number(tier.quantityBeforeNextTier) * 100));
        await tx.wait(1);
        console.log(`Added tier ${tier.tierIndex} to NodeLicense`);
        tiersJSON.push({
            "price": (Number(tier.unitCostInEth) / 100).toString(),
            "quantity": (Number(tier.quantityBeforeNextTier) * 100).toString()
        })
    }

    fs.writeFileSync("./tiersOut.json", JSON.stringify(tiersJSON));

    // for (const tier of tiers) {
    //     await nodeLicense.setOrAddPricingTier(tier.tierIndex, ethers.parseEther(tier.unitCostInEth.toString()), tier.quantityBeforeNextTier);
    //     console.log(`Added tier ${tier.tierIndex} with unit cost ${tier.unitCostInEth} and quantity ${tier.quantityBeforeNextTier} to NodeLicense`);
    // }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});