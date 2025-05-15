import { readFileSync, writeFileSync } from "node:fs";
import { deployContract, getWallet } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "node:path";

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();
  const memedStaking = await deployContract("MemedStaking", [], {
    hre,
    wallet,
    verify: true,
  });
  const memedBattle = await deployContract("MemedBattle", [], {
    hre,
    wallet,
    verify: true,
  });
  const memedEngageToEarn = await deployContract("MemedEngageToEarn", [], {
    hre,
    wallet,
    verify: true,
  });
  const memedStakingAddress = await memedStaking.getAddress();
  const memedBattleAddress = await memedBattle.getAddress();
  const memedEngageToEarnAddress = await memedEngageToEarn.getAddress();
  const factory = await deployContract("MemedFactory", [memedStakingAddress, memedBattleAddress, memedEngageToEarnAddress], {
    hre,
    wallet,
    verify: true,
  });
  const config = {
    factory: await factory.getAddress(),
    memedStaking: memedStakingAddress,
    memedBattle: memedBattleAddress,
    memedEngageToEarn: memedEngageToEarnAddress,
  };


  writeFileSync(path.resolve("../backend/src/config/config.json"), JSON.stringify(config, null, 2));

  // Set factory address in the previously deployed contracts
  console.log("Setting factory address in MemedStaking...");
  await memedStaking.setFactory(config.factory);
  
  console.log("Setting factory address in MemedBattle...");
  await memedBattle.setFactory(config.factory);
  
  console.log("Setting factory address in MemedEngageToEarn...");
  await memedEngageToEarn.setFactory(config.factory);
  
  console.log("Deployment completed successfully!");
}
