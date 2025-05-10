// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemedAirdrop is Ownable {
    struct Airdrop {
        bytes32 merkleRoot;
        uint256 timestamp;
    }
    mapping(address => mapping(uint256 => Airdrop)) public airdrops;
    mapping(bytes32 => bool) public claimed;

    event Claimed(address indexed user, uint256 amount, uint256 index);
    event SetMerkleRoot(address indexed token, uint256 index, bytes32 root);

    function claim(
        address token,
        uint256 amount,
        uint256 index,
        bytes32[] calldata proof
    ) external {
        bytes32 leaf = keccak256(abi.encodePacked(token, msg.sender, amount, index));
        require(MerkleProof.verify(proof, airdrops[token][index].merkleRoot, leaf), "Invalid proof");
        require(!claimed[leaf], "Already claimed");

        claimed[leaf] = true;
        IERC20(token).transfer(msg.sender, amount);
        emit Claimed(msg.sender, amount, index);
    }

 function setMerkleRoot(address token, uint256 index, bytes32 root) external onlyOwner {
    require(airdrops[token][index].merkleRoot == bytes32(0), "Already set");

    if (index > 0) {
        require(airdrops[token][index - 1].merkleRoot != bytes32(0), "Previous index not set");
        require(airdrops[token][index - 1].timestamp + 24 hours < block.timestamp, "Too soon to set");
    }

    airdrops[token][index].merkleRoot = root;
    airdrops[token][index].timestamp = block.timestamp;
    emit SetMerkleRoot(token, index, root);
}
}
