import { Contract } from "ethers"
import { ethers } from "hardhat"
import { UserOperationVariant } from "./interfaces/component"

export async function createAccount(entryPointAddress: string) {
  // Get EntryPoint contract.
  const entryPoint: Contract = await ethers.getContractAt("EntryPoint", entryPointAddress)

  // Create account.
  const userOpCreateAccount: UserOperationVariant = {
    sender: "0x0000000000000000000000000000000000000000",
    callData: "0x",
    commitment: "0x",
    proof: "0x",
    callGasLimit: 30_000_000,
  }

  const user = (await ethers.getSigners())[0]

  await entryPoint.connect(user).handleOps([userOpCreateAccount])
}

export async function swap(entryPointAddress: string, userAccount: string) {
  // Get EntryPoint contract.
  const entryPoint: Contract = await ethers.getContractAt("EntryPoint", entryPointAddress)

  // Call swap function.
  const ABI = [
    {
      inputs: [
        {
          internalType: "address",
          name: "router",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountOutMin",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "tokenIn",
          type: "address",
        },
        {
          internalType: "address",
          name: "tokenOut",
          type: "address",
        },
        {
          internalType: "uint24",
          name: "poolFee",
          type: "uint24",
        },
      ],
      name: "exactInputSingle",
      outputs: [
        {
          internalType: "uint256",
          name: "amountOut",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
  ]
  const _interface = new ethers.utils.Interface(ABI)
  const callData = _interface.encodeFunctionData("exactInputSingle", [
    "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    ethers.utils.parseEther("0.01"),
    0,
    "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", // wMATIC
    "0xF14f9596430931E177469715c591513308244e8F", // DAI
    3000,
  ])

  const userOpCallSwapFunc: UserOperationVariant = {
    sender: userAccount,
    callData: callData,
    commitment: "0x",
    proof: "0x",
    callGasLimit: 30_000_000,
  }

  const user = (await ethers.getSigners())[0]

  await entryPoint.connect(user).handleOps([userOpCallSwapFunc])
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length > 4) {
    console.log("Deploy: Wrong arguments. The possible arguments are below.")
    console.log("Deploy: ts-node ./scripts/transaction.ts polygonMumbai createAccount entryPoint_address")
    console.log("Deploy: ts-node ./scripts/transaction.ts polygonMumbai swap entryPoint_address account_address")
    throw new Error("Wrong arguments")
  }

  const network = args[0]
  const type = args[1]
  const entryPointAddress = args[2]
  const accountAddress = args[3]

  const hre = require("hardhat")

  await hre.changeNetwork(network)

  if (type === "createAccount") {
    await createAccount(entryPointAddress)
  } else if (type === "swap") {
    await swap(entryPointAddress, accountAddress)
  } else {
    console.log("Deploy: Wrong arguments. The second argument must be createAccount or swap.")
    throw new Error("Wrong arguments")
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
