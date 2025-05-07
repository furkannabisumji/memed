import { deployContract, getWallet } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();

  /*await deployContract("MemedAirdrop", ["0xdcb603bc2745b1ff3a7e8c437d7bb1ddce77a170874b3e233103d2750a937f00"], {
    hre,
    wallet,
    verify: true,
  });*/

  await deployContract("MemedFactory", [], {
    hre,
    wallet,
    verify: true,
  });
}
