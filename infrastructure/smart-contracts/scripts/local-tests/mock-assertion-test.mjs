import { getNodeConfirmedEvents, createNode, confirmNode } from "./utils.mjs";


async function main() {

	const assertionId1 = 5860;
    const assertionBlock1 = 255338885;

    const assertionId2 = 5861;
    const assertionBlock2 = 255353351;

    const assertionId3 = 5862;
    const assertionBlock3 = 255367996;

    const assertionId4 = 5863;
    const assertionBlock4 = 255382168;
    
    // Submit Assertion 1 to Mock Rollup to trigger the initial challenge
    
    console.log(`Getting main net confirm data for assertion ${assertionId1} at block ${assertionBlock1}`);
    const events1 = await getNodeConfirmedEvents(assertionBlock1, assertionBlock1, assertionId1);

    const blockHash1 = events1[0].args.blockHash;
    const sendRoot1 = events1[0].args.sendRoot;

    console.log(`Creating assertion ${assertionId1} in Mock Rollup`);
    console.log(`Block Hash: ${blockHash1}`);
    console.log(`Send Root: ${sendRoot1}`);
    await createNode(assertionId1, blockHash1, sendRoot1);
    await confirmNode(assertionId1, blockHash1, sendRoot1);

    console.log("Waiting 15 seconds before submitting the next assertion");
    // Wait 15 Seconds and submit a new assertion to Mock Rollup
    await new Promise(r => setTimeout(r, 15000));


    // Submit Assertion 2 to Mock Rollup
    // This will not trigger a challenge because not enough time has passed
    
    console.log(`Getting main net confirm data for assertion ${assertionId2} at block ${assertionBlock2}`);
    const events2 = await getNodeConfirmedEvents(assertionBlock2, assertionBlock2, assertionId2);

    const blockHash2 = events2[0].args.blockHash;
    const sendRoot2 = events2[0].args.sendRoot;

    console.log(`Creating assertion ${assertionId2} in Mock Rollup`);
    console.log(`Block Hash: ${blockHash2}`);
    console.log(`Send Root: ${sendRoot2}`);
    
    await createNode(assertionId2, blockHash2, sendRoot2);
    await confirmNode(assertionId2, blockHash2, sendRoot2);

    // Wait two minutes and submit a new assertion to Mock Rollup
    
    console.log("Waiting 2 minutes before submitting the next assertion");
    console.log(`It should then trigger a batch challenge of assertions ${assertionId2} and ${assertionId3}`);
    await new Promise(r => setTimeout(r, 120000));

    // Submit Assertion 3 to Mock Rollup
    // This should trigger a batch challenge

    console.log(`Getting main net confirm data for assertion ${assertionId3} at block ${assertionBlock3}`);
    const events3 = await getNodeConfirmedEvents(assertionBlock3, assertionBlock3, assertionId3);

    const blockHash3 = events3[0].args.blockHash;
    const sendRoot3 = events3[0].args.sendRoot;

    console.log(`Creating assertion ${assertionId3} in Mock Rollup`);
    console.log(`Block Hash: ${blockHash3}`);
    console.log(`Send Root: ${sendRoot3}`);

    await createNode(assertionId3, blockHash3, sendRoot3);
    await confirmNode(assertionId3, blockHash3, sendRoot3);

    // Wait 2 minutes and 10 seconds and submit a new assertion to Mock Rollup

    console.log("Waiting 2 minutes and 10 seconds before submitting the next assertion");
    console.log(`It should then trigger a single challenge of assertion ${assertionId4}`);
    await new Promise(r => setTimeout(r, 130000));

    // Submit Assertion 4 to Mock Rollup
    // This should trigger a single challenge

    console.log(`Getting main net confirm data for assertion ${assertionId4} at block ${assertionBlock4}`);
    const events4 = await getNodeConfirmedEvents(assertionBlock4, assertionBlock4, assertionId4);

    const blockHash4 = events4[0].args.blockHash;
    const sendRoot4 = events4[0].args.sendRoot;

    console.log(`Creating assertion ${assertionId4} in Mock Rollup`);   
    console.log(`Block Hash: ${blockHash4}`);
    console.log(`Send Root: ${sendRoot4}`);

    await createNode(assertionId4, blockHash4, sendRoot4);
    await confirmNode(assertionId4, blockHash4, sendRoot4);

    console.log("Script Complete");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});


// Additional Assertions For Future Runs, must be run in order

// Assertion ID     Block Number
// 5864	            255396555
// 5865	            255410973
// 5866	            255425406
// 5867	            255439858

// 5868	            255454340
// 5869	            255468828
// 5870	            255483064
// 5871	            255497789

// 5872	            255511945
// 5873	            255526079
// 5874	            255540488
// 5875	            255554888

// 5876	            255569277
// 5877	            255583616
// 5878	            255598083
// 5879	            255612722