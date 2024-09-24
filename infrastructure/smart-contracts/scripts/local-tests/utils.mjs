import hardhat from "hardhat";

const { ethers } = hardhat;

const BLOCKS_TO_WAIT = 1;
const deployer = (await ethers.getSigners())[0];

const arbitrumRPC = "https://arb-mainnet.g.alchemy.com/v2/oD4X3JXvJclnt36mDkqnp9CO2sZkNhYT";
const rollupAddress = `0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336`;

const abi = [
    "function getNode(uint64 nodeNum)",
    "event NodeConfirmed(uint64 indexed nodeNum, bytes32 blockHash, bytes32 sendRoot)"
];


export async function getNodeConfirmedEvents(fromBlock, toBlock, nodeNum) {
    // Manually create a new provider for the desired network
    const newProvider = new ethers.JsonRpcProvider(arbitrumRPC);
    const rollupCore = new ethers.Contract(rollupAddress, abi, newProvider);
    const filter = rollupCore.filters.NodeConfirmed(nodeNum);
    const events = await rollupCore.queryFilter(filter, fromBlock, toBlock);
    return events;
}


const mockRollupAbi = [
    "function createNode(uint64 nodeNum, bytes32 blockHash, bytes32 sendRoot)",
    "function confirmNode(uint64 nodeNum, bytes32 blockHash, bytes32 sendRoot)"
];
const mockRollupAddress = `0xb3b08bE5041d3F94C9fD43c91434515a184a43af`;
const mockRollup = new ethers.Contract(mockRollupAddress, mockRollupAbi, deployer);


export async function createNode(assertionId, blockHash, sendRoot) {
    const createTx = await mockRollup.createNode(assertionId, blockHash, sendRoot);
    await createTx.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId} created in Mock Rollup`);
}

export async function confirmNode(assertionId, blockHash, sendRoot) {
    const confirmTx = await mockRollup.confirmNode(assertionId, blockHash, sendRoot);
    await confirmTx.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId} submitted to Mock Rollup`);
}