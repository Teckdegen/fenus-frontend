import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
      viaIR: true,
    },
  },
  paths: {
    sources:   "./src",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    // LitVM LiteForge testnet
    liteforge: {
      url:      "https://liteforge.rpc.caldera.xyz/http",
      chainId:  4441,
      // Only include accounts if PRIVATE_KEY is set — allows compile without a key
      ...(PRIVATE_KEY ? { accounts: [PRIVATE_KEY] } : {}),
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

export default config;
