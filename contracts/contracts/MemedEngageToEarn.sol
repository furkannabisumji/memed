// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemedEngageToEarn is Ownable {
    struct Engagement {
        bytes32 merkleRoot;
        uint256 timestamp;
    }
    uint256 public constant MAX_REWARD = 400_000_000 * 1e18;
    uint256 public constant MAX_ENGAGE_USER_REWARD_PERCENTAGE = 2;
    uint256 public constant MAX_ENGAGE_CREATOR_REWARD_PERCENTAGE = 1;   
    address public factory;

    mapping(address => mapping(uint256 => Engagement)) public engagements;
    mapping(address => uint256) public unlokedAmount;
    mapping(bytes32 => bool) public claimed;

    event Claimed(address indexed user, uint256 amount, uint256 index);
    event SetMerkleRoot(address indexed token, uint256 index, bytes32 root);
    event Reward(address indexed token, uint256 userAmount, uint256 creatorAmount);
    function claim(
        address token,
        uint256 amount,
        uint256 index,
        bytes32[] calldata proof
    ) external {
        bytes32 leaf = keccak256(abi.encodePacked(token, msg.sender, amount, index));
        require(MerkleProof.verify(proof, engagements[token][index].merkleRoot, leaf), "Invalid proof");
        require(!claimed[leaf], "Already claimed");
        require(unlokedAmount[token] >= amount, "Not enough tokens");

        claimed[leaf] = true;
        unlokedAmount[token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Claimed(msg.sender, amount, index);
    }

 function setMerkleRoot(address token, uint256 index, bytes32 root) external onlyOwner {
    require(engagements[token][index].merkleRoot == bytes32(0), "Already set");

    if (index > 0) {
        require(engagements[token][index - 1].merkleRoot != bytes32(0), "Previous index not set");
        require(engagements[token][index - 1].timestamp + 24 hours < block.timestamp, "Too soon to set");
    }

    engagements[token][index].merkleRoot = root;
    engagements[token][index].timestamp = block.timestamp;
    emit SetMerkleRoot(token, index, root);
}

function reward(address token, address _creator) external {
    require(IERC20(token).balanceOf(msg.sender) >= unlokedAmount[token], "Not enough tokens");
    require(msg.sender == factory, "unauthorized");
    uint256 userAmount = MAX_REWARD * MAX_ENGAGE_USER_REWARD_PERCENTAGE / 100;
    uint256 creatorAmount = MAX_REWARD * MAX_ENGAGE_CREATOR_REWARD_PERCENTAGE / 100;
    IERC20(token).transfer(_creator, creatorAmount);
    unlokedAmount[token] += userAmount;
    emit Reward(token, userAmount, creatorAmount);
}   

function isRewardable(address token) external view returns (bool) {
    return IERC20(token).balanceOf(address(this)) >= (MAX_REWARD * 3 / 100);
}

function setFactory(address _factory) external onlyOwner {
    require(address(factory) == address(0), "Already set");
    factory = _factory;
}
}