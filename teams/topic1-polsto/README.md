
# Project Polsto
## Demo
youtube

## Description
We have implemented several features as a STO platform that can tokenize income-generating underlying assets as parachains. The features we implement can be explained in the following 3 ways
* Security of token issuance : Custom Multi-sig Account
* Token transfer due to Issuance, Distribution separation : XCM
* Distribution of revenue from Income-generating securities : Wasm(Smart contract)

## How to run
### build polkadot
```sh
cd src/polkadot
rustup show #check active rust toolchain
cargo build --release
```

### build cumulus for statemine parachain
```sh
cd src/cumulus
rustup show #check active rust toolchain
cargo build --release --bin polkadot-parachain
```

### build trappist for trappist, standard parachain
```sh
cd src/trappist
rustup show #check active rust toolchain
cargo build --release --features with-trappist-runtime
cargo build --release --no-default-features --features with-stout-runtime --target-dir target_stout
```

### build zombienet
```sh
cd src/zombienet
npm install
npm run build
```

### set zombienet config
fix and use src/zombienet/examples/9999-polsto-config.toml
  - set conficuration for each chains

### run
./\<zombienet runfile> spawn \<configfile> -p native

example
```sh
./zombienet spawn config.toml -p native
```

## About Team LS Unit
Our team members belong to LS Unit. LS Unit is a research and development team to discover new IT businesses. LS Unit is currently developing an on-chain data analysis solution.
With the announcement of Korea’s STO guidelines, we have been devising a platform to tokenize real-world underlying assets since the beginning of this year.
We are well aware of the charm of Substrate and various advantages of Polkadot blockchain ecosystems such as XCM, and we would like to actively use them.
The output we are submitting to Hackadot is a demo version that implements some of the features of the platform we are envisioning.
