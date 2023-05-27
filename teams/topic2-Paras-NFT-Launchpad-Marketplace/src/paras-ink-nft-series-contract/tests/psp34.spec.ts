// @ts-nocheck
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { encodeAddress } from "@polkadot/keyring";
import BN from "bn.js";
import NFT_factory from "../types/constructors/nft";
import NFT from "../types/contracts/nft";

import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { ReturnNumber } from "@727-ventures/typechain-types";
import { Id, IdBuilder } from "../types/types-arguments/nft";

use(chaiAsPromised);

const MAX_SUPPLY = 888;
const BASE_URI = "ipfs://tokenUriPrefix/";
const COLLECTION_METADATA = "ipfs://collectionMetadata/data.json";
const TOKEN_URI_1 = "ipfs://tokenUriPrefix/1.json";
const TOKEN_URI_5 = "ipfs://tokenUriPrefix/5.json";

// Create a new instance of contract
const wsProvider = new WsProvider("ws://127.0.0.1:9944");
// Create a keyring instance
const keyring = new Keyring({ type: "sr25519" });

describe("Minting psp34 tokens", () => {
  let nftFactory: NFT_factory;
  let api: ApiPromise;
  let deployer: KeyringPair;
  let bob: KeyringPair;
  let projectAccount: KeyringPair;
  let contract: NFT;

  const gasLimit = 18750000000;
  const ZERO_ADDRESS = encodeAddress(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  let gasRequired: bigint;

  async function setup(): Promise<void> {
    api = await ApiPromise.create({ provider: wsProvider });
    deployer = keyring.addFromUri("//Alice");
    bob = keyring.addFromUri("//Bob");
    projectAccount = keyring.addFromUri("//Charlie");
    nftFactory = new NFT_factory(api, deployer);
    contract = new NFT(
      (await nftFactory.new(["NFT"], ["SH34"], [BASE_URI])).address,
      deployer,
      api
    );
  }

  it("Create collection works", async () => {
    await setup();
    expect(
      (await contract.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(0);
    expect((await contract.query.owner()).value.ok).to.equal(deployer.address);
  });

  it("Use mintNext works", async () => {
    await setup();
    const tokenId: Id = IdBuilder.U64(1);

    expect(
      (await contract.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(0);

    // mint
    const gasRequired = (await contract.withSigner(bob).query.mintNext())
      .gasRequired;

    let mintResult = await contract
      .withSigner(bob)
      .tx.mintNext({ value: 0, gasLimit: gasRequired });

    // verify minting results. The totalSupply value is BN
    expect(
      (await contract.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(1);
    expect((await contract.query.balanceOf(bob.address)).value.ok).to.equal(1);
    expect((await contract.query.balanceOf(bob.address)).value.ok).to.equal(1);

    expect((await contract.query.ownerOf(tokenId)).value.ok).to.equal(
      bob.address
    );
    emit(mintResult, "Transfer", {
      from: null,
      to: bob.address,
      id: tokenId,
    });
  });

  it("Token transfer works", async () => {
    await setup();

    // Bob mints
    let gasRequired = (await contract.withSigner(bob).query.mintNext())
      .gasRequired;
    let mintResult = await contract
      .withSigner(bob)
      .tx.mintNext({ value: 0, gasLimit: gasRequired });

    const firstTokenId = IdBuilder.U64(1);

    emit(mintResult, "Transfer", {
      from: null,
      to: bob.address,
      id: firstTokenId,
    });

    // Bob transfers token to Deployer
    const transferGas = (
      await contract
        .withSigner(bob)
        .query.transfer(deployer.address, firstTokenId, [])
    ).gasRequired;
    let transferResult = await contract
      .withSigner(bob)
      .tx.transfer(deployer.address, firstTokenId, [], {
        gasLimit: transferGas,
      });

    // Verify transfer
    expect((await contract.query.ownerOf(firstTokenId)).value.ok).to.equal(
      deployer.address
    );
    expect((await contract.query.balanceOf(bob.address)).value.ok).to.equal(0);
    emit(transferResult, "Transfer", {
      from: bob.address,
      to: deployer.address,
      id: firstTokenId,
    });
  });

  it("Token approval works", async () => {
    await setup();

    // Bob mints
    let { gasRequired } = await contract.withSigner(bob).query.mintNext();
    await contract
      .withSigner(bob)
      .tx.mintNext({ value: 0, gasLimit: gasRequired });

    const firstTokenId = IdBuilder.U64(1);

    // Bob approves deployer to be operator of the token
    const approveGas = (
      await contract
        .withSigner(bob)
        .query.approve(deployer.address, firstTokenId, true)
    ).gasRequired;
    let approveResult = await contract
      .withSigner(bob)
      .tx.approve(deployer.address, firstTokenId, true, {
        gasLimit: approveGas,
      });

    // Verify that Bob is still the owner and allowance is set
    expect((await contract.query.ownerOf(firstTokenId)).value.ok).to.equal(
      bob.address
    );
    expect(
      (
        await contract.query.allowance(
          bob.address,
          deployer.address,
          firstTokenId
        )
      ).value.ok
    ).to.equal(true);
    emit(approveResult, "Approval", {
      from: bob.address,
      to: deployer.address,
      id: firstTokenId,
      approved: true,
    });
  });

  it("Cannot mint after mint_end true", async () => {
    await setup();

    expect(
      (await contract.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(0);

    await contract.withSigner(deployer).tx.setMintEnd(true);

    const mintEnd = contract.query.getMintEnd();

    expect((await mintEnd).value.ok).to.equal(true);

    // mint
    const result = await contract.withSigner(bob).query.mintNext();

    expect(result.value.ok.err.custom).to.equal("0x4d696e74456e64");
  });

  it("Cannot mint twice", async () => {
    await setup();
    expect(
      (await contract.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(0);

    let alreadyMinted = await contract.query.getIsAccountMinted(bob.address);

    expect(alreadyMinted.value.ok).to.equal(false);
    // mint
    const { gasRequired } = await contract.withSigner(bob).query.mintNext();
    await contract
      .withSigner(bob)
      .tx.mintNext({ value: 0, gasLimit: gasRequired });

    alreadyMinted = await contract.query.getIsAccountMinted(bob.address);
    expect(alreadyMinted.value.ok).to.equal(true);

    const result = await contract.withSigner(bob).query.mintNext();

    expect(result.value.ok.err.custom).to.equal(
      "0x43616e6e6f744d696e744d6f72655468616e4f6e6365"
    );
  });
});

// Helper function to parse Events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function emit(result: { events?: any }, name: string, args: any): void {
  const event = result.events.find(
    (event: { name: string }) => event.name === name
  );
  for (const key of Object.keys(event.args)) {
    if (event.args[key] instanceof ReturnNumber) {
      event.args[key] = event.args[key].toNumber();
    }
  }
  expect(event).eql({ name, args });
}

// Helper function to convert error code to string
function hex2a(psp34CustomError: any): string {
  var hex = psp34CustomError.toString(); //force conversion
  var str = "";
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str.substring(1);
}
