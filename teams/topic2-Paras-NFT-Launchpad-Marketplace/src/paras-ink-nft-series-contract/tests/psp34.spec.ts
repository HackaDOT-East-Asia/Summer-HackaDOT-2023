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
      (
        await nftFactory.new(
          ["NFT"],
          ["SH34"],
          bob.address, // marketplace treasury
          200
        )
      ).address,
      deployer,
      api
    );
  }

  it("Create contract works", async () => {
    await setup();
    expect(
      (await contract.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(0);
    expect((await contract.query.owner()).value.ok).to.equal(deployer.address);
  });

  it("Create collection  works", async () => {
    await setup();

    let createCollectionResult = await contract
      .withSigner(projectAccount)
      .tx.nftCreateCollection(null, null, null, null, null, null);

    emit(createCollectionResult, "NFTCreateCollection", {
      collectionId: 1,
      creatorAddress: projectAccount.address,
      title: null,
      description: null,
      media: null,
      cover: null,
      twitter: null,
      website: null,
    });
  });

  it("Create series works", async () => {
    await setup();

    await contract
      .withSigner(projectAccount)
      .tx.nftCreateCollection(null, null, null, null, null, null);

    const createSeriesResult = await contract
      .withSigner(projectAccount)
      .tx.nftCreateSeries(1, BASE_URI, null, 10000, [], false);

    emit(createSeriesResult, "NFTCreateSeries", {
      baseUri: BASE_URI,
      iterative: false,
      price: null,
      royalty: [],
      copies: 10000,
      tokenSeriesId: 1,
      collectionId: 1,
      creatorAddress: projectAccount.address,
    });

    let tokenSeriesMetadata = (await contract.query.getSeries(1)).value.ok;

    expect(tokenSeriesMetadata.mintedCopies).to.be.eq(0);
    expect(tokenSeriesMetadata.copies).to.be.eq(10000);
  });

  it("Mint from token series works", async () => {
    await setup();
    const tokenId: Id = IdBuilder.U64(1);

    await contract
      .withSigner(projectAccount)
      .tx.nftCreateCollection(null, null, null, null, null, null);

    await contract
      .withSigner(projectAccount)
      .tx.nftCreateSeries(1, BASE_URI, null, 10000, [], false);

    expect(
      (await contract.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(0);

    // mint
    const gasRequired = (
      await contract.withSigner(projectAccount).query.nftMint(1, bob.address)
    ).gasRequired;

    let mintResult = await contract
      .withSigner(projectAccount)
      .tx.nftMint(1, bob.address, { value: 0, gasLimit: gasRequired });

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

    await contract
      .withSigner(projectAccount)
      .tx.nftCreateCollection(null, null, null, null, null, null);

    await contract
      .withSigner(projectAccount)
      .tx.nftCreateSeries(1, BASE_URI, null, 10000, [], false);

    // Bob mints
    let gasRequired = (
      await contract.withSigner(projectAccount).query.nftMint(1, bob.address)
    ).gasRequired;
    let mintResult = await contract
      .withSigner(projectAccount)
      .tx.nftMint(1, bob.address, { value: 0, gasLimit: gasRequired });

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

    await contract
      .withSigner(projectAccount)
      .tx.nftCreateCollection(null, null, null, null, null, null);

    await contract
      .withSigner(projectAccount)
      .tx.nftCreateSeries(1, BASE_URI, null, 10000, [], false);

    // Bob mints
    let { gasRequired } = await contract
      .withSigner(projectAccount)
      .query.nftMint(1, bob.address);
    await contract
      .withSigner(projectAccount)
      .tx.nftMint(1, bob.address, { value: 0, gasLimit: gasRequired });

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
