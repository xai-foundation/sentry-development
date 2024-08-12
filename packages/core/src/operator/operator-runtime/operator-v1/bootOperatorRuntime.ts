import { getLatestChallenge, getLatestChallengeFromGraph, getSentryWalletsForOperator, getSubgraphHealthStatus, listenForChallenges, MAX_CHALLENGE_CLAIM_AMOUNT, retry } from "../../../index.js";
import { listenForChallengesCallback } from "../listenForChallengesCallback.js";
import { processNewChallenge_V1 } from "./processNewChallenge.js";
import { findSubmissionOnSentryKey } from "../findSubmissionOnSentryKey.js";
import { operatorState } from "../operatorState.js";
import { loadOperatorKeysFromGraph_V1, processClosedChallenge, processNewChallenge, processPastChallenges, processPastChallenges_V1 } from "../index.js";
import { loadOperatorKeysFromRPC_V1 } from "./loadOperatorKeysFromRPC.js";
import { loadOperatorWalletsFromGraph } from "../loadOperatorWalletsFromGraph.js";
import { loadOperatorWalletsFromRPC } from "../loadOperatorWalletsFromRPC.js";

/**
 * Startup the operatorRuntime challenger listener as well as process previous challenges
 */
export const bootOperatorRuntime_V1 = async (
    logFunction: (log: string) => void,
    startFromGraph: boolean
): Promise<() => void> => {
    let closeChallengeListener: () => void;
    logFunction(`Started listener for new challenges.`);

    if (startFromGraph && (await getSubgraphHealthStatus())) {
        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        const openChallenge = await retry(() => getLatestChallengeFromGraph());
        // Calculate the latest challenge we should load from the graph
        const latestClaimableChallenge = Number(openChallenge.challengeNumber) <= MAX_CHALLENGE_CLAIM_AMOUNT ? 1 : Number(openChallenge.challengeNumber) - MAX_CHALLENGE_CLAIM_AMOUNT;

        // Load all sentryKey objects including all winning and unclaimed submissions up until latestClaimableChallenge
        // const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } =
        //     await retry(() => loadOperatorKeysFromGraph_V1(operatorState.operatorAddress, BigInt(latestClaimableChallenge)));

        // await processNewChallenge_V1(BigInt(openChallenge.challengeNumber), openChallenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);

        const { wallets, pools, refereeConfig } = await retry(() => getSentryWalletsForOperator(operatorState.operatorAddress, operatorState.passedInOwnersAndPools, { latestChallengeNumber: BigInt(latestClaimableChallenge), winningKeyCount: true, claimed: false }));

        const bulkOwnersAndPools = await loadOperatorWalletsFromGraph(operatorState.operatorAddress, { wallets, pools }, BigInt(latestClaimableChallenge));

        await processNewChallenge(openChallenge.challengeNumber, openChallenge, bulkOwnersAndPools, refereeConfig);

        logFunction(`Processing open challenges.`);

        //Remove submissions for current challenge so we don't process it again
        bulkOwnersAndPools.forEach(b => {
            const foundSubmission = b.bulkSubmissions!.find(s => {
                return Number(s.challengeId) == Number(openChallenge.challengeNumber)
            });
            if (foundSubmission) {
                b.bulkSubmissions!.splice(b.bulkSubmissions!.indexOf(foundSubmission), 1);
            }
        });


        processPastChallenges(
            bulkOwnersAndPools,
            openChallenge.challengeNumber,
            latestClaimableChallenge
        ).then(() => {
            logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
        });

        //Process all past challenges check for unclaimed
        // processPastChallenges_V1(
        //     nodeLicenseIds,
        //     sentryKeysMap,
        //     sentryWalletMap,
        //     openChallenge.challengeNumber,
        //     latestClaimableChallenge
        // ).then(() => {
        //     logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
        // })

    } else {
        operatorState.cachedLogger(`Revert to RPC call instead of using subgraph. Subgraph status error: DEV MODE ALTERNATE HEALTH`)

        // const { sentryKeysMap, nodeLicenseIds } = await loadOperatorKeysFromRPC_V1(operatorState.operatorAddress);

        const bulkOwnersAndPools = await loadOperatorWalletsFromRPC(operatorState.operatorAddress);

        const [latestChallengeNumber, latestChallenge] = await getLatestChallenge();

        await processNewChallenge(latestChallengeNumber, latestChallenge, bulkOwnersAndPools);
        await processClosedChallenge(latestChallengeNumber - 1n, bulkOwnersAndPools);
        // await processNewChallenge_V1(latestChallengeNumber, latestChallenge, nodeLicenseIds, sentryKeysMap);

        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
    }

    return closeChallengeListener;
}