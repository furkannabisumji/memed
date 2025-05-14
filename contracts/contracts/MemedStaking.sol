// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemedFactory.sol";

contract MemedStaking is Ownable {   
    uint256 public constant MAX_REWARD = 580_000_000 * 1e18;

    MemedFactory public factory;
    uint256 public constant HEAT_PER_TOKEN = 1e16;

    struct Stake {
        uint256 amount;
        uint256 reward;
    }
    address[] public stakers;
    mapping(address => mapping(address => Stake)) public stakes; // meme => user => Stake
    mapping(address => uint256) public totalStakedPerMeme;

    event Staked(address indexed user, address meme, uint256 amount);
    event Unstaked(address indexed user, address meme, uint256 amount);
    event RewardClaimed(address indexed user, address meme, uint256 amount);
    event Reward(address indexed meme, uint256 amount);

    function stake(address meme, uint256 amount) external {
        require(amount > 0, "Stake more than zero");
        IERC20(meme).transferFrom(msg.sender, address(this), amount);
        if(stakes[meme][msg.sender].amount == 0) {
            stakers.push(msg.sender);
        }
        stakes[meme][msg.sender].amount += amount;
        totalStakedPerMeme[meme] += amount;
        factory.updateHeat(meme, amount * HEAT_PER_TOKEN, false);
        emit Staked(msg.sender, meme, amount);
    }

    function unstake(address meme) external {
        uint256 amount = stakes[meme][msg.sender].amount;
        require(amount > 0, "Nothing to unstake");
        stakes[meme][msg.sender].amount = 0;
        totalStakedPerMeme[meme] -= amount;
        if(stakes[meme][msg.sender].amount == 0) {
            for(uint i = 0; i < stakers.length; i++) {
                if(stakers[i] == msg.sender) {
                    stakers[i] = stakers[stakers.length - 1];
                    stakers.pop();
                    break;
                }
            }
        }
        factory.updateHeat(meme, amount * HEAT_PER_TOKEN, true);
        IERC20(meme).transfer(msg.sender, amount);
        emit Unstaked(msg.sender, meme, amount);
    }

    function claimReward(address meme) external {
        uint256 amount = stakes[meme][msg.sender].reward;
        require(amount > 0, "Nothing to claim");
        stakes[meme][msg.sender].reward = 0;
        IERC20(meme).transfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, meme, amount);
    }

    function reward(address meme, address _creator) external {
        require(IERC20(meme).balanceOf(msg.sender) >= MAX_REWARD, "Not enough tokens");
        require(msg.sender == address(factory), "unauthorized");
        for(uint i = 0; i < stakers.length; i++) {
            address user = stakers[i];
            uint totalReward = MAX_REWARD * 2 / 100;
            uint256 userStakedAmount = stakes[meme][user].amount;
            uint256 userAmount = userStakedAmount * totalReward / totalStakedPerMeme[meme];
            stakes[meme][user].reward += userAmount;
        }
        IERC20(meme).transfer(_creator, MAX_REWARD * 1 / 100);
        emit Reward(meme, MAX_REWARD * 4 / 100);
    }

    function setFactory(address _factory) external onlyOwner {
        require(address(factory) == address(0), "Already set");
        factory = MemedFactory(_factory);
    }

    function isRewardable(address meme) external view returns (bool) {
        return IERC20(meme).balanceOf(address(this)) >= (MAX_REWARD * 4 / 100);
    }
}
