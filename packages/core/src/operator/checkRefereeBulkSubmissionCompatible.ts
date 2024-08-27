import { ethers } from 'ethers';
import { getCurrentRefereeVersionFromGraph, RefereeAbi } from '../index.js';
import { config } from '../config.js';
import { RefereeConfig } from "@sentry/sentry-subgraph-client";
import { getProvider } from "../index.js";

/**
 * Checks if the current referee contract is compatible with bulk submission.
 * 
 * @param {RefereeConfig | undefined} refereeConfig - The configuration object for the referee, if already retrieved.
 * @returns {Promise<boolean>} - Returns `true` if the referee contract is compatible with bulk submission, otherwise `false`.
 */
export async function checkRefereeBulkSubmissionCompatible(
    refereeConfig?: RefereeConfig | undefined,
): Promise<boolean> {

    // If a refereeConfig is provided, check its version
    if (refereeConfig) {
        // If the version is greater than 6, it is compatible with bulk submission
        console.log("DEV Log checkRefereeBulkSubmissionCompatible fromGraph - tested refereeConfig.version", refereeConfig.version, "isCompatibleForBulk:", refereeConfig.version % 2 == 1);
        return refereeConfig.version % 2 == 1; //Current sepolia is 19, so downgrade will be 20 and represent the before state
    } else {
        // If the refereeConfig is not provided, we can assume the graph is not healthy
        // Check the contract using the RPC to determine if it is compatible

        // Get the provider for the blockchain network
        const provider = getProvider();
        // Initialize a contract instance with the referee's ABI and address
        const referee = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

        let isCompatible = true;
        // Try to access a new storage variable in the referee contract to determine its version
        try {
            // Attempt to read the refereeCalculationsAddress, which only exists in new versions of the contract
            const calcAddress = await referee.refereeCalculationsAddress();
            console.log("DEV Log checkRefereeBulkSubmissionCompatible fromRPC - tested refereeCalculationsAddress", calcAddress);
            const isBefore = await referee.isRefereeBulkSubmission();
            console.log("DEV Log checkRefereeBulkSubmissionCompatible fromRPC - isCompatibleForBulk:", isBefore == false);
            return isBefore == false;
        } catch (error) {
            // If an error occurs, it indicates the contract is an older version
            isCompatible = false;
        }
        return isCompatible;

    }

    // Default return false if none of the above checks pass
    return false;
}
