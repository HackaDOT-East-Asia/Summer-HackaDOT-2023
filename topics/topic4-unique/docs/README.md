# Helpful Resources
_This doc includes useful references of how to start building NFT games with JS_

## Unique Network

[Unique Network](https://unique.network) is a scalable blockchain for composable NFTs with advanced economies — The Substrate-built parachain for Polkadot and Kusama. 

[The Unique Pallet](https://github.com/UniqueNetwork/unique-chain) is the core of NFT functionality. Like ERC-721 standard in Ethereum ecosystem, this pallet provides the basement for creating collections of unique non-divisible things, also called Non Fungible Tokens (NFTs), minting NFT of a given Collection, and managing their ownership.

The pallet also enables **storing NFT properties**. Though (according to ERC-721) NFT properties belong to logic of a concrete application that operates a Collection, so purposefully the NFT Tracking Module does not have any knowledge about properties except their byte size leaving application logic out to be controlled by Smart Contracts.

**The Unique Chain also provides:**

- Smart Contracts Pallet and example smart contract that interacts with Unique Runtime
- ERC-1155 Functionality (currently PoC as Re-Fungible tokens, i.e. items that are still unique, but that can be split between multiple users)
- Variety of economic options for dapp producers to choose from to create freemium games and other ways to attract users. As a step one, we implemented an economic model when a collection sponsor can be set to pay for collection Transfer transactions.

## Development 

Unique Network [provides various blockchain connection tools](https://docs.unique.network/sdk/) in order to simplify the features implementation in your project.

Depending on the project characteristics and the development team capabilities, you can choose the most suitable tool for you: SDK, Substrate REST or Substrate Client. [Here's an example how to use these various tools](https://docs.unique.network/sdk/examplesSDK.html). Also look at the interestring features of Unique network: [Live NFT](https://docs.unique.network/sdk/examplesLifeNFT.html) and [Nesting](https://docs.unique.network/sdk/examplesNesting.html)

