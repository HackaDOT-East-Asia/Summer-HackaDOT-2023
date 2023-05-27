# Youtube link to your Demo video (5-10min length)

Launchpad - minting https://youtu.be/D4NlRGEfKtE

Launchpad - refund https://youtu.be/gPIIRB-t9PY

# Short Description of your project

Paras is an NFT launchpad and marketplace on ink!. The launchpad is equipped with refundable feature that
provides a safety net for every purchase, all refunds are on-chain with time limit.

Our marketplace provides both secondary sales and primary mints. That means creators can create NFT
right from the marketplace itself, this ease the onboarding of NFT creator to ink! wasm. Please look at
`paras-ink-marketplace` for secondary marketplace implementation and `paras-ink-nft-series-contract`
for our shared nft contract.

Launchpad features

1. Multiple mint options (prepresale / OG, presale / WL, public)
2. Refundable option with adjusted time limit

Marketplace features

1. Create sale with PSP34 approval
2. Deposit and make offer
3. Dynamic royalty with NFT series contract

NFT Series features

1. Create collection inside a shared smart contract
2. Create an NFT series (lazy mint NFT(s)) on a collection
3. Set royalty per series

# How to run your code

## Installation

1. Ensure that rust and cargo are installed on your system, if not please refer to https://rustup.rs/.
2. Please also install nodeJS, this guide uses version `v16.17.0`, install `yarn` as well.
3. Install parity's cargo-contract to compile ink! code,

```sh
$ cargo install --force --locked cargo-contract@2.1.0
```

## Compiling the contract

### Refundable contract

Change your directory to `src/paras-ink-marketplace/contracts/marketplace`, and then run cargo-contract

```sh
$ cargo +nightly-2023-02-07 contract build --release
```

Your WASM and ABI should be inside `src/paras-ink-nft-refundable-contract/target/ink/paras_refundable`

### Marketplace contract

Change your directory to `src/paras-ink-nft-refundable-contract/contracts/paras_refundable`, and then run cargo-contract

```sh
$ cargo +nightly-2023-02-07 contract build --release
```

Your WASM and ABI should be inside `src/paras-ink-marketplace/target/ink/marketplace`

### NFT Series contract

Change your directory to `src/paras-ink-nft-series-contract/contracts/nft`, and then run cargo-contract

```sh
$ cargo +nightly-2023-02-07 contract build --release
```

Your WASM and ABI should be inside `src/paras-ink-nft-series-contract/target/ink/nft`

## Unit test

On each of the smart contract projects, run the following,

```sh
$ cargo +nightly-2023-02-07 test
```

## Integration test

After compiling the contract, move the `.contract`, `.wasm`, and `.json` files to `src/<project>/artifacts`.
Run typechain compiler to create the required typescript files.

```sh
$ npx @727-ventures/typechain-compiler --release --nc
```

After that run `yarn test`

## Deploying and running the contract

You can use https://contracts-ui.substrate.io/ or https://polkadotjs-apps.web.app/ to deploy the contract on live testnet chains.

# Description of your team(Team Background with both LinkedIn and Github Page)

Paras team is span across the globe, with headquarter in Jakarta, Indonesia. A group of passionate people that tries to move the creator's economy forward and bring blockchain to mainstream audience.

Riqi - CEO (https://www.linkedin.com/in/rahmat-albariqi-630400a8)
Irfi - Lead Engineer (https://www.linkedin.com/in/irfianto/, https://github.com/emarai)
Ekki - Lead Product Manager (https://www.linkedin.com/in/ekkirinaldi/)
