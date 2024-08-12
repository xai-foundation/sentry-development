import { PoolInfo, SentryWallet, RefereeConfig } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * 
 * @param operator - The public key of the wallet running the operator
 * @param whitelist - Optional array of whitelisted addresses
 * @returns The SentryWallet entity from the graph
 */
export async function getSentryWalletsForOperator(
  operator: string,
  whitelist?: string[],
  submissionsFilter?: { winningKeyCount?: boolean, claimed?: boolean, latestChallengeNumber?: bigint }
): Promise<{ wallets: SentryWallet[], pools: PoolInfo[], refereeConfig: RefereeConfig }> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  let submissionQuery = ``;
  let submissionQueryWallets = ``;
  if (submissionsFilter) {

    let submissionQueryFilter: string[] = [];
    const { winningKeyCount, claimed, latestChallengeNumber } = submissionsFilter;
    if (winningKeyCount != undefined) {
      submissionQueryFilter.push(`winningKeyCount_gt: 0`)
    }
    if (claimed != undefined) {
      submissionQueryFilter.push(`claimed: ${claimed}`)
    }
    if (latestChallengeNumber != undefined) {
      submissionQueryFilter.push(`challengeId_gte: ${latestChallengeNumber.toString()}`)
    }

    submissionQuery = gql`
        submissions(first: 10000, orderBy: challengeId, orderDirection: desc, where: {${submissionQueryFilter.join(",")}}) { 
          challengeId
          winningKeyCount
          claimed 
        }
      `
    submissionQueryWallets = gql`
        bulkSubmissions(first: 10000, orderBy: challengeId, orderDirection: desc, where: {${submissionQueryFilter.join(",")}}) { 
          challengeId
          winningKeyCount
          claimed 
        }
      `
  }

  const query = gql`
    query OperatorAddresses {
      sentryWallets(first: 1000, where: {
        or: [
          {address: "${operator.toLowerCase()}"}, 
          {approvedOperators_contains: ["${operator.toLowerCase()}"]}
        ]
      }) {
        isKYCApproved
        address
        v1EsXaiStakeAmount
        stakedKeyCount
        keyCount
        ${submissionQueryWallets}
      }
      poolInfos(first: 1000, where: {or: [{owner: "${operator.toLowerCase()}"}, {delegateAddress: "${operator.toLowerCase()}"}]}) {
        address
        owner
        delegateAddress
        totalStakedEsXaiAmount
        totalStakedKeyAmount
        metadata
        ${submissionQuery}
      }
      refereeConfig(id: "RefereeConfig") {
        maxKeysPerPool
        maxStakeAmountPerLicense
        stakeAmountBoostFactors
        stakeAmountTierThresholds
        version
      }
    }
  `

  const result = await client.request(query) as any;

  let wallets: SentryWallet[] = result.sentryWallets;
  let pools: PoolInfo[] = result.poolInfos;

  if (whitelist && whitelist.length) {
    const _whitelist = whitelist.map(w => w.toLowerCase())
    wallets = wallets.filter(w => _whitelist.includes(w.address.toLowerCase()));
    pools = pools.filter(p => _whitelist.includes(p.address.toLowerCase()));
  }

  return { wallets, pools, refereeConfig: result.refereeConfig };
}