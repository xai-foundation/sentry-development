export let config = {
  "arbitrumBlockExplorer": "https://arbiscan.io",
  "arbitrumGoerliBlockExplorer": "https://goerli.arbiscan.io",
  "arbitrumOneJsonRpcUrl": (typeof process !== 'undefined' && process.env && process.env.ARB_ONE_RPC) || "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  "arbitrumOneWebSocketUrl": (typeof process !== 'undefined' && process.env && process.env.ARB_ONE_WEBSOCKET) || "wss://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  "defaultRpcUrl": "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
  "esXaiAddress": "0x5776784C2012887D1f2FA17281E406643CBa5330",
  "chainlinkEthUsdPriceFeed": "0x96452A47527e30a50F238c9867663F7c4D1e8656",
  "chainlinkXaiUsdPriceFeed": "0x88EBC5D5317BC539efdb01dc8f425808B402D420",
  "esXaiDeployedBlockNumber": 157193630,
  "esXaiImplementationAddress": "0x8d6c063656b00e5c37ce007c0f99848d58f19d6b",
  "gasSubsidyAddress": "0x94F4aBC83eae00b693286B6eDCa09e1D76183C97",
  "gasSubsidyDeployedBlockNumber": 157193649,
  "gasSubsidyImplementationAddress": "0xf208798482f0b12c8767bc03cc0f145d18bece6a",
  "nodeLicenseAddress": "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2",
  "nodeLicenseDeployedBlockNumber": 157193743,
  "nodeLicenseImplementationAddress": "0xf765452e587ad0ae785dc984963897c05d4c8c71",
  "refereeAddress": "0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b",
  "refereeDeployedBlockNumber": 157193676,
  "refereeImplementationAddress": "0x29a7b907fdf4a9235f46d891b7aa1e7d3d35a3b6",
  "refereeCalculationsAddress": "", // TODO Add RefereeCalculations address
  "rollupAddress": "0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336",
  "xaiAddress": "0x724E98F16aC707130664bb00F4397406F74732D0",
  "xaiDeployedBlockNumber": 157193610,
  "xaiImplementationAddress": "0x3fb787101dc6be47cfe18aeee15404dcc842e6af",
  "xaiGaslessClaimAddress": "0x149107dEB70b9514930d8e454Fc32E77C5ABafE0",
  "xaiRedEnvelope2024Address": "0x080C2e59e963959Bbe9Ea064d1bcBc881F380Ff2",
  "xaiRedEnvelope2024ImplementationAddress": "0xf26Af8313cB039A58b86c2Ab7aA5c540EcEEB70f",
  "poolFactoryAddress": "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
  "poolFactoryAddressImplementationAddress": "0x87Ae2373007C01FBCED0dCCe4a23CA3f17D1fA9A",
  "defaultNetworkName": "arbitrumSepolia",
  "subgraphEndpoint": "https://subgraph.satsuma-prod.com/f37507ea64fb/xai/sentry-sepolia/version/0.0.19-sepolia-102/api",
  "publicRPC": "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  "alchemyApiKey": "8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
  "crossmintProjectId": "cc616c84-6479-4981-a24e-adb4278df212", //TODO Add Production Values
  "crossmintCollectionId": "854640e1-149c-4092-a40b-bdf2a3f36e64", //TODO Add Production Values
};

export function setConfig(_config: any) { config = _config; }