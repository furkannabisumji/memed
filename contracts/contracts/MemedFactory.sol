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

    struct HeatUpdate {
        address token;
        uint heat;
        bool minusHeat;
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

    constructor(address _memedStaking, address _memedBattle, address _memedEngageToEarn) {
        memedStaking = MemedStaking(_memedStaking);
        memedBattle = MemedBattle(_memedBattle);
        memedEngageToEarn = MemedEngageToEarn(_memedEngageToEarn);
    }

    function createMeme(
        address _creator,
        string calldata _lensUsername,
        string calldata _name,
        string calldata _ticker,
        string calldata _description,
        string calldata _image
    ) external onlyOwner {
        require(tokenData[_lensUsername].token == address(0), "already minted");
        MemedToken memedToken = new MemedToken(_name, _ticker, _creator, address(memedStaking), address(memedEngageToEarn));
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
        memedEngageToEarn.reward(address(memedToken), _creator);
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

    function updateHeat(HeatUpdate[] calldata _heatUpdates) public {
        require(msg.sender == address(memedStaking) || msg.sender == address(memedBattle) || msg.sender == owner(), "unauthorized");
        for(uint i = 0; i < _heatUpdates.length; i++) {
            address token = _heatUpdates[i].token;
            uint heat = _heatUpdates[i].heat;
            bool minusHeat = _heatUpdates[i].minusHeat;
        string memory lensUsername = getByToken(token);
        address creator = tokenData[lensUsername].creator;
        require(tokenData[lensUsername].token != address(0), "not minted");
        require(!minusHeat || (msg.sender == address(memedStaking)), "Only staking can minus heat");
        if(minusHeat) {
            tokenData[lensUsername].heat -= heat;
        } else {
            tokenData[lensUsername].heat += heat;
        }
        MemedBattle.Battle[] memory battles = memedBattle.getUserBattles(token);
        for(uint j = 0; j < battles.length; j++) {
            if(battles[j].memeA == address(0) || battles[j].memeB == address(0)) {
                continue;
            }
            address opponent = battles[j].memeA == token ? battles[j].memeB : battles[j].memeA;
            if(block.timestamp > battles[j].endTime && !battles[j].resolved) {
                address winner = tokenData[getByToken(opponent)].heat > tokenData[lensUsername].heat ? opponent : token;
                memedBattle.resolveBattle(battles[j].battleId, winner);
                if(memedStaking.isRewardable(token)) {
                    memedStaking.reward(token, creator);
                }
            }
        }
        if ((tokenData[lensUsername].heat - tokenData[lensUsername].lastRewardAt) >= REWARD_PER_ENGAGEMENT &&memedEngageToEarn.isRewardable(token)) {
            memedEngageToEarn.reward(token, creator);
            tokenData[lensUsername].lastRewardAt = tokenData[lensUsername].heat;
            if(memedStaking.isRewardable(token)) {
                memedStaking.reward(token, creator);
            }
        }
        }
    }

    function getByToken(address _token) internal view returns (string memory) {
        string memory lensUsername;
        for (uint i = 0; i < tokens.length; i++) {
            if (tokenData[tokens[i]].token == _token) {
                lensUsername = tokens[i];
                break;
            }
        }
        return lensUsername;
    }

    function getByAddress(address _token, address _creator) public view returns (address[2] memory) {
        address token;
        address creator;
        if(_token == address(0)) {
            for (uint i = 0; i < tokens.length; i++) {
                if (tokenData[tokens[i]].creator == _creator) {
                    token = tokenData[tokens[i]].token;
                    creator = _creator;
                }
            }
        } else {
            for (uint i = 0; i < tokens.length; i++) {
                if (tokenData[tokens[i]].token == _token) {
                    token = _token;
                    creator = tokenData[tokens[i]].creator;
                }
            }
        }
        return [token, creator];
    }

    function getTokens(address _token) external view returns (TokenData[] memory) {
        uint length = address(0) == _token ? tokens.length : 1;
        TokenData[] memory result = new TokenData[](length);
        if(address(0) == _token) {
            for (uint i = 0; i < length; i++) {
                result[i] = tokenData[tokens[i]];
            }
        } else {
            result[0] = tokenData[getByToken(_token)];
        }
        return result;
    }
}
