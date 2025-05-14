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
        MemedFactory.TokenData[] memory tokenDataA = MemedFactory(factory).getTokens(msg.sender);
        address creatorA = tokenDataA[0].creator;
        require(creatorA == msg.sender, "You are not the creator");
        MemedFactory.TokenData[] memory tokenDataB = MemedFactory(factory).getTokens(_memeB);
        address creatorB = tokenDataB[0].creator;
        require(creatorB == _memeB, "MemeB is not the creator");
        require(_memeB != msg.sender, "Cannot battle yourself");
        Battle storage b = battles[battleCount];
        b.battleId = battleCount;
        b.memeA = msg.sender;
        b.memeB = _memeB;
        b.startTime = block.timestamp;
        b.endTime = block.timestamp + battleDuration;
        b.resolved = false;

        emit BattleStarted(battleCount, msg.sender, _memeB);
        return battleCount++;
    }

    function resolveBattle(uint256 _battleId, address _winner) external {
        Battle storage b = battles[_battleId];
        require(block.timestamp >= b.endTime, "Battle not ended");
        require(!b.resolved, "Already resolved");
        require(msg.sender == factory, "Unauthorized");
        b.winner = _winner;
        b.resolved = true;
        MemedFactory(factory).updateHeat(_winner, 20000, false);

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

    function getUserBattles(address _user) external view returns (Battle[] memory) {
        Battle[] memory battlesArray = new Battle[](battleCount);
        uint256 count = 0;
        for (uint256 i = 0; i < battleCount; i++) {
            if(battles[i].memeA == _user || battles[i].memeB == _user) {
                battlesArray[count] = battles[i];
                count++;
            }
        }
        return battlesArray;
    }
}