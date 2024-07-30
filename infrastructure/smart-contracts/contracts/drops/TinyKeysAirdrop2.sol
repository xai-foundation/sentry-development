// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../upgrades/referee/Referee16.sol";
import "../upgrades/node-license/NodeLicense10.sol";
import "../upgrades/pool-factory/PoolFactory10.sol";

contract TinyKeysAirdrop2 is Initializable, AccessControlUpgradeable {
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

    mapping(uint256 => uint256[2]) public keyToStartEnd;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[499] private __gap;

    // Events for various actions within the contract
    event AirdropStarted(uint256 totalSupplyAtStart, uint256 keyMultiplier);
    event AirdropSegmentComplete(uint256 startingKeyId, uint256 endingKeyId);
    event AirdropEnded();

    function updateMultiplier(uint256 _keyMultiplier) public {
        keyMultiplier = _keyMultiplier;
    }

    function updateAidropCount(uint256 _airdropCounter) public {
        airdropCounter = _airdropCounter;
    }
    
    function endAirdrop() public {
        NodeLicense10(nodeLicenseAddress).finishAirdrop(refereeAddress, keyMultiplier);
        emit AirdropEnded();
    }

    function updateStartEnd(uint256 keyId, uint256 start, uint256 end) public {
        keyToStartEnd[keyId] = [start, end];
    }

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

    /** 
     * @notice Process a segment of the airdrop
     * @dev This function will be called by the admin to process a segment of the airdrop
     * @dev It will airdrop keys to the node licenses in the specified range
     * @dev It will check to see if the node license is staked, if so, it will auto-stake the new keys
     * @dev If not, it will air-drop to the owner's wallet
     * @param _qtyToProcess The quantity of node licenses to process in this segment
    */
    function processAirdropSegment(uint256 _qtyToProcess) external onlyRole(DEFAULT_ADMIN_ROLE)  {
        require(airdropStarted, "Airdrop not started");
        require(airdropCounter <= totalSupplyAtStart, "Airdrop complete");
        // Start where we left off
        uint256 startingKeyId = airdropCounter;
        // Ensure we don't go over the total supply
        uint256 endingKeyId = Math.min(airdropCounter + _qtyToProcess, totalSupplyAtStart);     
        // Connect to the referee and node license contracts
        Referee16 referee = Referee16(refereeAddress);
        NodeLicense10 nodeLicense = NodeLicense10(nodeLicenseAddress);
        // Loop through the range of node licenses
        for (uint256 i = startingKeyId; i <= endingKeyId; i++) {
            // Determine the owner of each specific node license
            address owner = nodeLicense.ownerOf(i);
            // Check if the node license is staked
            address poolAddress = referee.assignedKeyToPool(i);

            uint256 start = nodeLicense.totalSupply() + 1;
            // Mint the airdropped keys for the owner
            nodeLicense.mintForAirdrop(keyMultiplier, owner);

            uint256 end = (start + keyMultiplier) - 1;

            keyToStartEnd[i] = [start, end];

            uint256[] memory stakeKeyIds = new uint256[](start - end);
            for (uint256 j = 0; j < stakeKeyIds.length; j++) {
                stakeKeyIds[j] = start + j;
            }

            if (poolAddress != address(0)) {
                // If staked, auto-stake the new keys
                PoolFactory10(poolFactoryAddress).stakeKeysAdmin(poolAddress, stakeKeyIds, owner);                           
            }
        }

        // Update the airdrop counter
        airdropCounter = endingKeyId;
        emit AirdropSegmentComplete(startingKeyId, endingKeyId);

        // If we have processed all node licenses, end the airdrop
        if (airdropCounter == totalSupplyAtStart) {
            // Notify the node license contract that the airdrop is complete
            // The node license contract will then notify the referee contract
            // This will re-enable minting in the node license contract
            // This will also re-enable staking in the referee contract
            NodeLicense10(nodeLicenseAddress).finishAirdrop(refereeAddress, keyMultiplier);
            emit AirdropEnded();
        }
    }

    function processAirdropSegmentOnlyMint(uint256 _qtyToProcess) external onlyRole(DEFAULT_ADMIN_ROLE)  {
        require(airdropStarted, "Airdrop not started");
        require(airdropCounter <= totalSupplyAtStart, "Airdrop complete");
        // Start where we left off
        uint256 startingKeyId = airdropCounter;
        // Ensure we don't go over the total supply
        uint256 endingKeyId = Math.min(airdropCounter + _qtyToProcess, totalSupplyAtStart);     
        // Connect to the referee and node license contracts
        NodeLicense10 nodeLicense = NodeLicense10(nodeLicenseAddress);
        // Loop through the range of node licenses
        for (uint256 i = startingKeyId; i < endingKeyId; i++) {
            // Determine the owner of each specific node license
            address owner = nodeLicense.ownerOf(i);

            uint256 start = nodeLicense.totalSupply() + 1;
            // Mint the airdropped keys for the owner
            nodeLicense.mintForAirdrop(keyMultiplier, owner);

            uint256 end = (start + keyMultiplier) - 1;

            keyToStartEnd[i] = [start, end];
        }

        // Update the airdrop counter
        airdropCounter = endingKeyId;
        emit AirdropSegmentComplete(startingKeyId, endingKeyId);
    }

    function processAirdropSegmentOnlyStake(uint256[] memory keyIds) external onlyRole(DEFAULT_ADMIN_ROLE)  {
        require(airdropStarted, "Airdrop not started");

        for (uint256 j = 0; j < keyIds.length; j++) {
            uint256 keyId = keyIds[j];
            uint256 startKeyId = keyToStartEnd[keyId][0];
            uint256 endKeyId = keyToStartEnd[keyId][1];

            require(endKeyId > startKeyId, "Invalid input");

            Referee16 referee = Referee16(refereeAddress);
            address owner = NodeLicense10(nodeLicenseAddress).ownerOf(keyId);

            address poolAddress = referee.assignedKeyToPool(keyId);

            //TODO do we need to allow this and just return ?
            // require(poolAddress != address(0), "Key not staked");
            if(poolAddress == address(0)){
                continue;
            }

            uint256[] memory stakeKeyIds = new uint256[](endKeyId - startKeyId);
            for (uint256 i = 0; i < stakeKeyIds.length; i++) {
                stakeKeyIds[i] = startKeyId + i;
            }

            PoolFactory10(poolFactoryAddress).stakeKeysAdmin(poolAddress, stakeKeyIds, owner);
        }
    }

}