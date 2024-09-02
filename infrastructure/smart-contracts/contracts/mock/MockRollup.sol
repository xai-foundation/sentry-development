// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockRollup {
    uint64 public latestNodeCreated;
    uint64 public latestConfirmed;

    struct GlobalState {
        bytes32 bytes32Vals;
        uint64[2] u64Vals;
    }

    struct Assertion {
        GlobalState beforeState;
        GlobalState afterState;
        uint64 numBlocks;
    }

    event NodeCreated(
        uint64 indexed nodeNum,
        bytes32 indexed parentNodeHash,
        bytes32 indexed nodeHash,
        bytes32 executionHash,
        Assertion assertion,
        bytes32 afterInboxBatchAcc,
        bytes32 wasmModuleRoot,
        uint256 inboxMaxCount
    );

    event NodeConfirmed(uint64 indexed nodeNum, bytes32 blockHash, bytes32 sendRoot);

    function createNode(
        bytes32 parentNodeHash,
        bytes32 nodeHash,
        bytes32 executionHash,
        Assertion memory assertion,
        bytes32 afterInboxBatchAcc,
        bytes32 wasmModuleRoot,
        uint256 inboxMaxCount
    ) external {
        // Input validation checks
        require(nodeHash != bytes32(0), "Node hash cannot be zero");
        require(executionHash != bytes32(0), "Execution hash cannot be zero");
        require(inboxMaxCount > 0, "Inbox max count must be greater than zero");

        latestNodeCreated++;
        emit NodeCreated(
            latestNodeCreated,
            parentNodeHash,
            nodeHash,
            executionHash,
            assertion,
            afterInboxBatchAcc,
            wasmModuleRoot,
            inboxMaxCount
        );
    }

    function confirmNode(bytes32 blockHash, bytes32 sendRoot) external {
        require(latestConfirmed < latestNodeCreated, "No nodes to confirm");
        require(blockHash != bytes32(0), "Block hash cannot be zero");
        require(sendRoot != bytes32(0), "Send root cannot be zero");
        require(latestConfirmed < latestNodeCreated, "No nodes to confirm");
        latestConfirmed++;
        emit NodeConfirmed(latestConfirmed, blockHash, sendRoot);
    }
}