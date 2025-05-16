// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemedToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18;
    constructor(
        string memory _name,
        string memory _ticker,
        address _creator,
        address staking,
        address engageToEarn
    ) ERC20(_name, _ticker) Ownable() {
        _mint(staking, (MAX_SUPPLY * 58) / 100);
        _mint(engageToEarn, (MAX_SUPPLY * 40) / 100);
        _mint(_creator, 12_000_000 * 1e18);
    }
}
