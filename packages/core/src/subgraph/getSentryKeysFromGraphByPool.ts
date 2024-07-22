import { SentryKey } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * 
 * @param owners - The filter for the owner field
 * @param stakingPool - The filter for the assigned pool field
 * @param includeSubmissions - If the submissions should be included
 * @param submissionsFilter - The filter for the submissions if submissions should be included
 * @returns List of sentry key objects with metadata.
 */
export async function getSentryKeysFromGraphByPool(
  owners: string[],
  stakingPool: string,
  includeSubmissions: boolean,
  submissionsFilter: { eligibleForPayout?: boolean, claimed?: boolean, latestChallengeNumber?: bigint }
): Promise<SentryKey[]> {

  const client = new GraphQLClient(config.subgraphEndpoint);
  
  let submissionQuery = ``;
  if (includeSubmissions) {
    let submissionQueryFilter: string[] = [];
    const { eligibleForPayout, claimed, latestChallengeNumber } = submissionsFilter;
    if (eligibleForPayout != undefined) {
      submissionQueryFilter.push(`eligibleForPayout: ${eligibleForPayout}`)
    }
    if (claimed != undefined) {
      submissionQueryFilter.push(`claimed: ${claimed}`)
    }
    if (latestChallengeNumber != undefined) {
      submissionQueryFilter.push(`challengeNumber_gte: ${latestChallengeNumber.toString()}`)
    }

    submissionQuery = gql`
        submissions(first: 10000, orderBy: challengeNumber, orderDirection: desc, where: {${submissionQueryFilter.join(",")}}) { 
          challengeNumber
          nodeLicenseId
          claimAmount 
          claimed 
          eligibleForPayout
        }
      `
  }

  let filter = ``
  if (owners.length && stakingPool) {
    filter = `
      or: [
        {owner_in: [${owners.map(o => `"${o.toLowerCase()}"`).join(",")}]}, 
        {assignedPool: "${stakingPool.toLowerCase()}"}
      ]
    `
  } else if (owners.length) {
    filter = `owner_in: [${owners.map(o => `"${o.toLowerCase()}"`).join(",")}]`;
  } else if (stakingPool) {
    filter = `assignedPool: "${stakingPool.toLowerCase()}"`;
  }

  const query = gql`
      query SentryKeysQuery {
        sentryKeys(first: 10000, orderBy: keyId, orderDirection: asc, where: {${filter}} ) {
          assignedPool
          id
          keyId
          mintTimeStamp
          owner
          sentryWallet {
            isKYCApproved
            v1EsXaiStakeAmount
            keyCount
            stakedKeyCount
          }
          ${submissionQuery}
        }
      }
    `
  const result = await client.request(query) as any;
  return result.sentryKeys;
}