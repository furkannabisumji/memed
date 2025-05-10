import { deployContract, getWallet } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();

  await deployContract("MemedAirdrop", [], {
    hre,
    wallet,
    verify: true,
  });

  await deployContract("MemedFactory", [], {
    hre,
    wallet,
    verify: true,
  });
}
