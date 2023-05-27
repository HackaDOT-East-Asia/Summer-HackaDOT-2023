Ejemplos del CLI
================

## Configuración de red local

Ve <a href="../src/examples/local-network/readme-es.md">nuestro tutorial</a> para levantar una red local usando zombienete.

## Ejemplos de red local

### Relay a parachain (desde la cuenta de Alice)

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

### Parachain a Relay (desde la cuenta de Alice)

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
### Statemine a trappist (desde la cuenta de Alice)

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

## Ejemplos de Rococo

### Rococo a rockmine

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

### RockMine a Rococo

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
