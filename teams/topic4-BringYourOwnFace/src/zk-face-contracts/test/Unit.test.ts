import { setBalance, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers"
import { ethers } from "hardhat"
import { deployEntryPoint, deployMockAccountFactory } from "../scripts/deploy"
import { UserOperationVariant } from "../scripts/interfaces/component"

describe("Unit test", function () {
  before(async function () {
    //  on Moonbase
    this.wETH = "0xD909178CC99d318e4D46e7E66a972955859670E1"

    this.user = (await ethers.getSigners())[0]

    // Airdrop user.
    await setBalance(this.user.address, ethers.utils.parseEther("10000"))

    // Deploy AccountFactory.
    this.mockAccountFactory = await deployMockAccountFactory(this.wETH)

    // Deploy EntryPoint.
    this.entryPoint = await deployEntryPoint(this.mockAccountFactory.address)

    // Take snapshot.
    this.snapshot = await takeSnapshot()
  })

  beforeEach(async function () {
    // Restore snapshot.
    await this.snapshot.restore()
  })

  describe("Swap", async function () {
    it("should succeed when create account and call swap function", async function () {
      // Create account.
      const userOpCreateAccount: UserOperationVariant = {
        sender: "0x0000000000000000000000000000000000000000",
        callData: "0x",
        commitment: "0x",
        proof: "0x",
        callGasLimit: 30_000_000,
      }

      await this.entryPoint.connect(this.user).handleOps([userOpCreateAccount])

      // Airdrop the new account.
      const userAccount = await this.mockAccountFactory.connect(this.user).getLastAccount()
      await setBalance(userAccount, ethers.utils.parseEther("10000"))

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
        // "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", // wMATIC
        // "0xF14f9596430931E177469715c591513308244e8F", // DAI
        3000,
      ])

      const userOpCallSwapFunc: UserOperationVariant = {
        sender: userAccount,
        callData: callData,
        commitment: "0x",
        proof: "0x",
        callGasLimit: 30_000_000,
      }

      await this.entryPoint.connect(this.user).handleOps([userOpCallSwapFunc])
    })
  })
})
