// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemedToken.sol";

contract MemedFactory is Ownable {
    MemedToken public memedToken;
    struct TokenData {
        address token;
        address creator;
        string name;
        string ticker;
        string description;
        string image;
        string lensUsername;
        address[] followers;
        uint createdAt;
    }

    mapping(string => TokenData) public tokenData;
    mapping(address => address[]) followings;
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

    function createMeme(
        address _creator,
        string calldata _lensUsername,
        string calldata _name,
        string calldata _ticker,
        string calldata _description,
        string calldata _image
    ) external onlyOwner {
        require(tokenData[_lensUsername].token == address(0), "already minted");
        memedToken = new MemedToken(_name, _ticker, address(this), _creator);
        tokenData[_lensUsername] = TokenData({
            token: address(memedToken),
            creator: _creator,
            name: _name,
            ticker: _ticker,
            description: _description,
            image: _image,
            lensUsername: _lensUsername,
            followers: new address[](0),
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

    function follow(address _user) public {
        string memory lensUsername = getByAddress(_user);
        require(msg.sender == tokenData[lensUsername].token, "unauthorized");
        require(tokenData[lensUsername].token != address(0), "not minted");
        bool isFollowed = false;
        for (uint i = 0; i < tokenData[lensUsername].followers.length; i++) {
            if (tokenData[lensUsername].followers[i] == _user) {
                isFollowed = true;
                break;
            }
        }
        if (!isFollowed) {
            tokenData[lensUsername].followers.push(_user);
            followings[_user].push(msg.sender);
            emit Followed(msg.sender, _user, block.timestamp);
        }
    }

    function unfollow(address _user) public {
        string memory lensUsername = getByAddress(_user);
        require(tokenData[lensUsername].token != address(0), "not minted");
        require(msg.sender == tokenData[lensUsername].token, "unauthorized");
        for (uint i = 0; i < tokenData[lensUsername].followers.length; i++) {
                if(tokenData[lensUsername].followers[i] == _user) {
                    delete tokenData[lensUsername].followers[i];
                    for (uint j = 0; j < followings[_user].length; j++) {
                        if (followings[_user][j] == msg.sender) {
                            delete followings[_user][j];
                            break;
                        }
                    }
                    emit Unfollowed(msg.sender, _user, block.timestamp);
                    break;
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

    function getFollowings(address _user) external view returns (address[] memory) {
        return followings[_user];
    }
}
