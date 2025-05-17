// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemedFactory.sol";
/// @title MemedBattle Contract
contract MemedBattle is Ownable {
    address public factory;
    struct Battle {
        uint256 battleId;
        address memeA;
        address memeB;
        uint256 startTime;
        uint256 endTime;
        bool resolved;
        address winner;
    }

    uint256 public battleDuration = 1 days;
    uint256 public battleCount;
    mapping(uint256 => Battle) public battles;

    event BattleStarted(uint256 battleId, address memeA, address memeB);
    event BattleResolved(uint256 battleId, address winner);

    function startBattle(address _memeB) external returns (uint256) {
        address[2] memory addresses = MemedFactory(factory).getByAddress(address(0),msg.sender);
        address memeA = addresses[0];
        address creatorA = addresses[1];
        require(memeA != address(0), "MemeA is not minted");
        require(creatorA == msg.sender, "You are not the creator");
        address[2] memory addressesB = MemedFactory(factory).getByAddress(_memeB, address(0));
        address memeB = addressesB[0];
        require(memeB != address(0), "MemeB is not minted");
        require(memeB != memeA, "Cannot battle yourself");
        Battle storage b = battles[battleCount];
        b.battleId = battleCount;
        b.memeA = memeA;
        b.memeB = memeB;
        b.startTime = block.timestamp;
        b.endTime = block.timestamp + battleDuration;
        b.resolved = false;

        emit BattleStarted(battleCount, msg.sender, _memeB);
        return battleCount++;
    }

    function resolveBattle(uint256 _battleId, address _winner) external {
        Battle storage b = battles[_battleId];
        require(b.memeA != address(0) && b.memeB != address(0), "Invalid battle");
        require(block.timestamp >= b.endTime, "Battle not ended");
        require(!b.resolved, "Already resolved");
        require(msg.sender == factory, "Unauthorized");
        b.winner = _winner;
        b.resolved = true;
        MemedFactory.HeatUpdate[] memory heatUpdate = new MemedFactory.HeatUpdate[](1);
        heatUpdate[0] = MemedFactory.HeatUpdate({
            token: _winner,
            heat: 20000,
            minusHeat: false
        });
        MemedFactory(factory).updateHeat(heatUpdate);

        emit BattleResolved(_battleId, _winner);
    }
    
    function setFactory(address _factory) external onlyOwner {
        require(address(factory) == address(0), "Already set");
        factory = _factory;
    }
    
    function getBattles() external view returns (Battle[] memory) {
        Battle[] memory battlesArray = new Battle[](battleCount);
        for (uint256 i = 0; i < battleCount; i++) {
            battlesArray[i] = battles[i];
        }
        return battlesArray;
    }

    function getUserBattles(address _token) external view returns (Battle[] memory) {
        Battle[] memory battlesArray = new Battle[](battleCount);
        uint256 count = 0;
        for (uint256 i = 0; i < battleCount; i++) {
            if(battles[i].memeA == _token || battles[i].memeB == _token) {
                battlesArray[count] = battles[i];
                count++;
            }
        }
        return battlesArray;
    }
}