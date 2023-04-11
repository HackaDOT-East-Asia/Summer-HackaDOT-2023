# Topic 6 : Support Asymmetric encryption/decryption feature
> Mentor: SubWallet 

## Description

The way to add the asymmetric encryption/decryption feature than the one already implemented, **which does not work with sr25519**

It works more like the _eth decrypt function from Metamask_, where only one public key/private key pair is involved: you can encrypt data with the public key of the recipient, and only this recipient can decrypt the data with his private/secret key 

## What has been done?

- Add encrypt/decrypt methods to util-crypto\sr25519 following ECIES
- Add encrypt/decrypt methods to util-crypto\ed25519 using existing encryption feature, but with an ephemeral key (similar as ECIES)
- Add encrypt method to keyring (encrypt data without the need of a keypair)
- Add encrypt/decrypt methods to  keyringPair
Implementation details

## Implementation Details

Following sr25519 Encryption/Decryption following Elliptic Curve Integrated Encryption Scheme (ECIES). See https://cryptobook.nakov.com/asymmetric-key-ciphers/ecies-public-key-encryption

The algorithms used were chosen among those already used in this library.

1. Ephemeral Key generation
Generate new keypair using the wasm sr25519KeypairFromSeed function, with a random seed from mnemonicGenerate

2. Key Agreement
Use wasm sr25519Agree function between the generated ephemeral private key and the recipient public key

3. Key Derivation
Use pbkdf2 (random salt is generated, default 2048 rounds) to derive a new secret from the previous step output

    The derived secret is split into :
    - MAC key (first 32 bytes)
    - encryption key (last 32 bytes)

4. Encryption
Use nacl.secretbox api symmetric encryption (xsalsa20-poly1305) to encrypt the message
with the encryption key generated at step 3.
A nonce (24 bytes) is randomly generated.

5. MAC Generation
HMAC SHA256 (using the MAC key from step 3) of the concatenation of the encryption nonce, ephemeral public key and encrypted message


The encrypted message is the concatenation of the following elements:

- nonce (24 bytes) : random generated nonce used for the symmetric encryption (step 4)
- keyDerivationSalt (32 bytes) : random generated salt used for the key derivation (step 3)
- public key (32 bytes): public key of the ephemeral generated keypair (step 1)
macValue (32 bytes): mac value computed at step 5
encrypted (remaining bytes): encrypted message (step 4)

All handy resources can be found [here](https://github.com/HackaDOT-East-Asia/Summer-HackaDOT-2023/tree/main/topics/topic6-subwallet/docs)