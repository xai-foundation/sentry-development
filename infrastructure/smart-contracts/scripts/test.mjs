import hardhat from "hardhat";
const { ethers} = hardhat;
//TODO Add current proxy contract address to update
const address = "0xFaBd7d8D3540254E94811FB33A94537c04D3fEB7";


async function checkProxyImplementation(proxyAddress, provider) {

  // ABI for the function we want to call
  const abi = ['function implementation() view returns (address)'];

  // Create a contract instance
  const proxyContract = new ethers.Contract(proxyAddress, abi, provider);

  try {
      // Call the implementation() function
      const implementationAddress = await proxyContract.implementation();
      console.log('Current implementation address:', implementationAddress);
      return implementationAddress;
  } catch (error) {
      console.error('Error fetching implementation address:', error);
      
      // If implementation() doesn't exist, try reading the storage slot directly
      const storageSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
      const implementationAddress = await provider.getStorageAt(proxyAddress, storageSlot);
      console.log('Implementation address from storage slot:', implementationAddress);
      return implementationAddress;
  }
}


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    checkProxyImplementation(address, deployer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });



