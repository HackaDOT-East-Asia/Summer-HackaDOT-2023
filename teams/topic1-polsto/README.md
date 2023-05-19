
# BWG LS Unit 1
## STO platform

## structure
```
Teams
ㄴ src : source code here
ㄴ docs
ㄴ README.md
```

## DEV-ENV
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
src/zombienet/examples/9999-polsto-config.toml를 수정하여 사용
  - 각 체인별 binary 위치 설정

### run
./\<zombienet runfile> spawn \<configfile> -p native

example
```sh
./zombienet spawn config.toml -p native
```