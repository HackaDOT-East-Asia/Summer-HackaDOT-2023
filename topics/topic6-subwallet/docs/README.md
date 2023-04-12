# Helpful Resources
_This doc includes how to support encryption/decryption_

## SubWallet

[SubWallet](https://docs.subwallet.app/) is a user-friendly Web3 Multiverse Gateway for Polkadot and Kusama ecosystem. Our vision is to provide you with the simplest and most secure way to connect to blockchain-based applications like DeFi and GameFi on Polkadot.

## SubWallet Extension

SubWallet is forked from [polkadot-js/extension](https://github.com/polkadot-js/extension). Team aims to adding more features while being able to rebase the polkadot-js origin at any time. Have a look [how the team has implemented the wallet extension](https://github.com/Koniverse/SubWallet-Extension)

## What is Asymmetric encryption?
Asymmetric encryption uses two different keys for encryption and decryption. The key used for encrypton is the public key, and the key used for decryption is the private key. The receiver must possess both private and public key. This implementation avoids the problem of key exchange (as can be seen in symmetric encryption). 

### Example: 
- Alice wants to send a message to Bob
- Bob must have a public and a private key
- Alice encrypts the message with Bob's public key
- Bob decrypts the message with his private key

### Potential use cases for Asymmetric encryption:
- Enhancing security of user's accounts
- Wallet-to-wallet messaging implementation
- Keeping your messages/data/transaction secure and private

## What you will be working with:
Polkadot provides a library called Keyring which handles Substrate accounts, retrieving key pairs and signing of any data. You would take a dive into cryptography, concepts and implementation of account on Polkadot.
https://polkadot.js.org/docs/api/start/keyring/

https://wiki.polkadot.network/docs/learn-cryptography

https://github.com/polkadot-js/common/tree/master/packages/keyring

## What has been done so far?
Some attempts have been taken but none of them provides a reliable way to work with sr25519

### Suggestions:
- Add encrypt/decrypt methods to util-crypto\sr25519 following ECIES
- Add encrypt/decrypt methods to util-crypto\ed25519 using existing encryption feature, but with an ephemeral key (similar as ECIES)
- Add encrypt method to keyring (encrypt data without the need of a keypair)
- Add encrypt/decrypt methods to keyringPair Implementation details

### Resources:
Following sr25519 Encryption/Decryption following Elliptic Curve Integrated Encryption Scheme (ECIES). See https://cryptobook.nakov.com/asymmetric-key-ciphers/ecies-public-key-encryption

The algorithms used were chosen among those already used in this library.

Ephemeral Key generation Generate new keypair using the wasm sr25519KeypairFromSeed function, with a random seed from mnemonicGenerate

Key Agreement Use wasm sr25519Agree function between the generated ephemeral private key and the recipient public key

Key Derivation Use pbkdf2 (random salt is generated, default 2048 rounds) to derive a new secret from the previous step output

### The derived secret is split into :

MAC key (first 32 bytes)
encryption key (last 32 bytes)
Encryption Use nacl.secretbox api symmetric encryption (xsalsa20-poly1305) to encrypt the message with the encryption key generated at step 3. A nonce (24 bytes) is randomly generated.

MAC Generation HMAC SHA256 (using the MAC key from step 3) of the concatenation of the encryption nonce, ephemeral public key and encrypted message

### The encrypted message is the concatenation of the following elements:

nonce (24 bytes) : random generated nonce used for the symmetric encryption (step 4)
keyDerivationSalt (32 bytes) : random generated salt used for the key derivation (step 3)
public key (32 bytes): public key of the ephemeral generated keypair (step 1) macValue (32 bytes): mac value computed at step 5 encrypted (remaining bytes): encrypted message (step 4)

https://github.com/ethers-io/ethers.js/issues/1422

https://github.com/polkadot-js/common/issues/1792

https://github.com/polkadot-js/common/pull/1762

https://github.com/polkadot-js/common/issues/633

https://github.com/polkadot-js/common/pull/1331

https://www.sumi.network/

https://www.youtube.com/watch?v=a8P5xHkMqzI

https://docs.metamask.io/guide/rpc-api.html#eth-decrypt

https://github.com/polkadot-js/common/pull/1070/files

https://github.com/polkadot-js/common/blob/9e3b42b32e2823fae3590a9c65350b6a08396e54/packages/keyring/src/pair/index.spec.ts#L182
https://metamask.github.io/test-dapp/
https://medium.com/metamask/metamask-api-method-deprecation-2b0564a84686
https://www.youtube.com/watch?v=VB3IWrgx1Bk



