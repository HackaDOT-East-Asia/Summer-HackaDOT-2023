# Swanky2.0-Sample

## デプロイ済みのコントラクト

| No. | コントラクト名      | Contract UI     | ネットワーク |
| --- | ----------------------------------------------- | ---------------------------- | ------------ |
| 1   | Content | [YxeQPrU75g7Vv9biMw27jFqjfLU5ansb5ryqvgG7QN2W8VG](https://contracts-ui.substrate.io/contract/YxeQPrU75g7Vv9biMw27jFqjfLU5ansb5ryqvgG7QN2W8VG) | Shibuya      |
| 2  | NFT | [](https://contracts-ui.substrate.io/contract/) | Shibuya      |

## 動いた環境

- swanky

```bash
@astar-network/swanky-cli/2.1.2 darwin-x64 node-v18.12.1
```

- rustup

```bash
rustup 1.26.0 (5af9b9484 2023-04-05)
```

- rustc 

```bash
rustc 1.71.0-nightly (18bfe5d8a 2023-05-14)
```

- rustup show 

```bash
Default host: x86_64-apple-darwin
rustup home:  /Users/harukikondo/.rustup

installed toolchains
--------------------

stable-x86_64-apple-darwin
nightly-2023-02-07-aarch64-apple-darwin
nightly-2023-02-07-x86_64-apple-darwin
nightly-x86_64-apple-darwin (default)

installed targets for active toolchain
--------------------------------------

wasm32-unknown-unknown
x86_64-apple-darwin

active toolchain
----------------

nightly-x86_64-apple-darwin (default)
rustc 1.71.0-nightly (18bfe5d8a 2023-05-14)
```

- cargo contract 

```bash
cargo-contract-contract 2.2.1-unknown-x86_64-apple-darwin
```

### 動かし方

- flipperのコンパイル

```bash
yarn compile:flipper
```

- contentのコンパイル

```bash
yarn compile:content
```

### 参考サイト

1. [Polkadot.js App](https://polkadot.js.org/apps/#/explorer)
2. [!ink Docs](https://use.ink/)