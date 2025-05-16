// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemedEngageToEarn is Ownable {
    uint256 public constant MAX_REWARD = 400_000_000 * 1e18;
    uint256 public constant MAX_ENGAGE_USER_REWARD = (MAX_REWARD * 2) / 100;
    uint256 public constant MAX_ENGAGE_CREATOR_REWARD = (MAX_REWARD * 1) / 100;
    address public factory;

    mapping(address => mapping(uint256 => bytes32)) public engagements;
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
        require(MerkleProof.verify(proof, engagements[token][index], leaf), "Invalid proof");
        require(!claimed[leaf], "Already claimed");
        require(unlokedAmount[token] >= amount, "Not enough tokens");

        claimed[leaf] = true;
        unlokedAmount[token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Claimed(msg.sender, amount, index);
    }

 function setMerkleRoot(address token, uint256 index, bytes32 root) external onlyOwner {
    require(engagements[token][index] == bytes32(0), "Already set");

    if (index > 0) {
        require(engagements[token][index - 1] != bytes32(0), "Previous index not set");
    }

    engagements[token][index] = root;
    emit SetMerkleRoot(token, index, root);
}

function reward(address token, address _creator) external {
    require(msg.sender == factory, "unauthorized");
    require(IERC20(token).balanceOf(address(this)) >= (MAX_ENGAGE_USER_REWARD + MAX_ENGAGE_CREATOR_REWARD), "Not enough tokens");
    IERC20(token).transfer(_creator, MAX_ENGAGE_CREATOR_REWARD);
    unlokedAmount[token] += MAX_ENGAGE_USER_REWARD;
    emit Reward(token, MAX_ENGAGE_USER_REWARD, MAX_ENGAGE_CREATOR_REWARD);
}   

function isRewardable(address token) external view returns (bool) {
    return IERC20(token).balanceOf(address(this)) >= (MAX_ENGAGE_USER_REWARD + MAX_ENGAGE_CREATOR_REWARD);
}

function setFactory(address _factory) external onlyOwner {
    require(address(factory) == address(0), "Already set");
    factory = _factory;
}
}