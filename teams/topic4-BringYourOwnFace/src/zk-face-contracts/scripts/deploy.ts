import { execSync } from "child_process"
import { Contract } from "ethers"
import { ethers } from "hardhat"

export async function deployMockAccountFactory(wETH: string): Promise<Contract> {
  const MockAccountFactory = await ethers.getContractFactory("MockAccountFactory")
  const mockAccountFactory = await MockAccountFactory.deploy(wETH)

  return await mockAccountFactory.deployed()
}

export async function deployAccountFactory(wETH: string): Promise<Contract> {
  const AccountFactory = await ethers.getContractFactory("AccountFactory")
  const accountFactory = await AccountFactory.deploy(wETH)

  return await accountFactory.deployed()
}

export async function deployEntryPoint(accountFactory: string): Promise<Contract> {
  const EntryPoint = await ethers.getContractFactory("EntryPoint")
  const entryPoint = await EntryPoint.deploy(accountFactory)

  return await entryPoint.deployed()
}

async function main() {
  execSync("npx hardhat clean && yarn compile", { stdio: "inherit" })

  const args = process.argv.slice(2)

  if (args.length != 3) {
    console.log("Deploy: Wrong arguments. The possible arguments are below.")
    console.log("Deploy: ts-node ./scripts/deploy.ts moonbase accountFactory wETH_address")
    console.log("Deploy: ts-node ./scripts/deploy.ts moonbase entryPoint accountFactory_address")
    throw new Error("Wrong arguments")
  }

  const network = args[0]
  const type = args[1]
  const address = args[2]

  const hre = require("hardhat")

  await hre.changeNetwork(network)

  console.log(`Deploy: start deploying ${type} on ${network}`)

  let contract: Contract

  if (type === "accountFactory") {
    contract = await deployAccountFactory(address)
  } else if (type === "entryPoint") {
    contract = await deployEntryPoint(address)
  } else {
    console.log("Deploy: Wrong arguments. The second argument must be accountFactory or entryPoint.")
    throw new Error("Wrong arguments")
  }

  console.log(`Deploy: ${type} is deployed at ${contract.address}`)

  console.log(`Deploy: wait 1 min to let this fact be propagated`)

  await new Promise((timeout) => setTimeout(timeout, 60000))

  console.log(`Deploy: start verifying it`)

  await hre.run("verify:verify", {
    address: contract.address,
    constructorArguments: [address],
  })
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
