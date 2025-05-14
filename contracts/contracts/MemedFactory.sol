// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemedToken.sol";
import "./MemedStaking.sol";
import "./MemedBattle.sol";
import "./MemedEngageToEarn.sol";

contract MemedFactory is Ownable {
    uint256 constant public REWARD_PER_ENGAGEMENT = 100000;
    uint256 constant public MAX_ENGAGE_USER_REWARD_PERCENTAGE = 2;
    uint256 constant public MAX_ENGAGE_CREATOR_REWARD_PERCENTAGE = 1;
    MemedStaking public memedStaking;
    MemedBattle public memedBattle;
    MemedEngageToEarn public memedEngageToEarn;
    struct TokenData {
        address token;
        address creator;
        string name;
        string ticker;
        string description;
        string image;
        string lensUsername;
        uint256 heat;
        uint256 lastRewardAt;
        uint createdAt;
    }

    mapping(string => TokenData) public tokenData;
    string[] public tokens;

    // Events
    event TokenCreated(
        address indexed token,
        address indexed owner,
        string name,
        string ticker,
        string description,
        string image,
        string lensUsername,
        uint createdAt
    );

    event Followed(
        address indexed follower,
        address indexed following,
        uint timestamp
    );
    event Unfollowed(
        address indexed follower,
        address indexed following,
        uint timestamp
    );

    constructor(address _memedStaking, address _memedBattle) {
        memedStaking = MemedStaking(_memedStaking);
        memedBattle = MemedBattle(_memedBattle);
    }

    function createMeme(
        address _creator,
        string calldata _lensUsername,
        string calldata _name,
        string calldata _ticker,
        string calldata _description,
        string calldata _image
    ) external onlyOwner {
        //require(tokenData[_lensUsername].token == address(0), "already minted");
        MemedToken memedToken = new MemedToken(_name, _ticker, address(this), _creator, address(memedStaking), address(memedEngageToEarn));
        tokenData[_lensUsername] = TokenData({
            token: address(memedToken),
            creator: _creator,
            name: _name,
            ticker: _ticker,
            description: _description,
            image: _image,
            lensUsername: _lensUsername,
            heat: 0,
            lastRewardAt: 0,
            createdAt: block.timestamp
        });
        tokens.push(_lensUsername);
        emit TokenCreated(
            address(memedToken),
            _creator,
            _name,
            _ticker,
            _description,
            _image,
            _lensUsername,
            block.timestamp
        );
    }

    function updateHeat(address _user, uint256 _heat, bool _minusHeat) public {
        require(msg.sender == address(memedStaking) || msg.sender == address(memedBattle) || msg.sender == owner(), "unauthorized");
        string memory lensUsername = getByAddress(_user);
        require(tokenData[lensUsername].token != address(0), "not minted");
        require(!_minusHeat || (msg.sender == address(memedStaking)), "Only staking can minus heat");
        if(_minusHeat) {
            tokenData[lensUsername].heat -= _heat;
        } else {
            tokenData[lensUsername].heat += _heat;
        }
        MemedBattle.Battle[] memory battles = memedBattle.getUserBattles(_user);
        for(uint i = 0; i < battles.length; i++) {
            address opponent = battles[i].memeA == _user ? battles[i].memeB : battles[i].memeA;
            if(block.timestamp > battles[i].endTime && !battles[i].resolved) {
                address winner = tokenData[getByAddress(opponent)].heat > tokenData[lensUsername].heat ? opponent : _user;
                memedBattle.resolveBattle(battles[i].battleId, winner);
                if(memedStaking.isRewardable(tokenData[lensUsername].token)) {
                    memedStaking.reward(tokenData[lensUsername].token, tokenData[lensUsername].creator);
                }
            }
        }
        if(tokenData[lensUsername].heat - tokenData[lensUsername].lastRewardAt > REWARD_PER_ENGAGEMENT && memedEngageToEarn.isRewardable(tokenData[lensUsername].token)) {
            memedEngageToEarn.reward(tokenData[lensUsername].token, _user);
            tokenData[lensUsername].lastRewardAt = tokenData[lensUsername].heat;
            if(memedStaking.isRewardable(tokenData[lensUsername].token)) {
                memedStaking.reward(tokenData[lensUsername].token, tokenData[lensUsername].creator);
            }
        }
    }

    function getByAddress(address _user) internal view returns (string memory) {
        string memory lensUsername;
        for (uint i = 0; i < tokens.length; i++) {
            if (tokenData[tokens[i]].token == _user) {
                lensUsername = tokens[i];
                break;
            }
        }
        return lensUsername;
    }

    function getTokens(address _user) external view returns (TokenData[] memory) {
        uint length = address(0) == _user ? tokens.length : 1;
        TokenData[] memory result = new TokenData[](length);
        if(address(0) == _user) {
            for (uint i = 0; i < length; i++) {
                result[i] = tokenData[tokens[i]];
            }
        } else {
            result[0] = tokenData[getByAddress(_user)];
        }
        return result;
    }

    function getUserBattles(address _user) external view returns (MemedBattle.Battle[] memory) {
        return memedBattle.getUserBattles(_user);
    }
}
