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
    mapping(address => mapping(uint256 => bool)) public index;
    mapping(address => uint256) availableIndex;
    mapping(address => uint256) public unlokedAmount;
    mapping(bytes32 => bool) public claimed;

    event Claimed(address indexed user, uint256 amount, uint256 index);
    event SetMerkleRoot(address indexed token, uint256 index, bytes32 root);
    event Reward(address indexed token, uint256 userAmount, uint256 creatorAmount, uint256 index);
    
    function claim(
        address _token,
        uint256 _amount,
        uint256 _index,
        bytes32[] calldata _proof
    ) external {
        bytes32 leaf = keccak256(abi.encodePacked(_token, msg.sender, _amount, _index));
        require(MerkleProof.verify(_proof, engagements[_token][_index], leaf), "Invalid proof");
        require(!claimed[leaf], "Already claimed");
        require(unlokedAmount[_token] >= _amount, "Not enough tokens");

        claimed[leaf] = true;
        unlokedAmount[_token] -= _amount;
        IERC20(_token).transfer(msg.sender, _amount);
        emit Claimed(msg.sender, _amount, _index);
    }

 function setMerkleRoot(address token, bytes32 root, uint256 _index) external onlyOwner {
    require(index[token][_index] == true, "Invalid index");
    engagements[token][_index] = root;
    index[token][_index] = false;
    emit SetMerkleRoot(token, _index, root);
}

function reward(address token, address _creator) external {
    require(msg.sender == factory, "unauthorized");
    require(IERC20(token).balanceOf(address(this)) >= (MAX_ENGAGE_USER_REWARD + MAX_ENGAGE_CREATOR_REWARD), "Not enough tokens");
    IERC20(token).transfer(_creator, MAX_ENGAGE_CREATOR_REWARD);
    unlokedAmount[token] += MAX_ENGAGE_USER_REWARD;
    availableIndex[token]++;
    index[token][availableIndex[token]] = true;
    emit Reward(token, MAX_ENGAGE_USER_REWARD, MAX_ENGAGE_CREATOR_REWARD, availableIndex[token]);
}   

function isRewardable(address token) external view returns (bool) {
    return IERC20(token).balanceOf(address(this)) >= (MAX_ENGAGE_USER_REWARD + MAX_ENGAGE_CREATOR_REWARD);
}

function setFactory(address _factory) external onlyOwner {
    require(address(factory) == address(0), "Already set");
    factory = _factory;
}
}