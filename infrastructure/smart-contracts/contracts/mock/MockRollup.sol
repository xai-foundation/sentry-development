// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

/**
 * @title Mock Chainlink Price Feed
 * @notice Mock Chainlink Price Feed contract for testing purposes
 */
contract MockRollup {
    uint64 public nodeCounter;

    mapping(uint64 => Node) public nodes;

    struct Node {
        // Hash of the data that will be committed if this node is confirmed
        bytes32 confirmData;
        // Index of the node previous to this one
        uint64 prevNum;
        // The block number when this node was created
        uint64 createdAtBlock;
    }

    event NodeConfirmed(
        uint64 indexed nodeNum,
        bytes32 blockHash,
        bytes32 sendRoot
    );

    constructor() {
        nodeCounter = 0;
    }

    function triggerNodeConfirmed(
        bytes32 _confirmData,
        bytes32 _blockHash,
        bytes32 _sendRoot
    ) external {
        nodeCounter++;
        nodes[nodeCounter] = Node({
            confirmData: _confirmData,
            prevNum: nodeCounter - 1,
            createdAtBlock: uint64(block.number)
        });

        emit NodeConfirmed(nodeCounter, _blockHash, _sendRoot);
    }
}
