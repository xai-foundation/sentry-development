// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../upgrades/referee/Referee16.sol";
import "../upgrades/node-license/NodeLicense10.sol";
import "../upgrades/pool-factory/PoolFactory10.sol";

contract TinyKeysAirdrop is Initializable, AccessControlUpgradeable {
    using Math for uint256;

    // Address of the NodeLicense NFT contract
    address public nodeLicenseAddress;

    // Address for referee contract
    address public refereeAddress;

    // Pool Factory Address
    address public poolFactoryAddress;

    // Airdrop counter
    uint256 public airdropCounter; // Will be incremented after each airdrop segment

    // Total Supply At Start
    uint256 public totalSupplyAtStart; // Will be set at airdrop start

    // Key Multiplier for airdrop - the number of keys to be airdropped per node license
    uint256 public keyMultiplier; // Review for reducing variable size once determined

    // Airdrop Started
    bool public airdropStarted;

    // Marker for keyids to be auto staked
    mapping(uint256 => uint256[2]) public keyToStartEnd;

    // Airdrop Ended
    bool public airdropEnded;

    // Stake counter
    uint256 public stakeCounter; // Will be incremented after each airdrop segment

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[497] private __gap;

    // Events for various actions within the contract
    event AirdropStarted(uint256 totalSupplyAtStart, uint256 keyMultiplier);
    event AirdropSegmentComplete(uint256 startingKeyId, uint256 endingKeyId);
    event AirdropSegmentStakeComplete(
        address indexed owner,
        address indexed poolAddress,
        uint256 startingKeyId,
        uint256 endingKeyId
    );
    event AirdropEnded();

    // function initialize() public reinitializer(2) {
    //     airdropStarted = true;
    //     airdropEnded = false;
    //     stakeCounter = 4329;
    // }

    /**
     * @notice Start the airdrop
     * @dev This function will be called by the admin to start the airdrop
     * @dev It will set the total supply at start and emit the AirdropStarted event
     */
    function startAirdrop() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!airdropStarted, "Airdrop already started");
        // Start the airdrop
        // This will notify the node license contract to start the airdrop
        // The node license contract will then notify the referee contract
        // This will disable minting in the node license contract
        // This will also disable staking in the referee contract
        NodeLicense10(nodeLicenseAddress).startAirdrop(refereeAddress);

        // Set the total supply of node licenses at the start of the airdrop
        totalSupplyAtStart = NodeLicense10(nodeLicenseAddress).totalSupply();

        airdropStarted = true;
        emit AirdropStarted(totalSupplyAtStart, keyMultiplier);
    }

    function processAirdropSegmentOnlyMint(
        uint256 _qtyToProcess
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(airdropStarted, "Airdrop not started");
        require(airdropCounter <= totalSupplyAtStart, "Airdrop complete");
        // Start where we left off
        uint256 startingKeyId = airdropCounter;
        // Ensure we don't go over the total supply
        uint256 endingKeyId = Math.min(
            airdropCounter + _qtyToProcess,
            totalSupplyAtStart
        );
        // Connect to the referee and node license contracts
        NodeLicense10 nodeLicense = NodeLicense10(nodeLicenseAddress);

        // Loop through the range of node licenses
        // Needs to be <= to include the last key
        for (uint256 i = startingKeyId; i <= endingKeyId; i++) {
            address owner = nodeLicense.ownerOf(i);
            // Mint the airdropped keys for the owner
            nodeLicense.mintForAirdrop(keyMultiplier, owner);
        }

        // Update the airdrop counter
        // Increment the counter by the ending key id + 1
        airdropCounter = endingKeyId + 1;
        emit AirdropSegmentComplete(startingKeyId, endingKeyId);
    }

    function processAirdropSegmentOnlyStake(
        uint256 _qtyToProcess
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(airdropStarted, "Airdrop not started");
        require(!airdropEnded, "Airdrop already complete");
        require(
            stakeCounter <= airdropCounter,
            "Cannot stake non aidropped keys"
        );

        // Start where we left off
        uint256 startingKeyId = stakeCounter;

        // Ensure we don't go over the total supply
        uint256 endingKeyId = Math.min(
            stakeCounter + _qtyToProcess,
            totalSupplyAtStart
        );

        // Connect to the referee and node license contracts
        NodeLicense10 nodeLicense = NodeLicense10(nodeLicenseAddress);
        Referee16 referee = Referee16(refereeAddress);

        // Loop through the range of node licenses
        // Needs to be <= to include the last key
        for (uint256 i = startingKeyId; i <= endingKeyId; i++) {
            // Get the owner of the node license
            address owner = nodeLicense.ownerOf(i);

            // Get the pool address for the owner
            address poolAddress = referee.assignedKeyToPool(i);

            // If the pool address is not 0, stake the newly minted keys
            if (poolAddress != address(0)) {
                uint256[] memory stakeKeyIds = new uint256[](keyMultiplier);
                // Determine the initial token id for the newly minted keys
                // Calculate the starting ID for the new batch of tokens
                uint256 tokensAlreadyProcessed = 112935 + ((i - 4329) * keyMultiplier);
                uint256 newTokenStartId = tokensAlreadyProcessed + 1;

                // Create an array of key ids to stake
                for (uint256 j = 0; j < keyMultiplier; j++) {
                    stakeKeyIds[j] = newTokenStartId + j;
                }

                // Stake the keys
                PoolFactory10(poolFactoryAddress).stakeKeysAdmin(
                    poolAddress,
                    stakeKeyIds,
                    owner
                );

                // Emit the event
                emit AirdropSegmentStakeComplete(owner, poolAddress, stakeKeyIds[0], stakeKeyIds[stakeKeyIds.length-1]);
            }
        }

        // Update the stake counter
        // Increment the counter by the ending key id + 1
        stakeCounter = endingKeyId + 1;
    }

    function completeAirDrop() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // require(airdropStarted, "Airdrop not started");
        // require(!airdropEnded, "Airdrop already complete");
        // require(airdropCounter == totalSupplyAtStart, "Airdrop not complete");

        airdropStarted = false;
        airdropEnded = true;
        emit AirdropEnded();
    }
}
