# Helpful Resources

_This docs include helpful resources to get start with building a Parachain project_ 

## Polkadot Guide

Before you dive into building a parachain, it would be great to have a look at the [architecture of Polkadot](https://wiki.polkadot.network/docs/learn-architecture) and how it works

## Development Tools
### Substrate

SDK for building blockchain written in Rust. **Blockchain development is complex.** It involves sophisticated technologies—including advanced cryptography and distributed network. [Substrate](https://docs.substrate.io) makes this high barriers of developing core of blockchain lower with high flexibility. You can start with the [tutorials](https://docs.substrate.io/tutorials/get-started/). **_Start hacking with cloning this [repo](https://github.com/paritytech/substrate) in your local environment!_**

### Cumulus

SDK for building a [parachain](https://wiki.polkadot.network/docs/learn-parachains). Cumulus is a a set of tools for writing **Substrate-based Polkadot parachains**. You can start with the [tutorials](https://docs.substrate.io/tutorials/connect-relay-and-parachains/). **_Start hacking with cloning this [repo](https://github.com/paritytech/cumulus) for building a parachain._**

### Polkadot

Polkadot node([Relay Chain](https://wiki.polkadot.network/docs/learn-architecture#relay-chain)) implementation. Code can be found [here](https://github.com/paritytech/polkadot)

### Zombienet

A cli tool to easily spawn ephemeral Polkadot/Substrate networks and perform tests against them. Even if you have built your own Substrate-based parachain, it is hard to create test environment for relay chain and parachain. **Zombienet aims to be a testing framework for Substrate based blockchains,** providing pre-built environment of relay chain and parachain, which [make easy to simulate your parachains](https://docs.substrate.io/test/simulate-parachains/). This is not mandatory but highly recommended! Take a look at the [repo](https://github.com/paritytech/zombienet)

### Others 

[Substrate storage](https://www.shawntabrizi.com/substrate/substrate-storage-deep-dive/)

[XCM Overview](https://www.youtube.com/watch?v=kAAzgpTAMZ4&list=RDCMUCB7PbjuZLEba_znc7mEGNgw&index=21)


