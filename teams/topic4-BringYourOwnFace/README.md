## Bring Your Own Face
![BYOF_LOGO](https://github.com/team-byof/zk-face-ios/assets/4685781/638f63e1-e0b8-4860-ac1a-170f790865ae)

### YouTube Video

- [Demo + Presentation Video](https://youtu.be/nzg_m_-djDo)
- [Presentation File](https://pitch.com/public/b883e651-5cd6-4165-80b5-be37faf87134)

### Repositories
- [team-byof/zk-face-ios](https://github.com/team-byof/zk-face-ios)
- [team-byof/zk-face-circuit](https://github.com/team-byof/zk-face-circuit)
- [team-byof/zk-face-contracts](https://github.com/team-byof/zk-face-contracts)

### Overview
* **Trustlessly access your funds**: Use your face to generate a proof to verify the ownership of wallet from any device.

* **Account & Network Abstraction** : No need to approve, transfer, and bridge via multiple & cross-chain transactions. It's done by one click.​

* **Undivided** : Keep your money on Polkadot parachains while utilizing EVM chains. Use DeFis on EVM chains with wrapped Parachain tokens!

### Problems
1. **Mobile UX sucks on web3**: what if I want to use a single wallet from any device? Mobile is a huge!​
2. **Recovering an account**: can I trustlessly use my biometric data instead of seed phrase?
3. **Parachain to EVM Chains**: what if I want to use a single wallet for parachains and EVM chains without going through multiple bridges?

### Products
### Architecture
<img style="display: block;-webkit-user-select: none;margin: auto;cursor: zoom-out;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;" src="https://github-production-user-asset-6210df.s3.amazonaws.com/4685781/241370265-df099582-ac91-46b6-9081-20d8ca7c5639.png" width="840">

Here is a technical overview

1. User can generate a proof from any device. computer or mobile. Additonally, you can bridge any parachain tokens using XCM to the  account abstraction on Moonbdam.
2. Using GMP bridging protocol on Moonbeam, you can send a batch transaction to other EVM chain.
3. You can call any arbitrary contract on EVM chain such as doing a swap on uniswap. Alternatively, you can bridge your parachain tokens into the canonical parachain token on an EVM chain. This is

### Proof Generation
<img width="422" alt="239687730-645529e3-bc23-4af7-bb94-44d2aff103c0" src="https://github.com/team-byof/zk-face-ios/assets/4685781/7d945912-e0bd-4fe6-8efb-1b12520c72e6">

Here is how we generate proof.

1. On mobile, we take the features of your face, and vectorize them into parameters.
2. we use these parameters to create a zk proof.
3. You can use this proof to register, verify or recover an account.

### Screenshot
<img width="946" alt="image" src="https://github.com/team-byof/zk-face-ios/assets/4685781/4924c94d-e4f4-4b38-abac-aaed0ff4d571">

#### Roadmap
We faced many challenges in this project, and weren't able to accomplish everything as we wished.

Here are some of challenges we faced.

1. Verifying on EVM was nearly impossible. We would often hit the gas limit costing over 30mil gas.
2. We can find a way to optimize the circuit, or integrate the zk proof natively on polkadot substrate
2. Generating proof on different environment yields a slightly different proof due to their runtime libraries. Make proof generation work on wasm.
4. halo2 proof generation takes a long time over 5 mins. We can find a way to make the proof generation faster.

## How to run
1. Go to ./src/zk-face-ios, and build and run the iOS app. It requires xcode.
2. Go to ./src/zk-face-circuit. and run `make run-server`
3. The verifier contract is on `0xF9Dd882Bc586D4169197C1dd93278008529f23Ab` on Moonbase Alpha.

## Team
- SeungJu Lee [GitHub](https://github.com/seungjulee) [LinkedIn](https://linkedin.com/in/seungjulee)
- Jin Hyung Park [GitHub](https://github.com/sigridjineth) [LinkedIn](https://www.linkedin.com/in/jinhyungp1/)
- Danna Lee [GitHub](https://github.com/dannaward) [LinkedIn](https://www.linkedin.com/in/danna-lee-65aa731b7/)
- Jihoon Song [GitHub](https://github.com/jihoonsong) [LinkedIn](https://www.linkedin.com/in/jihoon-song/?originalSubdomain=kr)

