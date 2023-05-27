import "@polkadot/api-augment";
import type { WeightV2, Weight } from "@polkadot/types/interfaces";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { encodeAddress } from "@polkadot/keyring";
import { FrameSystemAccountInfo } from "@polkadot/types/lookup";
import BN from "bn.js";
import Market_factory from "../types/constructors/marketplace";
import Market from "../types/contracts/marketplace";
import TestPSP34_factory from "../types/constructors/test_psp34";
import TestPSP34 from "../types/contracts/test_psp34";
import Shiden34_Factory from "../types/constructors/shiden34";
import Shiden34 from "../types/contracts/shiden34";
import Rmrk_Factory from "../types/constructors/rmrk_equippable";
import Rmrk from "../types/contracts/rmrk_equippable";
import NFTSeries_Factory from "../types/constructors/nft";
import NFTSeries from "../types/contracts/nft";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { ReturnNumber } from "@727-ventures/typechain-types";
import { Hash, NftContractType } from "../types/types-arguments/marketplace";

use(chaiAsPromised);

const MAX_SUPPLY = 888;
const ONE = new BN(10).pow(new BN(18));
const PRICE_PER_MINT = ONE;
const MAX_REF_TIME = "500000000000";
const MAX_PROOF_SIZE = "5242880";

// Create a new instance of contract
const wsProvider = new WsProvider("ws://127.0.0.1:9944");
// Create a keyring instance
const keyring = new Keyring({ type: "sr25519" });

