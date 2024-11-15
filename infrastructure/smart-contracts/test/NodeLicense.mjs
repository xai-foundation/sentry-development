import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parse } from "csv/sync";
import fs from "fs";

export function NodeLicenseTests(deployInfrastructure) {
    return function() {

        it("Check calling the initializer is not allowed afterwards", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, deployer, xai, esXai, chainlinkEthUsdPriceFeed,
                chainlinkXaiUsdPriceFeed, usdcToken} = await loadFixture(deployInfrastructure);
            const expectedRevertMessage = "Initializable: contract is already initialized";
            await expect(nodeLicense.connect(nodeLicenseDefaultAdmin).initialize(await xai.getAddress(), await esXai.getAddress(), await chainlinkEthUsdPriceFeed.getAddress(), chainlinkXaiUsdPriceFeed.getAddress(), await deployer.getAddress(), await usdcToken.getAddress())).to.be.revertedWith(expectedRevertMessage);
        })

        it("Check the max supply is 50,000", async function() {
            const {nodeLicense} = await loadFixture(deployInfrastructure);
            const maxSupply = await nodeLicense.maxSupply();
            expect(maxSupply).to.eq(BigInt(50000));
        })

        it("Check creating and removing promo codes", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1} = await loadFixture(deployInfrastructure);
            const promoCode = "PROMO2023";
            const recipient = await addr1.getAddress();

            // Create a new promo code
            await nodeLicense.connect(nodeLicenseDefaultAdmin).createPromoCode(promoCode, recipient);
            let promoCodeData = await nodeLicense.getPromoCode(promoCode);
            expect(promoCodeData.recipient).to.equal(recipient);
            expect(promoCodeData.active).to.be.true;

            // Remove the promo code
            await nodeLicense.connect(nodeLicenseDefaultAdmin).removePromoCode(promoCode);
            promoCodeData = await nodeLicense.getPromoCode(promoCode);
            expect(promoCodeData.active).to.be.false;
        });

        it("Check all tiers were uploaded properly and the pricing tiers length is correct", async function() {
            const {nodeLicense} = await loadFixture(deployInfrastructure);
            const tiers = parse(fs.readFileSync('tierUpload.csv'), { columns: true });
            const pricingTiersLength = await nodeLicense.getPricingTiersLength();
            expect(pricingTiersLength).to.eq(tiers.length);
            for (const tier of tiers) {
                const tierData = await nodeLicense.getPricingTier(tier.tierIndex);
                expect(tierData.price).to.eq(ethers.parseEther(tier.unitCostInEth.toString()));
                expect(tierData.quantity).to.eq(BigInt(tier.quantityBeforeNextTier));
            }
        });

        it("Check minting an NFT and receiving it", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1, fundsReceiver} = await loadFixture(deployInfrastructure);
            const initialBalance = await ethers.provider.getBalance(fundsReceiver.address);
            const price = await nodeLicense.price(1, "");
            const totalSupplyBeforeMint = await nodeLicense.totalSupply();

            // Mint an NFT
           const res = await nodeLicense.connect(addr1).mint(1, "", { value: price });

            // Check the NFT was received
            const owner = await nodeLicense.ownerOf(totalSupplyBeforeMint + BigInt(1));

            expect(owner).to.equal(addr1.address);

            // Check the fundsReceiver received the funds
            const finalBalance = await ethers.provider.getBalance(fundsReceiver.address);
            expect(finalBalance).to.eq(initialBalance + price);

            // Check the total supply increased
            const totalSupplyAfterMint = await nodeLicense.totalSupply();
            expect(totalSupplyAfterMint).to.eq(totalSupplyBeforeMint + BigInt(1));
        });

        it("Check minting with a promo code and receiving the correct funds", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1, addr2, fundsReceiver} = await loadFixture(deployInfrastructure);
            const promoCode = "PROMO2023";
            const recipient = await addr1.getAddress();
            const initialBalance = await ethers.provider.getBalance(await fundsReceiver.getAddress());
            const referralDiscountPercentage = await nodeLicense.referralDiscountPercentage();
            const referralRewardPercentage = await nodeLicense.referralRewardPercentage();

            // Create a new promo code
            await nodeLicense.connect(nodeLicenseDefaultAdmin).createPromoCode(promoCode, recipient);

            // Mint an NFT with a promo code
            const price = await nodeLicense.price(1, promoCode);
            const referralReward = price * referralRewardPercentage / BigInt(100);
            await nodeLicense.connect(addr2).mint(1, promoCode, { value: price });

            // Check the fundsReceiver received the correct funds
            const finalBalance = await ethers.provider.getBalance(await fundsReceiver.getAddress());
            expect(finalBalance).to.eq(initialBalance + price - referralReward);

            // Check the contract balance is the referral reward
            const contractBalance = await ethers.provider.getBalance(await nodeLicense.getAddress());
            expect(contractBalance).to.eq(referralReward);
        });

        it("Check that NFTs are not transferable after minting", async function() {
            const {nodeLicense, addr1, addr2} = await loadFixture(deployInfrastructure);

            // Mint an NFT
            await nodeLicense.connect(addr1).mint(1, "", { value: await nodeLicense.price(1, "") });

            // Get the tokenId of the minted NFT
            const tokenId = await nodeLicense.totalSupply();

            // Try to transfer the NFT
            const expectedRevertMessage = "NodeLicense: transfer is not allowed";
            await expect(nodeLicense.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId)).to.be.revertedWith(expectedRevertMessage);
        });

        it("Check referral reward claim", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1, addr2, fundsReceiver} = await loadFixture(deployInfrastructure);
            const promoCode = "PROMO2023";
            const recipient = await addr1.getAddress();

            // Create a new promo code
            await nodeLicense.connect(nodeLicenseDefaultAdmin).createPromoCode(promoCode, recipient);

            // Mint an NFT with a promo code
            const price = await nodeLicense.price(1, promoCode);
            await nodeLicense.connect(addr2).mint(1, promoCode, { value: price });

            // Try to claim the referral reward
            await expect(nodeLicense.connect(addr1).claimReferralReward()).to.be.revertedWith("Claiming of referral rewards is currently disabled");

            // Enable claiming of referral rewards
            await nodeLicense.connect(nodeLicenseDefaultAdmin).setClaimable(true);

            // Claim the referral reward
            await nodeLicense.connect(addr1).claimReferralReward();

            // Try to claim the referral reward again
            await expect(nodeLicense.connect(addr1).claimReferralReward()).to.be.revertedWith("No referral reward to claim");
        });

        it("Check tokenURI returns a base64", async function() {
            const {nodeLicense, addr1} = await loadFixture(deployInfrastructure);

            // Mint an NFT
            await nodeLicense.connect(addr1).mint(1, "", { value: await nodeLicense.price(1, "") });

            // Get the tokenId of the minted NFT
            const tokenId = await nodeLicense.totalSupply();

            // Get the tokenURI
            const tokenURI = await nodeLicense.tokenURI(tokenId);

            // Check if the tokenURI is a base64 string
            expect(tokenURI).to.match(/^data:application\/json;base64,.+/);
        });

        // it("Admin reclaims the referral funds", async function() {
        //     const {nodeLicense, nodeLicenseDefaultAdmin, addr1, addr2, fundsReceiver} = await loadFixture(deployInfrastructure);
        //     const promoCode = "PROMO2023";
        //     const recipient = await addr1.getAddress();

        //     // Create a new promo code
        //     await nodeLicense.connect(nodeLicenseDefaultAdmin).createPromoCode(promoCode, recipient);

        //     // Mint an NFT with a promo code
        //     const price = await nodeLicense.price(1, promoCode);
        //     await nodeLicense.connect(addr2).mint(1, promoCode, { value: price });

        //     // Enable claiming of referral rewards
        //     await nodeLicense.connect(nodeLicenseDefaultAdmin).setClaimable(true);

        //     // Claim the referral reward
        //     await nodeLicense.connect(addr1).claimReferralReward();

        //     // Admin withdraws the funds
        //     await nodeLicense.connect(nodeLicenseDefaultAdmin).withdrawFunds();

        //     // Check if the funds have been withdrawn
        //     const balance = await ethers.provider.getBalance(fundsReceiver.address);
        //     expect(balance).to.be.gt(0);
        // });

        // it("Check refunding a node license returns the amount to the owner and burns the token", async function() {
        //     const {nodeLicense, nodeLicenseDefaultAdmin, addr1} = await loadFixture(deployInfrastructure);

        //     // Mint an NFT
        //     const price = await nodeLicense.price(1, "");
        //     await nodeLicense.connect(addr1).mint(1, "", { value: price });

        //     // Get the tokenId of the minted NFT
        //     const tokenId = await nodeLicense.totalSupply();

        //     // Get the owner's balance before refund
        //     const balanceBeforeRefund = await ethers.provider.getBalance(addr1.address);

        //     // Refund the node license
        //     await nodeLicense.connect(nodeLicenseDefaultAdmin).refundNodeLicense(tokenId, { value: price });

        //     // Check if the token has been burned
        //     await expect(nodeLicense.ownerOf(tokenId)).to.be.revertedWith("ERC721: invalid token ID");

        //     // Get the owner's balance after refund
        //     const balanceAfterRefund = await ethers.provider.getBalance(addr1.address);

        //     // Check if the owner's balance has increased
        //     expect(balanceAfterRefund).to.be.gt(balanceBeforeRefund);
        // });

        // it("Check the price of buying a bulk amount of NFTs", async function() {
        //     const {nodeLicense, nodeLicenseDefaultAdmin} = await loadFixture(deployInfrastructure);
        //     const tiers = parse(fs.readFileSync('tierUpload.csv'), { columns: true });

        //     // Get the total supply of NFTs
        //     const totalSupply = await nodeLicense.totalSupply();

        //     // Refund all existing NFTs
        //     const firstTierPrice = ethers.parseEther(tiers[0].unitCostInEth.toString());
        //     for (let i = 1; i <= totalSupply; i++) {
        //         await nodeLicense.connect(nodeLicenseDefaultAdmin).refundNodeLicense(i, { value: firstTierPrice });
        //     }

        //     // Check if the price adjusts as it goes between tiers
        //     let totalQuantity = BigInt(0);
        //     for (let i = 0; i < tiers.length; i++) {
        //         const tier = tiers[i];
        //         const priceForCurrentTier = await nodeLicense.price(totalQuantity + BigInt(tier.quantityBeforeNextTier), "");
        //         const priceForPreviousTiers = i > 0 ? await nodeLicense.price(totalQuantity, "") : 0n;
        //         const expectedPriceForCurrentTier = ethers.parseEther(tier.unitCostInEth.toString()) * BigInt(tier.quantityBeforeNextTier);
        //         const priceDifference = priceForCurrentTier - priceForPreviousTiers;
        //         expect(priceDifference).to.equal(expectedPriceForCurrentTier);
        //         totalQuantity += BigInt(tier.quantityBeforeNextTier);
        //     }
        // });
    
        it("Check if the new fundsReceiver receives the funds", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1, addr2} = await loadFixture(deployInfrastructure);
            const newFundsReceiver = addr2;

            // Set the new fundsReceiver
            await nodeLicense.connect(nodeLicenseDefaultAdmin).setFundsReceiver(newFundsReceiver.address);

            // Get the balance of the new fundsReceiver before minting
            const balanceBeforeMint = await ethers.provider.getBalance(newFundsReceiver.address);

            // Mint a NodeLicense
            const price = await nodeLicense.price(1, "");
            await nodeLicense.connect(addr1).mint(1, "", { value: price });

            // Get the balance of the new fundsReceiver after minting
            const balanceAfterMint = await ethers.provider.getBalance(newFundsReceiver.address);

            // Check if the new fundsReceiver's balance has increased by the price of the NodeLicense
            expect(balanceAfterMint).to.equal(balanceBeforeMint + price);
        });

        it("Check if setting a pricing tier out of bounds fails", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin} = await loadFixture(deployInfrastructure);
            const price = ethers.parseEther("1");
            const quantity = BigInt(100);
            const index = BigInt(10000000);

            // Try to set a pricing tier out of bounds
            await expect(nodeLicense.connect(nodeLicenseDefaultAdmin).setOrAddPricingTier(index, price, quantity)).to.be.revertedWith("Index out of bounds");
        });

        it("Check if setting a different referral percentages applies a different discount and gives a different amount to referrals", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1} = await loadFixture(deployInfrastructure);
            const newReferralDiscountPercentage = BigInt(10);
            const newReferralRewardPercentage = BigInt(20);

            // Set the new referral percentages
            await nodeLicense.connect(nodeLicenseDefaultAdmin).setReferralPercentages(newReferralDiscountPercentage, newReferralRewardPercentage);

            // Create a new promo code
            const promoCode = "NEWPROMO";
            await nodeLicense.connect(nodeLicenseDefaultAdmin).createPromoCode(promoCode, nodeLicenseDefaultAdmin.address);

            // Mint a NodeLicense with the new promo code
            const priceBeforeDiscount = await nodeLicense.price(1, "");
            await nodeLicense.connect(addr1).mint(1, promoCode, { value: priceBeforeDiscount });

            // Check if the discount applied is equal to the new referral discount percentage
            const priceAfterDiscount = await nodeLicense.price(1, promoCode);
            expect(priceBeforeDiscount - priceAfterDiscount).to.equal(priceBeforeDiscount * newReferralDiscountPercentage / BigInt(100));

            // Check if the referral reward is equal to the new referral reward percentage
            const promoCodeDetails = await nodeLicense.getPromoCode(promoCode);
            const referralReward = promoCodeDetails.receivedLifetime;
            expect(referralReward).to.equal(priceAfterDiscount * newReferralRewardPercentage / BigInt(100));
        });

        it("Check if supportsInterface returns correct boolean value", async function() {
            const {nodeLicense} = await loadFixture(deployInfrastructure);

            // Check if supportsInterface returns true for ERC721EnumerableUpgradeable interface
            expect(await nodeLicense.supportsInterface("0x780e9d63")).to.be.true;

            // Check if supportsInterface returns false for a random interface
            expect(await nodeLicense.supportsInterface("0x12345678")).to.be.false;
        });

        it("Check if can mint with USDC to recipient address", async function() {
            const {
                addr1, 
                addr2,
                nodeLicense,
                fundsReceiver,
                usdcToken
            } = await loadFixture(deployInfrastructure);

            //initialize
            const callerAddress = await addr1.getAddress();
            const recipientAddress = await addr2.getAddress();

            //mint USDC tokens to caller and approve
            const price = await nodeLicense.price(1, ""); //157945445600000000
            const expectedPriceInUSDC = 473_836336800000000000n;
            await usdcToken.mint(callerAddress, expectedPriceInUSDC);
            await usdcToken.connect(addr1).approve(await nodeLicense.getAddress(), expectedPriceInUSDC);
            
            //get pre values
            const preFundsReceiverBalance = await usdcToken.balanceOf(fundsReceiver.address);
            const preCallerBalance = await usdcToken.balanceOf(callerAddress);
            const preRecipientBalance = await usdcToken.balanceOf(recipientAddress);
            const preTotalSupply = await nodeLicense.totalSupply();

            //mint an NFT with USDC
            await nodeLicense.connect(addr1).mintToWithUSDC(recipientAddress, 1, "", expectedPriceInUSDC);

            //check the NFT was received
            const tokenId = preTotalSupply + BigInt(1);
            expect(await nodeLicense.ownerOf(tokenId)).to.equal(recipientAddress);

            //check the fundsReceiver received the funds
            const postFundsReceiverBalance = await usdcToken.balanceOf(fundsReceiver.address);
            expect(postFundsReceiverBalance).to.eq(preFundsReceiverBalance + expectedPriceInUSDC);

            //check the total supply increased
            const postTotalSupply = await nodeLicense.totalSupply();
            expect(postTotalSupply).to.eq(preTotalSupply + BigInt(1));
        });

        it("Check if can mint with USDC to recipient address using a valid promo code", async function() {
            const {
                addr1, 
                addr2,
                addr3,
                nodeLicense,
                fundsReceiver,
                usdcToken
            } = await loadFixture(deployInfrastructure);

            //initialize
            const callerAddress = await addr1.getAddress();
            const recipientAddress = await addr2.getAddress();

            //mint USDC tokens to caller and approve
            const price = await nodeLicense.price(1, ""); //157945445600000000
            const expectedPriceInUSDC = 426_452703120000000000n;
            const expectedReferralReward = 8_529054062400000000n;
            await usdcToken.mint(callerAddress, expectedPriceInUSDC);
            await usdcToken.connect(addr1).approve(await nodeLicense.getAddress(), expectedPriceInUSDC);
            
            //get pre values
            const preFundsReceiverBalance = await usdcToken.balanceOf(fundsReceiver.address);
            const preCallerBalance = await usdcToken.balanceOf(callerAddress);
            const preRecipientBalance = await usdcToken.balanceOf(recipientAddress);
            const preTotalSupply = await nodeLicense.totalSupply();

            //mint an NFT with USDC using a valid promo code
            const validPromoCode = await addr3.getAddress();
            await nodeLicense.connect(addr1).mintToWithUSDC(recipientAddress, 1, validPromoCode, expectedPriceInUSDC);

            //check the NFT was received
            const tokenId = preTotalSupply + BigInt(1);
            expect(await nodeLicense.ownerOf(tokenId)).to.equal(recipientAddress);

            //check the fundsReceiver received the funds
            const postFundsReceiverBalance = await usdcToken.balanceOf(fundsReceiver.address);
            expect(postFundsReceiverBalance).to.eq(preFundsReceiverBalance + expectedPriceInUSDC - expectedReferralReward);

            //check the nodeLicense contract retained the referral reward
            const referralBalance = await usdcToken.balanceOf(await nodeLicense.getAddress());
            expect(referralBalance).to.eq(expectedReferralReward);

            //check the total supply increased
            const postTotalSupply = await nodeLicense.totalSupply();
            expect(postTotalSupply).to.eq(preTotalSupply + BigInt(1));
        });

        it("Check if can claim USDC referral rewards", async function() {
            const {
                addr1, 
                addr2,
                addr3,
                nodeLicenseDefaultAdmin,
                nodeLicense,
                fundsReceiver,
                usdcToken
            } = await loadFixture(deployInfrastructure);

            //set claimable to true
            await nodeLicense.connect(nodeLicenseDefaultAdmin).setClaimable(true);

            //initialize
            const callerAddress = await addr1.getAddress();
            const recipientAddress = await addr2.getAddress();

            //mint USDC tokens to caller and approve
            const price = await nodeLicense.price(1, ""); //157945445600000000
            const expectedPriceInUSDC = 426_452703120000000000n;
            const expectedReferralReward = 8_529054062400000000n;
            await usdcToken.mint(callerAddress, expectedPriceInUSDC);
            await usdcToken.connect(addr1).approve(await nodeLicense.getAddress(), expectedPriceInUSDC);

            //mint an NFT with USDC using a valid promo code
            const validPromoCodeAddress = await addr3.getAddress();
            await nodeLicense.connect(addr1).mintToWithUSDC(recipientAddress, 1, validPromoCodeAddress, expectedPriceInUSDC);

            //get pre values
            const preReferralBalance = await usdcToken.balanceOf(validPromoCodeAddress);
            const preNodeLicenseBalance = await usdcToken.balanceOf(await nodeLicense.getAddress());

            //claim referral rewards
            const claimReferralTrx = await nodeLicense.connect(addr3).claimReferralReward();
            const claimReferralRec = await claimReferralTrx.wait();

            //get post values
            const postReferralBalance = await usdcToken.balanceOf(validPromoCodeAddress);
            const postNodeLicenseBalance = await usdcToken.balanceOf(await nodeLicense.getAddress());

            //check balances
            expect(postReferralBalance).to.eq(preReferralBalance + expectedReferralReward);
            expect(postNodeLicenseBalance).to.eq(preNodeLicenseBalance - expectedReferralReward);

            //check events
            const rewardsClaimedEventSignature = ethers.keccak256(
                ethers.toUtf8Bytes(`RewardClaimed(address,uint256,uint256,uint256,uint256)`)
            );
            const rewardClaimedLog = claimReferralRec.logs.filter((log) => {
                return log.topics[0] === rewardsClaimedEventSignature;
            });
            expect((rewardClaimedLog[0]).fragment.name).to.equal("RewardClaimed");
            expect((rewardClaimedLog[0]).args[4]).to.equal(expectedReferralReward);
        });

        it("Checks calling adminMintTo without ADMIN_MINT_ROLE will fail", async function () {
            const { nodeLicense, addr1 } = await loadFixture(deployInfrastructure);

            // Verify that the wallet does not have the role
            expect(
                await nodeLicense.hasRole(await nodeLicense.ADMIN_MINT_ROLE(), addr1.address)
            ).to.equal(false);

            const amountToMint = 10;
            const totalSupplyBefore = await nodeLicense.totalSupply();
            const addr1BalanceBefore = await nodeLicense.balanceOf(addr1.address);

            // Verify that we revert with the correct error for access control missing role
            const expectedRevertMessage = `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await nodeLicense.ADMIN_MINT_ROLE()}`;
            await expect(
                nodeLicense.connect(addr1).adminMintTo(addr1.address, amountToMint)
            ).to.be.revertedWith(expectedRevertMessage);

            // Check that addr1's balance remains unchanged
            const addr1Balance = await nodeLicense.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(addr1BalanceBefore);

            const totalSupplyAfter = await nodeLicense.totalSupply();
            expect(totalSupplyAfter).to.equal(totalSupplyBefore);
        });

        it("Checks that the admin can mint to a receiver without fee", async function () {
            const { nodeLicense, nodeLicenseDefaultAdmin, addr1 } = await loadFixture(deployInfrastructure);

            const totalSupplyBefore = await nodeLicense.totalSupply();
            const addr1BalanceBefore = await nodeLicense.balanceOf(addr1.address);
            const adminETHBeforeMint = await ethers.provider.getBalance(nodeLicenseDefaultAdmin.address);

            // Verify that the wallet has the role
            expect(
                await nodeLicense.hasRole(await nodeLicense.ADMIN_MINT_ROLE(), nodeLicenseDefaultAdmin.address)
            ).to.equal(true);

            // Call adminMintTo to mint tokens to addr1
            const amountToMint = 10;
            const tx = await nodeLicense.connect(nodeLicenseDefaultAdmin).adminMintTo(addr1.address, amountToMint);
            // Calculate the gas used for checking balance 
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed;
            const gasPrice = tx.gasPrice;
            const gasCost = gasUsed * gasPrice;

            // Verify ETH balance has not changed
            const adminETHAfterMint = await ethers.provider.getBalance(nodeLicenseDefaultAdmin.address);
            expect(adminETHBeforeMint - gasCost).to.equal(adminETHAfterMint);

            // Verify the totalSupply updated correctly
            const totalSupplyAfter = await nodeLicense.totalSupply();
            expect(totalSupplyAfter).to.equal(totalSupplyBefore + BigInt(amountToMint));

            // Verify addr1 received the correct number of tokens
            const addr1Balance = await nodeLicense.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(BigInt(addr1BalanceBefore) + BigInt(amountToMint));
        });

        it("Should not allow the adminMintTo to exceed the maxSupply", async function () {
            const { nodeLicense, nodeLicenseDefaultAdmin, addr1 } = await loadFixture(deployInfrastructure);

            const slotIndex = 253; // NodeLicense8 storage slot for maxSupply (Read this from the artifacts json after running compile)

            const totalSupply = await nodeLicense.totalSupply();

            //Set the maxSupply to the current totalSupply
            const value = ethers.zeroPadValue(ethers.toBeHex(totalSupply), 32);
            await ethers.provider.send("hardhat_setStorageAt", [
                nodeLicense.target,
                ethers.toQuantity(slotIndex),
                value,
            ]);

            const maxSupply = await nodeLicense.maxSupply();
            expect(maxSupply).to.equal(totalSupply);

            const addr1BalanceBefore = await nodeLicense.balanceOf(addr1.address);

            // Verify that the wallet does have the role
            expect(
                await nodeLicense.hasRole(await nodeLicense.ADMIN_MINT_ROLE(), nodeLicenseDefaultAdmin.address)
            ).to.equal(true);

            // Verify mintTo fails for maxSupply
            await expect(
                nodeLicense.connect(nodeLicenseDefaultAdmin).adminMintTo(addr1.address, 10)
            ).to.be.revertedWith("Exceeds maxSupply");

            const totalSupplyAfter = await nodeLicense.totalSupply();
            expect(totalSupplyAfter).to.equal(totalSupply);

            const addr1Balance = await nodeLicense.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(addr1BalanceBefore);

        });

    }
}