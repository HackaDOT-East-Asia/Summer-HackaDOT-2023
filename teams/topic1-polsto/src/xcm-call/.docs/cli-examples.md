CLI Examples
============

## Local network config

See <a href="../src/examples/local-network/readme.md">Our tutorial</a> to make a local network with zombienet.

## Local network examples

### Relay to parachain (from Alice account)

TeleportAssets:
```sh
xcm-sdk teleportAssets \
--rpc ws://127.0.0.1:9900 \
--mnemonic //Alice \
--dest Parachain \
--destV 1000 \
--ben AccountId32 \
--benV '<statamine account>' \
--a 1000000000000
```

LimitedTeleportAssets:
```sh
xcm-sdk limitedTeleportAssets \
--rpc ws://127.0.0.1:9900 \
--mnemonic //Alice \
--dest Parachain \
--destV 1000 \
--ben AccountId32 \
--benV '<statamine account>' \
--a 1000000000000
```

### Parachain to Relay (from Alice account)

LimitedTeleportAssets:
```sh
xcm-sdk limitedTeleportAssets \
--rpc ws://127.0.0.1:9910 \
--mnemonic //Alice \
--destP 1 \
--ben AccountId32 \
--benV '<relay chain account>' \
--assetP 1 \
--a 1000000000000
```
### Statemine to trappist (from Alice account)

```sh
xcm-sdk limitedReserveTransferAssets \
--rpc ws://127.0.0.1:9910 \
--mnemonic //Alice \
--dest Parachain \
--destV 2000 \
--destP 1 \
--ben AccountId32 \
--benV '<trappist account>' \
--assetId 1 \
--a 1000000000000
```


## Rococo examples

### Rococo to rockmine

teleportAssets:
```sh
xcm-sdk teleportAssets \
--rpc wss://rococo-rpc.polkadot.io \
--mnemonic '<account mnemonic>' \
--dest Parachain \
--destV 1000 \
--ben AccountId32 \
--benV '<rococo destination account>' \
--a 1000000000000
```

limitedTeleportAssets
```sh
xcm-sdk limitedTeleportAssets \
--rpc wss://rococo-rpc.polkadot.io \
--mnemonic '<account mnemonic>' \
--dest Parachain \
--destV 1000 \
--ben AccountId32 \
--benV '<rockmine destination account>' \
--a 1000000000000
```

### RockMine to Rococo

```sh
xcm-sdk limitedTeleportAssets \
--rpc wss://rococo-rockmine-rpc.polkadot.io \
--mnemonic '<account mnemonic>' \
--destP 1 \
--ben AccountId32 \
--benV '<rococo destination account>' \
--assetP 1 \
--a 1000000000000
```
