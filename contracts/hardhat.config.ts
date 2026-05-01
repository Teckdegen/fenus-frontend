import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  paths: {
    sources: "./src",
    tests:   "./test",
    cache:   "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    // LitVM LiteForge testnet
    liteforge: {
      url:      "https://liteforge.rpc.caldera.xyz/http",
      chainId:  4441,
      accounts: [PRIVATE_KEY],
    },
    // Local hardhat node for testing
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

export default config;
