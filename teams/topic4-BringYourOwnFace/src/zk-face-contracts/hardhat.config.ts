import "@nomicfoundation/hardhat-chai-matchers"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "@typechain/hardhat"
import * as dotenv from "dotenv"
import "hardhat-change-network"
import { HardhatUserConfig } from "hardhat/config"

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 30_000_000,
      forking: {
        url: "https://moonbase-alpha.public.blastapi.io",
        enabled: true,
        blockNumber: 4417000,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
    moonbase: {
      url: "https://rpc.api.moonbase.moonbeam.network",
      chainId: 1287,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      moonbase: `${process.env.MOONBASE_RPC_URL}`,
      url: "https://moonbase.moonscan.io/api",
      chain: "1287"
    },
  },
}

export default config
