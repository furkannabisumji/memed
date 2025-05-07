// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MemedAirdrop {
    bytes32 public merkleRoot;
    mapping(bytes32 => bool) public claimed;

    constructor(bytes32 _root) {
        merkleRoot = _root;
    }

    function claim(
        address token,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        bytes32 leaf = keccak256(abi.encodePacked(token, msg.sender, amount));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");
        require(!claimed[leaf], "Already claimed");

        claimed[leaf] = true;
        IERC20(token).transfer(msg.sender, amount);
    }
}
