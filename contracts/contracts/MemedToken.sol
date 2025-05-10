// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemedFactory.sol";

contract MemedToken is ERC20, Ownable {
    MemedFactory factory;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18;
    address constant airdrop = 0x96e158BccaaeD8E6e9C5C93bc46815C0f8B9b176;

    constructor(
        string memory _name,
        string memory _ticker,
        address _factory,
        address _creator
    ) ERC20(_name, _ticker) Ownable() {
        factory = MemedFactory(_factory);
        _mint(airdrop, (MAX_SUPPLY * 98) / 100);
        _mint(_creator, (MAX_SUPPLY * 2) / 100);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._transfer(from, to, amount);
        if (from != airdrop && balanceOf(from) >= 100 * 10 ** decimals()) {
            factory.follow(from);
        } else {
            factory.unfollow(from);
        }
        if (to != airdrop && balanceOf(to) >= 100 * 10 ** decimals()) {
            factory.follow(to);
        } else {
            factory.unfollow(to);
        }
    }
}
