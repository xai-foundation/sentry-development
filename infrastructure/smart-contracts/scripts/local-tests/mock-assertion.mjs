import hardhat from "hardhat";

const { ethers } = hardhat;

async function getNodeConfirmedEvents(rollupCore, fromBlock, toBlock, nodeNum) {
    const filter = rollupCore.filters.NodeConfirmed(nodeNum);
    const events = await rollupCore.queryFilter(filter, fromBlock, toBlock);
    return events;
  }

async function main() {

    const deployer = (await ethers.getSigners())[0];
    const arbitrumRPC = "https://arb-mainnet.g.alchemy.com/v2/oD4X3JXvJclnt36mDkqnp9CO2sZkNhYT";

	const assertionId = 5850;
    //const diff = 7574;
    const sepoliaAssertionId = assertionId;
    const block = 255195800;
    const BLOCKS_TO_WAIT = 1;

	const abi = [
        "function getNode(uint64 nodeNum)",
        "event NodeConfirmed(uint64 indexed nodeNum, bytes32 blockHash, bytes32 sendRoot)"
    ];
	const rollupAddress = `0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336`;


    // Manually create a new provider for the desired network
    const newProvider = new ethers.JsonRpcProvider(arbitrumRPC);
    const rollupCore = new ethers.Contract(rollupAddress, abi, newProvider);

    const events = await getNodeConfirmedEvents(rollupCore, block, block, assertionId);

    const blockHash = events[0].args.blockHash;
    const sendRoot = events[0].args.sendRoot;

	// Step 2: Submit the same assertion to the Mock Rollup
    const mockRollupAbi = [
        "function createNode(uint64 nodeNum, bytes32 blockHash, bytes32 sendRoot)",
        "function confirmNode(uint64 nodeNum, bytes32 blockHash, bytes32 sendRoot)"
    ];
	const mockRollupAddress = `0xb3b08bE5041d3F94C9fD43c91434515a184a43af`;
    const mockRollup = new ethers.Contract(mockRollupAddress, mockRollupAbi, deployer);

    const createTx = await mockRollup.createNode(sepoliaAssertionId, blockHash, sendRoot);
    await createTx.wait(BLOCKS_TO_WAIT);

    //Set 3 second timeout
    //await new Promise(resolve => setTimeout(resolve, 16000));

    console.log(`Assertion ${assertionId} created in Mock Rollup`);

    const confirmTx = await mockRollup.confirmNode(sepoliaAssertionId, blockHash, sendRoot);
    await confirmTx.wait(BLOCKS_TO_WAIT);

    console.log(`Assertion ${assertionId} submitted to Mock Rollup`);



	// Step 3: Submit a Challenge to the Referee

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
