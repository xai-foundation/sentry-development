import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;


export async function sourcifyVerify(contractAddress, constructorArgs) {
    console.log(`Attempting to Verify using Sourcify: ${contractAddress}`);

    try {
        if (constructorArgs) {
            console.log(`constructorArgs: ${constructorArgs}`);
            await hre.run("verify:verify", { address: contractAddress, constructorArguments: constructorArgs });
        } else {
            await hre.run("verify:verify", { address: contractAddress });
        }
    } catch (e) {
        console.error("Failed to run verify ", e);
    }

    console.log("Verified!");
}

(async () => {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    // const contractFactory = await ethers.getContractFactory("Forwarder");

    // console.log("Deploying contract...");

    // const contract = await upgrades.deployProxy(contractFactory, [], { deployer: deployer });

    // await contract.waitForDeployment();

    // const deployedContractAddress = await contract.getAddress();

    // console.log("Contract deployed to: ", deployedContractAddress);

    // // const Referee = await ethers.getContractFactory("Referee");
    // // const referee = await upgrades.deployProxy(Referee, [config.esXaiAddress, config.xaiAddress, config.gasSubsidyAddress, 15], { deployer: deployer });
    // // const { blockNumber: refereeDeployedBlockNumber } = await referee.deploymentTransaction();
    // // const refereeAddress = await referee.getAddress();

    // await sourcifyVerify(deployedContractAddress);



    //TEST STUFF

    const testnetForwarder = "0x31635b37347258d7c6f83bDC664c5516Da8e6fD7";

    const ForwarderTestToken = await ethers.getContractFactory("ForwarderTestToken");
    const forwarderTestToken = await ForwarderTestToken.deploy(testnetForwarder);

    const forwarderTestTokenAddress = await forwarderTestToken.getAddress();
    console.log("forwarderTestToken deployed to: ", forwarderTestTokenAddress);

    const ForwarderTestNFT = await ethers.getContractFactory("ForwarderTestNFT");
    const forwarderTestNFT = await ForwarderTestNFT.deploy(testnetForwarder, forwarderTestTokenAddress);

    const forwarderTestNFTAddress = await forwarderTestNFT.getAddress();
    console.log("forwarderTestNFT deployed to: ", forwarderTestNFTAddress);


    await sourcifyVerify(forwarderTestTokenAddress, [testnetForwarder]);
    await sourcifyVerify(forwarderTestNFTAddress, [testnetForwarder, forwarderTestTokenAddress]);

})();