describe("Marketplace tests", () => {
  let marketplaceFactory: Market_factory;
  let psp34Factory: TestPSP34_factory;
  let shiden34Factory: Shiden34_Factory;
  let rmrkFactory: Rmrk_Factory;
  let nftSeriesFactory: NFTSeries_Factory;
  let api: ApiPromise;
  let deployer: KeyringPair;
  let bob: KeyringPair;
  let charlie: KeyringPair;
  let marketplace: Market;
  let psp34: TestPSP34;
  let shiden34: Shiden34;
  let rmrk: Rmrk;
  let nftSeries: NFTSeries;

  const gasLimit = 18750000000;
  const ZERO_ADDRESS = encodeAddress(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  let gasRequired: bigint;

  async function setup(): Promise<void> {
    api = await ApiPromise.create({ provider: wsProvider });
    deployer = keyring.addFromUri("//Alice");
    bob = keyring.addFromUri("//Bob");
    charlie = keyring.addFromUri("//Charlie");
    marketplaceFactory = new Market_factory(api, deployer);
    psp34Factory = new TestPSP34_factory(api, deployer);
    shiden34Factory = new Shiden34_Factory(api, deployer);
    rmrkFactory = new Rmrk_Factory(api, deployer);
    nftSeriesFactory = new NFTSeries_Factory(api, deployer);
    marketplace = new Market(
      (await marketplaceFactory.new(deployer.address)).address,
      deployer,
      api
    );
    psp34 = new TestPSP34((await psp34Factory.new()).address, deployer, api);
    shiden34 = new Shiden34(
      (
        await shiden34Factory.new(
          "default".split(""),
          "DFT".split(""),
          "uri".split(""),
          1000,
          1
        )
      ).address,
      deployer,
      api
    );
    rmrk = new Rmrk(
      (
        await rmrkFactory.new(
          "default".split(""),
          "DFT".split(""),
          "uri".split(""),
          1000,
          1,
          "meta".split(""),
          deployer.address,
          1
        )
      ).address,
      deployer,
      api
    );
    nftSeries = new NFTSeries(
      (
        await nftSeriesFactory.new(
          ["Paras Collectibles"],
          ["PC"],
          deployer.address,
          200
        )
      ).address,
      deployer,
      api
    );
  }

  it("setup and mint works", async () => {
    await setup();
    const { gasRequired } = await psp34
      .withSigner(bob)
      .query.mint(bob.address, { u64: 1 });
    let mintResult = await psp34
      .withSigner(bob)
      .tx.mint(
        bob.address,
        { u64: 1 },
        { gasLimit: getEstimatedGas(gasRequired) }
      );
    expect(
      (await psp34.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(2);
    expect((await psp34.query.balanceOf(bob.address)).value.unwrap()).to.equal(
      1
    );
    expect((await psp34.query.ownerOf({ u64: 1 })).value.unwrap()).to.equal(
      bob.address
    );
  });

  it("setMarketplaceFee works", async () => {
    await setup();
    let { gasRequired } = await marketplace.query.setMarketplaceFee(120);

    let result = await marketplace.tx.setMarketplaceFee(120, {
      gasLimit: getEstimatedGas(gasRequired),
    });
    expect(
      (await marketplace.query.getMarketplaceFee()).value.unwrap()
    ).to.equal(120);
  });

  it("register contract works for the Marketplace owner", async () => {
    await setup();
    await registerContract(deployer);

    const contract = await (
      await marketplace.query.getRegisteredCollection(psp34.address)
    ).value.unwrap();

    expect(contract.royalty[0]).to.be.equal(deployer.address);
    expect(contract.royalty[1]).to.be.equal(100);
  });

  it("register contract fails if fee is too high", async () => {
    await setup();

    const { gasRequired } = await marketplace
      .withSigner(deployer)
      .query.register(
        psp34.address,
        deployer.address,
        10001,
        NftContractType.psp34
      );
    const registerResult = await marketplace
      .withSigner(deployer)
      .query.register(
        psp34.address,
        deployer.address,
        10001,
        NftContractType.psp34,
        {
          gasLimit: getEstimatedGas(gasRequired),
        }
      );

    expect(registerResult.value.unwrap().err.hasOwnProperty("feeTooHigh")).to.be
      .true;
  });

  it("list / unlist works", async () => {
    await setup();
    await mintToken(bob);
    await registerContract(deployer);

    // List token to the marketplace.
    await listToken(bob);

    // Check if the token is actually listed.
    expect(
      BigInt(
        (await marketplace.query.getPrice(psp34.address, { u64: 1 })).value
          .unwrap()
          .toString()
      )
    ).to.equal(BigInt("100000000000000000"));

    // Unlist token from the marketplace.
    const { gasRequired } = await marketplace
      .withSigner(bob)
      .query.unlist(psp34.address, { u64: 1 });
    const unlistResult = await marketplace
      .withSigner(bob)
      .tx.unlist(
        psp34.address,
        { u64: 1 },
        { gasLimit: getEstimatedGas(gasRequired) }
      );
    expect(unlistResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(unlistResult, "TokenListed", {
      contract: psp34.address,
      id: { u64: 1 },
      price: null,
    });

    // Check if the token is actually unlisted.
    const price = await marketplace.query.getPrice(psp34.address, { u64: 1 });
    expect(price.value.ok).to.equal(null);
  });

  it("list fails if not a nft owner", async () => {
    await setup();
    await mintToken(bob);
    await registerContract(deployer);

    // Try to list token to the marketplace.
    const { gasRequired } = await marketplace
      .withSigner(charlie)
      .query.list(psp34.address, { u64: 1 }, 100);
    const listResult = await marketplace
      .withSigner(charlie)
      .query.list(psp34.address, { u64: 1 }, 100, {
        gasLimit: getEstimatedGas(gasRequired),
      });

    expect(listResult.value.unwrap().err.hasOwnProperty("notOwner")).to.be.true;
  });

  it("list works if token is already listed", async () => {
    await setup();
    await mintToken(bob);
    await registerContract(deployer);

    // List token to the marketplace.
    await listToken(bob);

    // Try to list the same token again.
    const listResult = await marketplace
      .withSigner(bob)
      .tx.list(psp34.address, { u64: 1 }, 100);

    expect(listResult.result?.isError).to.be.false;
  });

  it("unlist fails if token is not listed", async () => {
    await setup();
    await mintToken(bob);
    await registerContract(deployer);

    // unlist token to the marketplace.
    const { gasRequired } = await marketplace
      .withSigner(bob)
      .query.unlist(psp34.address, { u64: 1 });
    const unlistResult = await marketplace
      .withSigner(bob)
      .query.unlist(
        psp34.address,
        { u64: 1 },
        { gasLimit: getEstimatedGas(gasRequired) }
      );

    expect(
      unlistResult.value.unwrap().err.hasOwnProperty("itemNotListedForSale")
    ).to.be.true;
  });

  it("buy works", async () => {
    await setup();
    await mintToken(charlie);
    await registerContract(deployer);
    await listToken(charlie);

    // Charlie approves marketplace to be operator of the token
    const approveGas = (
      await psp34
        .withSigner(charlie)
        .query.approve(marketplace.address, { u64: 1 }, true)
    ).gasRequired;
    let approveResult = await psp34
      .withSigner(charlie)
      .tx.approve(marketplace.address, { u64: 1 }, true, {
        gasLimit: getEstimatedGas(approveGas),
      });

    const deployerOriginalBalance = await getBalance(deployer);
    const bobOriginalBalance = await getBalance(bob);
    const charlieOriginalBalance = await getBalance(charlie);

    // Buy token
    const { gasRequired, value } = await marketplace.withSigner(bob).query.buy(
      psp34.address,
      { u64: 1 },
      {
        value: new BN("10000000000000000"),
      }
    );
    const buyResult = await marketplace.withSigner(bob).tx.buy(
      psp34.address,
      { u64: 1 },
      {
        gasLimit: getEstimatedGas(gasRequired),
        value: new BN("100000000000000000"),
      }
    );

    expect(buyResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(buyResult, "TokenBought", {
      contract: psp34.address,
      id: { u64: 1 },
      price: BigInt("100000000000000000"),
      from: charlie.address,
      to: bob.address,
    });

    // Balances check.
    const deployerBalance = await getBalance(deployer);
    const bobBalance = await getBalance(bob);
    const charlieBalance = await getBalance(charlie);

    // Check the marketplace fee receiver balance. ATM all royalties go to deployer.
    expect(
      deployerBalance.eq(
        deployerOriginalBalance.add(new BN("2000000000000000"))
      )
    ).to.be.true;
    // Check seller's balance. Should be increased by price - fees
    expect(charlieBalance.toString()).to.be.equal(
      charlieOriginalBalance.add(new BN("98000000000000000")).toString()
    );
    // Check the token owner.
    expect((await psp34.query.ownerOf({ u64: 1 })).value.unwrap()).to.equal(
      bob.address
    );
    // Check if allowance is unset.
    expect(
      (
        await psp34.query.allowance(charlie.address, marketplace.address, {
          u64: 1,
        })
      ).value.ok
    ).to.equal(false);

    // Try to buy the same token again
    const reBuyResult = await marketplace.withSigner(bob).query.buy(
      psp34.address,
      { u64: 1 },
      {
        gasLimit: getEstimatedGas(gasRequired),
        value: new BN("100000000000000000"),
      }
    );
    expect(reBuyResult.value.unwrap().err.hasOwnProperty("alreadyOwner")).to.be
      .true;
  });

  it("buy RMRK works", async () => {
    await setup();
    await mintRmrkToken(charlie);
    await registerRmrkContract(deployer);
    await listRmrkToken(charlie);

    // Charlie approves marketplace to be operator of the token
    const approveGas = (
      await rmrk
        .withSigner(charlie)
        .query.approve(marketplace.address, { u64: 1 }, true)
    ).gasRequired;
    let approveResult = await rmrk
      .withSigner(charlie)
      .tx.approve(marketplace.address, { u64: 1 }, true, {
        gasLimit: getEstimatedGas(approveGas),
      });

    const deployerOriginalBalance = await getBalance(deployer);
    const bobOriginalBalance = await getBalance(bob);
    const charlieOriginalBalance = await getBalance(charlie);

    // Buy token
    const { gasRequired, value } = await marketplace
      .withSigner(bob)
      .query.buy(
        rmrk.address,
        { u64: 1 },
        { value: new BN("100000000000000000") }
      );
    const buyResult = await marketplace.withSigner(bob).tx.buy(
      rmrk.address,
      { u64: 1 },
      {
        gasLimit: getEstimatedGas(gasRequired),
        value: new BN("100000000000000000"),
      }
    );

    expect(buyResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(buyResult, "TokenBought", {
      contract: rmrk.address,
      id: { u64: 1 },
      price: BigInt("100000000000000000"),
      from: charlie.address,
      to: bob.address,
    });

    // Balances check.
    const deployerBalance = await getBalance(deployer);
    const bobBalance = await getBalance(bob);
    const charlieBalance = await getBalance(charlie);

    // Check the marketplace fee receiver balance. ATM all royalties go to deployer.
    expect(
      deployerBalance.eq(
        deployerOriginalBalance.add(new BN("2000000000000000"))
      )
    ).to.be.true;
    // Check seller's balance. Should be increased by price - fees
    expect(charlieBalance.toString()).to.be.equal(
      charlieOriginalBalance.add(new BN("98000000000000000")).toString()
    );
    // Check the token owner.
    expect((await rmrk.query.ownerOf({ u64: 1 })).value.unwrap()).to.equal(
      bob.address
    );
    // Check if allowance is unset.
    expect(
      (
        await rmrk.query.allowance(charlie.address, marketplace.address, {
          u64: 1,
        })
      ).value.ok
    ).to.equal(false);

    // Try to buy the same token again
    const reBuyResult = await marketplace.withSigner(bob).query.buy(
      rmrk.address,
      { u64: 1 },
      {
        gasLimit: getEstimatedGas(gasRequired),
        value: new BN("100000000000000000"),
      }
    );
    expect(reBuyResult.value.unwrap().err.hasOwnProperty("alreadyOwner")).to.be
      .true;
  });

  it("buy NFTSeries works", async () => {
    await setup();
    await mintNFTSeriesToken(charlie);
    await registerNFTSeriesContract(deployer);
    await listNFTSeriesToken(charlie);

    // Charlie approves marketplace to be operator of the token
    const approveGas = (
      await nftSeries
        .withSigner(charlie)
        .query.approve(marketplace.address, { u64: 1 }, true)
    ).gasRequired;
    let approveResult = await nftSeries
      .withSigner(charlie)
      .tx.approve(marketplace.address, { u64: 1 }, true, {
        gasLimit: getEstimatedGas(approveGas),
      });

    const deployerOriginalBalance = await getBalance(deployer);
    const bobOriginalBalance = await getBalance(bob);
    const charlieOriginalBalance = await getBalance(charlie);

    // Buy token
    const { gasRequired, value } = await marketplace
      .withSigner(bob)
      .query.buy(
        nftSeries.address,
        { u64: 1 },
        { value: new BN("100000000000000000") }
      );
    const buyResult = await marketplace.withSigner(bob).tx.buy(
      nftSeries.address,
      { u64: 1 },
      {
        gasLimit: getEstimatedGas(gasRequired),
        value: new BN("100000000000000000"),
      }
    );

    expect(buyResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(buyResult, "TokenBought", {
      contract: nftSeries.address,
      id: { u64: 1 },
      price: BigInt("100000000000000000"),
      from: charlie.address,
      to: bob.address,
    });

    // Balances check.
    const deployerBalance = await getBalance(deployer);
    const bobBalance = await getBalance(bob);
    const charlieBalance = await getBalance(charlie);

    // Check the marketplace fee receiver balance. ATM all royalties go to deployer.
    expect(
      deployerBalance.eq(
        deployerOriginalBalance.add(new BN("1000000000000000"))
      )
    ).to.be.true;
    // Check seller's balance. Should be increased by price - fees
    expect(charlieBalance.toString()).to.be.equal(
      charlieOriginalBalance.add(new BN("99000000000000000")).toString()
    );
    // Check the token owner.
    expect((await nftSeries.query.ownerOf({ u64: 1 })).value.unwrap()).to.equal(
      bob.address
    );
    // Check if allowance is unset.
    expect(
      (
        await nftSeries.query.allowance(charlie.address, marketplace.address, {
          u64: 1,
        })
      ).value.ok
    ).to.equal(false);

    // Try to buy the same token again
    const reBuyResult = await marketplace.withSigner(bob).query.buy(
      nftSeries.address,
      { u64: 1 },
      {
        gasLimit: getEstimatedGas(gasRequired),
        value: new BN("100000000000000000"),
      }
    );
    expect(reBuyResult.value.unwrap().err.hasOwnProperty("alreadyOwner")).to.be
      .true;
  });

  it("setNftContractHash works", async () => {
    await setup();
    await registerContract(deployer);
    const hash = string2ascii("h".repeat(32));

    const gas = (
      await marketplace
        .withSigner(deployer)
        .query.setNftContractHash(NftContractType.psp34, hash)
    ).gasRequired;
    await marketplace
      .withSigner(deployer)
      .tx.setNftContractHash(NftContractType.psp34, hash, {
        gasLimit: getEstimatedGas(gas),
      });

    const hashValue = await marketplace.query.nftContractHash(
      NftContractType.psp34
    );
    expect(hashValue.value.unwrap()).to.be.equal(toHex(hash));
  });

  it("setNftContractHash fails if not an owner", async () => {
    await setup();
    await registerContract(deployer);
    const hash = string2ascii("h".repeat(32));

    const gas = (
      await marketplace
        .withSigner(bob)
        .query.setNftContractHash(NftContractType.rmrk, hash)
    ).gasRequired;
    const result = await marketplace
      .withSigner(bob)
      .query.setNftContractHash(NftContractType.rmrk, hash, {
        gasLimit: getEstimatedGas(gas),
      });

    expect(result.value.unwrap().err.ownableError).to.equal("CallerIsNotOwner");
  });

  it("deposit works", async () => {
    await setup();
    const marketplaceOriginalBalance = await getBalanceByAddress(
      marketplace.address
    );

    // deposit
    const { gasRequired } = await marketplace.withSigner(bob).query.deposit();
    const result = await marketplace.withSigner(bob).tx.deposit({
      gasLimit: getEstimatedGas(gasRequired),
      value: "100000000000000000",
    });

    expect(result.result.isError).to.be.false;
    const marketplaceAfterBalance = await getBalanceByAddress(
      marketplace.address
    );

    const { value: depositValue } = await marketplace
      .withSigner(bob)
      .query.getDeposit(bob.address);

    expect(marketplaceAfterBalance.toString()).to.be.equal(
      marketplaceOriginalBalance.add(new BN("100000000000000000")).toString()
    );

    expect(depositValue.ok.toString()).to.be.equal("100000000000000000");
  });

  it("Make offer works", async () => {
    await setup();

    const marketplaceOriginalBalance = await getBalanceByAddress(
      marketplace.address
    );

    // deposit
    const { gasRequired } = await marketplace.withSigner(bob).query.deposit();
    await marketplace.withSigner(bob).tx.deposit({
      gasLimit: getEstimatedGas(gasRequired),
      value: "100000000000000000",
    });
    await marketplace.withSigner(deployer).tx.deposit({
      gasLimit: getEstimatedGas(gasRequired),
      value: 5000,
    });

    const { gasRequired: gasMakeOffer } = await marketplace
      .withSigner(bob)
      .query.makeOffer(
        psp34.address,
        { u64: 1 },
        1,
        new BN("100000000000000000"),
        [""]
      );

    await marketplace
      .withSigner(bob)
      .tx.makeOffer(
        psp34.address,
        { u64: 1 },
        1,
        new BN("100000000000000000"),
        [""]
      );

    await marketplace
      .withSigner(deployer)
      .tx.makeOffer(psp34.address, { u64: 1 }, 1, new BN("5000"), [""]);

    const { value: resultFirst } = await marketplace
      .withSigner(bob)
      .query.getOfferActive(1);

    const { value: resultSecond } = await marketplace
      .withSigner(deployer)
      .query.getOfferActive(2);

    const { value: offerIds } = await marketplace
      .withSigner(deployer)
      .query.getOfferForToken(psp34.address, { u64: 1 });

    expect(offerIds.ok.ok[0].toNumber()).to.be.eq(1);
    expect(offerIds.ok.ok[1].toNumber()).to.be.eq(2);
    expect(resultFirst.ok).to.be.true;
    expect(resultSecond.ok).to.be.true;
  });

  it("Make offer error if balance not sufficient", async () => {
    await setup();

    const { gasRequired, value } = await marketplace
      .withSigner(bob)
      .query.makeOffer(
        psp34.address,
        { u64: 1 },
        1,
        new BN("10000000000000000000000000000000"),
        [""]
      );
    expect(value.ok.err?.hasOwnProperty("balanceInsufficient")).to.be.true;
  });

  it("Cancel offer works", async () => {
    await setup();

    // deposit
    const { gasRequired } = await marketplace.withSigner(bob).query.deposit();
    await marketplace.withSigner(bob).tx.deposit({
      gasLimit: getEstimatedGas(gasRequired),
      value: "100000000000000000",
    });

    await marketplace
      .withSigner(bob)
      .tx.makeOffer(
        psp34.address,
        { u64: 1 },
        1,
        new BN("100000000000000000"),
        [""]
      );

    await marketplace.withSigner(bob).tx.cancelOffer(1);
    const { value: resultFirst } = await marketplace
      .withSigner(bob)
      .query.getOfferActive(1);

    const { value: offerIds } = await marketplace
      .withSigner(deployer)
      .query.getOfferForToken(psp34.address, { u64: 1 });

    expect(resultFirst.ok).to.be.false;
    expect(offerIds.ok.ok.length).to.be.eq(0);
  });

  it("Cancel offer not work if not bidder", async () => {
    await setup();

    // deposit
    const { gasRequired } = await marketplace.withSigner(bob).query.deposit();
    await marketplace.withSigner(bob).tx.deposit({
      gasLimit: getEstimatedGas(gasRequired),
      value: "100000000000000000",
    });

    await marketplace
      .withSigner(bob)
      .tx.makeOffer(
        psp34.address,
        { u64: 1 },
        1,
        new BN("100000000000000000"),
        [""]
      );

    const { value } = await marketplace
      .withSigner(deployer)
      .query.cancelOffer(1);

    expect(value.ok.err?.hasOwnProperty("notOwner")).to.be.true;
  });

  it("withdraw works", async () => {
    await setup();
    const marketplaceOriginalBalance = await getBalanceByAddress(
      marketplace.address
    );

    // deposit
    const { gasRequired } = await marketplace.withSigner(bob).query.deposit();
    await marketplace.withSigner(bob).tx.deposit({
      gasLimit: getEstimatedGas(gasRequired),
      value: "100000000000000000",
    });

    const { gasRequired: gasRequiredForWithdraw } = await marketplace
      .withSigner(bob)
      .query.withdraw("100000000000000000");
    const result = await marketplace
      .withSigner(bob)
      .tx.withdraw("100000000000000000", {
        gasLimit: getEstimatedGas(gasRequiredForWithdraw),
      });

    expect(result.result.isError).to.be.false;

    const marketplaceAfterBalance = await getBalanceByAddress(
      marketplace.address
    );

    expect(marketplaceOriginalBalance.toString()).to.be.equal(
      marketplaceAfterBalance.toString()
    );
  });

  it("Withdraw invalidates offer", async () => {
    await setup();

    // deposit
    const { gasRequired } = await marketplace.withSigner(bob).query.deposit();
    await marketplace.withSigner(bob).tx.deposit({
      gasLimit: getEstimatedGas(gasRequired),
      value: "100000000000000000",
    });

    await marketplace
      .withSigner(bob)
      .tx.makeOffer(
        psp34.address,
        { u64: 1 },
        1,
        new BN("100000000000000000"),
        [""]
      );

    const { gasRequired: gasRequiredForWithdraw } = await marketplace
      .withSigner(bob)
      .query.withdraw("100000000000000000");

    await marketplace.withSigner(bob).tx.withdraw("100000000000000000", {
      gasLimit: getEstimatedGas(gasRequiredForWithdraw),
    });

    const { value } = await marketplace.withSigner(bob).query.getOfferActive(1);

    expect(value.ok).to.be.false;
  });

  it("Accept offer works", async () => {
    await setup();
    await mintToken(charlie);
    await registerContract(deployer);

    // bob make offer
    const { gasRequired: gasForDeposit } = await marketplace
      .withSigner(bob)
      .query.deposit();
    await marketplace.withSigner(bob).tx.deposit({
      gasLimit: getEstimatedGas(gasForDeposit),
      value: "100000000000000000",
    });

    await marketplace
      .withSigner(bob)
      .tx.makeOffer(
        psp34.address,
        { u64: 1 },
        1,
        new BN("100000000000000000"),
        [""]
      );

    // Charlie approves marketplace to be operator of the token
    const approveGas = (
      await psp34
        .withSigner(charlie)
        .query.approve(marketplace.address, { u64: 1 }, true)
    ).gasRequired;
    let approveResult = await psp34
      .withSigner(charlie)
      .tx.approve(marketplace.address, { u64: 1 }, true, {
        gasLimit: getEstimatedGas(approveGas),
      });

    const deployerOriginalBalance = await getBalance(deployer);
    const bobOriginalBalance = await getBalance(bob);
    const charlieOriginalBalance = await getBalance(charlie);

    // Accept token
    const { gasRequired, value } = await marketplace
      .withSigner(charlie)
      .query.acceptOffer(1, { u64: 1 });
    const buyResult = await marketplace.withSigner(charlie).tx.acceptOffer(
      1,
      { u64: 1 },
      {
        gasLimit: getEstimatedGas(gasRequired),
      }
    );

    expect(buyResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(buyResult, "TokenBought", {
      contract: psp34.address,
      id: { u64: 1 },
      price: BigInt("100000000000000000"),
      from: charlie.address,
      to: bob.address,
    });

    // Balances check.
    const deployerBalance = await getBalance(deployer);
    const bobBalance = await getBalance(bob);
    const charlieBalance = await getBalance(charlie);

    // Check the marketplace fee receiver balance. ATM all royalties go to deployer.
    expect(
      deployerBalance.eq(
        deployerOriginalBalance.add(new BN("2000000000000000"))
      )
    ).to.be.true;

    // // Check seller's balance. Should be increased by price - fees
    const deltaCharLieBalance = charlieBalance.sub(charlieOriginalBalance);
    expect(deltaCharLieBalance.gte(new BN("98000000000000000"))).to.be.true;
    // Check the token owner.
    expect((await psp34.query.ownerOf({ u64: 1 })).value.unwrap()).to.equal(
      bob.address
    );
    // Check if allowance is unset.
    expect(
      (
        await psp34.query.allowance(charlie.address, marketplace.address, {
          u64: 1,
        })
      ).value.ok
    ).to.equal(false);

    expect(
      (await marketplace.query.getDeposit(bob.address)).value.ok.toNumber()
    ).to.be.eq(0);

    // Try to accept the same token again
    const reBuyResult = await marketplace
      .withSigner(bob)
      .query.acceptOffer(1, { u64: 1 });
    expect(reBuyResult.value.ok.err.hasOwnProperty("offerDoesNotExist")).to.be
      .true;
  });

  // Helper function to mint a token.
  async function mintToken(signer: KeyringPair): Promise<void> {
    const { gasRequired } = await psp34
      .withSigner(signer)
      .query.mint(signer.address, { u64: 1 });
    const mintResult = await psp34
      .withSigner(signer)
      .tx.mint(
        signer.address,
        { u64: 1 },
        { gasLimit: getEstimatedGas(gasRequired) }
      );
    expect(mintResult.result?.isError).to.be.false;
    expect((await psp34.query.ownerOf({ u64: 1 })).value.unwrap()).to.equal(
      signer.address
    );
  }

  // Helper function to mint a RMRK token.
  async function mintRmrkToken(signer: KeyringPair): Promise<void> {
    const { gasRequired } = await rmrk.withSigner(signer).query.mint({
      value: BigInt(1),
    });
    const mintResult = await rmrk
      .withSigner(signer)
      .tx.mint({ gasLimit: getEstimatedGas(gasRequired), value: BigInt(1) });
    expect(mintResult.result?.isError).to.be.false;
    expect((await rmrk.query.ownerOf({ u64: 1 })).value.unwrap()).to.equal(
      signer.address
    );
  }

  // Helper function to mint a NFT Series token.
  async function mintNFTSeriesToken(signer: KeyringPair): Promise<void> {
    // create collection
    const { gasRequired } = await nftSeries
      .withSigner(signer)
      .query.nftCreateCollection(null, null, null, null, null, null, {});

    await nftSeries
      .withSigner(signer)
      .tx.nftCreateCollection(null, null, null, null, null, null, {
        gasLimit: getEstimatedGas(gasRequired),
      });

    const { gasRequired: gasRequiredForCreateNFTSeries } = await nftSeries
      .withSigner(signer)
      .query.nftCreateSeries(
        1,
        "ipfs://BASE",
        null,
        1000,
        [[signer.address, 100]],
        true
      );

    await nftSeries
      .withSigner(signer)
      .tx.nftCreateSeries(
        1,
        "ipfs://BASE",
        null,
        1000,
        [[signer.address, 100]],
        true,
        {
          gasLimit: getEstimatedGas(gasRequiredForCreateNFTSeries),
        }
      );

    // mint token
    const { gasRequired: gasForMint, value } = await nftSeries
      .withSigner(signer)
      .query.nftMint(1, signer.address);

    await nftSeries
      .withSigner(signer)
      .tx.nftMint(1, signer.address, { gasLimit: gasForMint });

    expect((await nftSeries.query.ownerOf({ u64: 1 })).value.ok).to.equal(
      signer.address
    );
  }

  // Helper function to register contract.
  async function registerContract(signer: KeyringPair) {
    const { gasRequired, value } = await marketplace
      .withSigner(signer)
      .query.register(
        psp34.address,
        signer.address,
        100,
        NftContractType.psp34
      );
    const registerResult = await marketplace
      .withSigner(signer)
      .tx.register(psp34.address, signer.address, 100, NftContractType.psp34, {
        gasLimit: getEstimatedGas(gasRequired),
      });
    expect(registerResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(registerResult, "CollectionRegistered", {
      contract: psp34.address,
    });
  }

  // Helper function to register RMRK contract.
  async function registerRmrkContract(signer: KeyringPair) {
    const { gasRequired } = await marketplace
      .withSigner(signer)
      .query.register(rmrk.address, signer.address, 100, NftContractType.rmrk);
    const registerResult = await marketplace
      .withSigner(signer)
      .tx.register(rmrk.address, signer.address, 100, NftContractType.rmrk, {
        gasLimit: getEstimatedGas(gasRequired),
      });
    expect(registerResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(registerResult, "CollectionRegistered", {
      contract: rmrk.address,
    });
  }

  // Helper function to register RMRK contract.
  async function registerNFTSeriesContract(signer: KeyringPair) {
    const { gasRequired } = await marketplace
      .withSigner(signer)
      .query.register(nftSeries.address, null, null, NftContractType.nftSeries);
    const registerResult = await marketplace
      .withSigner(signer)
      .tx.register(nftSeries.address, null, null, NftContractType.nftSeries, {
        gasLimit: getEstimatedGas(gasRequired),
      });
    expect(registerResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(registerResult, "CollectionRegistered", {
      contract: nftSeries.address,
    });
  }

  // Helper function to list token for sale.
  async function listToken(signer: KeyringPair) {
    const { gasRequired: gasRequiredApprove } = await psp34
      .withSigner(signer)
      .query.approve(marketplace.address, { u64: 1 }, true);

    await psp34
      .withSigner(signer)
      .tx.approve(marketplace.address, { u64: 1 }, true, {
        gasLimit: getEstimatedGas(gasRequiredApprove),
      });

    const { gasRequired } = await marketplace
      .withSigner(signer)
      .query.list(psp34.address, { u64: 1 }, "100000000000000000");
    const listResult = await marketplace
      .withSigner(signer)
      .tx.list(psp34.address, { u64: 1 }, "100000000000000000", {
        gasLimit: getEstimatedGas(gasRequired),
      });
    expect(listResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(listResult, "TokenListed", {
      contract: psp34.address,
      id: { u64: 1 },
      price: BigInt("100000000000000000"),
    });
  }

  // Helper function to list RMRK token for sale.
  async function listRmrkToken(signer: KeyringPair) {
    const { gasRequired: gasRequiredApprove } = await rmrk
      .withSigner(signer)
      .query.approve(marketplace.address, { u64: 1 }, true);

    await rmrk
      .withSigner(signer)
      .tx.approve(marketplace.address, { u64: 1 }, true, {
        gasLimit: getEstimatedGas(gasRequiredApprove),
      });

    const { gasRequired } = await marketplace
      .withSigner(signer)
      .query.list(rmrk.address, { u64: 1 }, "100000000000000000");
    const listResult = await marketplace
      .withSigner(signer)
      .tx.list(rmrk.address, { u64: 1 }, "100000000000000000", {
        gasLimit: getEstimatedGas(gasRequired),
      });
    expect(listResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(listResult, "TokenListed", {
      contract: rmrk.address,
      id: { u64: 1 },
      price: BigInt("100000000000000000"),
    });
  }

  // Helper function to list NFT Series token for sale.
  async function listNFTSeriesToken(signer: KeyringPair) {
    const { gasRequired: gasRequiredApprove } = await nftSeries
      .withSigner(signer)
      .query.approve(marketplace.address, { u64: 1 }, true);

    await nftSeries
      .withSigner(signer)
      .tx.approve(marketplace.address, { u64: 1 }, true, {
        gasLimit: getEstimatedGas(gasRequiredApprove),
      });

    const { gasRequired } = await marketplace
      .withSigner(signer)
      .query.list(nftSeries.address, { u64: 1 }, "100000000000000000");
    const listResult = await marketplace
      .withSigner(signer)
      .tx.list(nftSeries.address, { u64: 1 }, "100000000000000000", {
        gasLimit: getEstimatedGas(gasRequired),
      });
    expect(listResult.result?.isError).to.be.false;
    checkIfEventIsEmitted(listResult, "TokenListed", {
      contract: nftSeries.address,
      id: { u64: 1 },
      price: BigInt("100000000000000000"),
    });
  }

  // Helper function to get account balance
  async function getBalance(account: KeyringPair) {
    const balances = await api.query.system.account<FrameSystemAccountInfo>(
      account.address
    );

    return balances.data.free;
  }

  async function getBalanceByAddress(address: String) {
    const balances = await api.query.system.account<FrameSystemAccountInfo>(
      address
    );

    return balances.data.free;
  }

  function getEstimatedGas(gasRequired: Weight): WeightV2 {
    // For some reason Typechain returns wrong type Weigh, although under the hood
    // WeightV2 structure is stored
    const gasRequiredV2 = gasRequired as unknown as WeightV2;
    return api.registry.createType("WeightV2", {
      refTime: gasRequiredV2.refTime.toBn().muln(2),
      proofSize: gasRequiredV2.proofSize.toBn().muln(2),
    }) as WeightV2;
  }
});

// Helper function to parse Events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkIfEventIsEmitted(
  result: { events?: any },
  name: string,
  args: any
): void {
  const event = result.events.find(
    (event: { name: string }) => event.name === name
  );
  for (const key of Object.keys(event.args)) {
    if (event.args[key] instanceof ReturnNumber || key == "price") {
      if (event.args[key]) event.args[key] = BigInt(event.args[key]);
    }
  }
  expect(event).eql({ name, args });
}

// Helper function to get ASCII array from string.
function string2ascii(inputString: string): number[] {
  let result: number[] = [];
  for (var i = 0; i < inputString.length; i++) {
    result.push(inputString[i].charCodeAt(0));
  }

  return result;
}

// Helper function to get hex string from ASCII array.
function toHex(ascii: number[]): string {
  return "0x" + Buffer.from(ascii).toString("hex");
}
