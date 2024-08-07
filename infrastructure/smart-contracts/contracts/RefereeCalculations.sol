// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract RefereeCalculations is Initializable, AccessControlUpgradeable {
    using Math for uint256;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[500] private __gap;

    function initialize() public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Calculate the emission and tier for a challenge.
     * @dev This function uses a halving formula to determine the emission tier and challenge emission.
     * The formula is as follows:
     * 1. Start with the max supply divided by 2 as the initial emission tier.
     * 2. The challenge emission is the emission tier divided by 17520.
     * 3. While the total supply is less than the emission tier, halve the emission tier and challenge emission.
     * 4. The function returns the challenge emission and the emission tier.
     *
     * @param totalSupply The current total supply of tokens.
     * @param maxSupply The maximum supply of tokens.
     * @return uint256 The challenge emission.
     * @return uint256 The emission tier.
     */
    function calculateChallengeEmissionAndTier(
        uint256 totalSupply,
        uint256 maxSupply
    ) public pure returns (uint256, uint256) {
        require(maxSupply > totalSupply, "5");

        uint256 tier = Math.log2(maxSupply / (maxSupply - totalSupply)); // calculate which tier we are in starting from 0
        require(tier <= 23, "6");

        uint256 emissionTier = maxSupply / (2 ** (tier + 1)); // equal to the amount of tokens that are emitted during this tier

        // determine what the size of the emission is based on each challenge having an estimated static length
        return (emissionTier / 17520, emissionTier);
    }

    /**
     * @dev Calculates the number of winning keys for a bulk submission.
     * @notice This function determines the winning key count based on the boost factor and the number of staked keys,
     * with a random adjustment.
     * @param _keyCount Amount of keys staked in pool
     * @param _boostFactor The factor controlling the chance of eligibility for payout as a multiplicator
     * @param _bulkAddress The Address to be used for randomize
     * @param _challengeId The ID of the challenge. Is only used for randomize
     * @param _confirmData The confirm data of the assertion.
     * @param _challengerSignedHash The signed hash for the challenge
     * @return winningKeyCount Number of winning keys
     */
    function getWinningKeyCount(
        uint256 _keyCount,
        uint256 _boostFactor,
        address _bulkAddress,
        uint256 _challengeId,
        bytes memory _confirmData,
        bytes memory _challengerSignedHash
    ) public pure returns (uint256 winningKeyCount) {
        // We first check to confirm the bulk submission has some keys and the boost factor is valid.
        require(
            _keyCount > 0,
            "Error: Key Count Must Be Greater Than 0."
        );
        require(
            _boostFactor > 0,
            "Error: Boost factor must be greater than zero."
        );

        // The player's chance of winning is based on their bonus (boost factor) 100 = 1% per key.
        uint256 probability = _boostFactor;

        // We create a unique, random number for this specific submission
        // This ensures that each challenge is unpredictable and fair.
        bytes32 seedHash = keccak256(
            abi.encodePacked(
                _bulkAddress,
                _challengeId,
                _confirmData,
                _challengerSignedHash
            )
        );
        uint256 seed = uint256(seedHash);

        // We use a large number (1,000,000) to help us calculate very small probabilities accurately.
        uint256 scaleFactor = 1000000;

        // We scale the probability by multiplying it with scaleFactor and then dividing by 10,000.
        // This helps in handling small decimal values accurately without losing precision.
        uint256 scaledProbability = (probability * scaleFactor) / 10000;

        // This section handles cases where the chance of winning is very small.
        // We check if the probability multiplied by the number of keys is less than the scaled probability.
        // This means the chance of winning is less than 1% which would result in 0 due to no decimal values in uint256.
        if (probability * _keyCount < scaledProbability) {
            // We calculate the expected number of winning keys, but we scale it up by multiplying with scaledProbability.
            // This scaling helps in better accuracy while dealing with very small probabilities.
            uint256 scaledExpectedWinningKeys = (_keyCount * scaledProbability);

            // We generate a random number between 0 and 999,999.
            // The random number is generated using the keccak256 hash function.
            // We combine the seed with the string "threshold" to create a unique input for the hash function.
            // This ensures that the random number is different each time based on the unique inputs.
            uint256 randomThreshold = uint256(
                keccak256(abi.encodePacked(seed, "threshold"))
            ) % scaleFactor;

            // We compare the random number (randomThreshold) with the scaled expected winning keys (scaledExpectedWinningKeys).
            // If the random number is less than the scaled expected winning keys, it means the player wins one reward.
            // This method allows for fair distribution even with very low probabilities.
            // It ensures that there is a small but fair chance for the player to win a reward.
            return randomThreshold < scaledExpectedWinningKeys ? 1 : 0;
        }

        // For larger probabilities, we use a different method.
        // This part of the code handles scenarios where the chance of winning is pretty much guaranteed.
        // We want to add some variability to the winning key count to make the each challenge more exciting and less predictable.

        // First, we calculate the expected number of rewards (winning keys) based on the (key count) and boost factor (probability).
        uint256 expectedWinningKeys = (_keyCount * probability) / 10000;
        
        /**
         * Explanation:
         * - `expectedWinningKeys` is calculated by multiplying the number of staked keys by the probability, and then dividing by 10,000.
         * - This gives us the baseline number of winning keys that the bulk submission should receive based on the key count and boost factor.
         */

        // We then add some variability.
        // The variability is based on the boost factor, with lower boost factors having higher variability.
        uint256 baseVariability = 30 + (1000 / _boostFactor);
        
        /**
         * Explanation:
         * - `baseVariability` is calculated by adding 30 to the result of 1000 divided by the boost factor.
         * - This means that players with a lower boost factor will have higher variability in their rewards.
         * - This helps to balance the game by giving more variability to players with lower bonuses.
         */

        uint256 maxAdjustmentPercentage = baseVariability > 50
            ? 50
            : baseVariability;
        
        /**
         * Explanation:
         * - `maxAdjustmentPercentage` is set to the lesser of `baseVariability` or 50.
         * - This means that the maximum adjustment to the rewards will be capped at 50%.
         * - Capping the adjustment percentage ensures that the rewards do not fluctuate too wildly, keeping things balanced and fair.
         */

        // We generate two more random numbers to determine how much to adjust the rewards.
        uint256 randomFactor1 = uint256(
            keccak256(abi.encodePacked(seed, "factor1"))
        ) % 1000;
        uint256 randomFactor2 = uint256(
            keccak256(abi.encodePacked(seed, "factor2"))
        ) % 2;
        
        /**
         * Explanation:
         * - We generate two random numbers using the keccak256 hash function with different unique inputs ("factor1" and "factor2").
         * - `randomFactor1` is a random number between 0 and 999, and it helps determine the adjustment percentage.
         * - `randomFactor2` is a random number between 0 and 1, and it helps decide whether to increase or decrease the rewards.
         * - Using these random factors introduces variability and unpredictability to the rewards.
         */

        // We calculate the exact amount to adjust the rewards.
        uint256 adjustmentPercentage = (randomFactor1 * maxAdjustmentPercentage) / 1000;
        uint256 adjustment = (expectedWinningKeys * adjustmentPercentage) / 100;
        
        /**
         * Explanation:
         * - `adjustmentPercentage` is calculated by multiplying `randomFactor1` with `maxAdjustmentPercentage`, and then dividing by 1000.
         * - This gives us a random percentage (up to the maximum adjustment percentage) by which we will adjust the rewards.
         * - `adjustment` is the actual amount by which we will adjust the number of winning keys.
         * - It is calculated by multiplying the expected number of winning keys by the adjustment percentage, and then dividing by 100.
         */

        // Finally, we randomly decide whether to increase or decrease the rewards.
        if (randomFactor2 % 2 == 0) {
            winningKeyCount = expectedWinningKeys + adjustment;
        } else {
            // We ensure that the player never ends up with negative rewards.
            winningKeyCount = expectedWinningKeys > adjustment
                ? expectedWinningKeys - adjustment
                : 0;
        }
        
        /**
         * Explanation:
         * - If `randomFactor2` is 0, we add the `adjustment` to the expected number of winning keys, increasing the rewards.
         * - If `randomFactor2` is 1, we subtract the `adjustment` from the expected number of winning keys, decreasing the rewards.
         * - We make sure that the winning key count does not go below zero by checking if `expectedWinningKeys` is greater than `adjustment`.
         * - This ensures that players do not end up with negative rewards, maintaining fairness in the game.
         */


        return winningKeyCount;
    }
}
