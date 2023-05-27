import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import {
  BonvoBadge,
  BonvoPlatform,
  BonvoProperty,
  BonvoToken,
  BonvoUserReputation,
} from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';

const ADD_PROPERTY_FEE = ethers.utils.parseEther('10');
const REGISTER_FEE = ethers.utils.parseEther('1');
const PLATFORM_FEE_BPS = 500; // 5%

async function fixture(): Promise<{
  escrow: BonvoPlatform;
  property: BonvoProperty;
  userReputation: BonvoUserReputation;
  badge: BonvoBadge;
  token: BonvoToken;
}> {
  const [deployer] = await ethers.getSigners();

  const tokenFactory = await ethers.getContractFactory('BonvoToken');
  const token = <BonvoToken>await tokenFactory.deploy();
  await token.deployed();

  const badgeFactory = await ethers.getContractFactory('BonvoBadge');
  const badge = <BonvoBadge>(
    await badgeFactory.deploy(
      ethers.constants.MaxUint256,
      'ipfs://collectionMetadata',
      'ipfs://baseTokenURI',
      ethers.constants.AddressZero,
    )
  );
  await badge.deployed();

  const propertyFactory = await ethers.getContractFactory('BonvoProperty');
  const property = <BonvoProperty>(
    await propertyFactory.deploy(
      ethers.constants.MaxUint256,
      'ipfs://collectionMetadata',
      ethers.constants.AddressZero,
      badge.address,
    )
  );
  await property.deployed();

  const userReputationFactory = await ethers.getContractFactory('BonvoUserReputation');
  const userReputation = <BonvoUserReputation>(
    await userReputationFactory.deploy(
      ethers.constants.MaxUint256,
      'ipfs://collectionMetadata',
      ethers.constants.AddressZero,
      badge.address,
    )
  );
  await userReputation.deployed();

  const escrowFactory = await ethers.getContractFactory('BonvoPlatform');
  const escrow = <BonvoPlatform>(
    await escrowFactory.deploy(
      token.address,
      property.address,
      userReputation.address,
      badge.address,
      ADD_PROPERTY_FEE,
      REGISTER_FEE,
      PLATFORM_FEE_BPS,
      deployer.address,
    )
  );
  await escrow.deployed();

  await property.setPlatform(escrow.address);
  await userReputation.setPlatform(escrow.address);
  await badge.setPlatform(escrow.address);

  return { escrow, property, userReputation, badge, token };
}

describe('Bonvo', async () => {
  let escrow: BonvoPlatform;
  let property: BonvoProperty;
  let userReputation: BonvoUserReputation;
  let badge: BonvoBadge;
  let token: BonvoToken;
  let deployer: SignerWithAddress;
  let landlord: SignerWithAddress;
  let tenant: SignerWithAddress;

  beforeEach(async function () {
    [deployer, landlord, tenant] = await ethers.getSigners();
    ({ escrow, property, userReputation, badge, token } = await loadFixture(fixture));
  });

  it('can get names and symbols', async function () {
    expect(await property.name()).to.equal('BonvoProperty');
    expect(await property.symbol()).to.equal('BP');
  });

  it('can register', async function () {
    await token.mint(landlord.address, REGISTER_FEE);
    await token.connect(landlord).approve(escrow.address, REGISTER_FEE);
    await expect(escrow.connect(landlord).registerUser('ipfs://userMetadata'))
      .to.emit(userReputation, 'Transfer')
      .withArgs(ethers.constants.AddressZero, landlord.address, 1);
    expect(await userReputation.tokenURI(1)).to.eql('ipfs://userMetadata');
  });

  describe('With registered users', async () => {
    beforeEach(async function () {
      await token.mint(landlord.address, REGISTER_FEE);
      await token.connect(landlord).approve(escrow.address, REGISTER_FEE);
      await escrow.connect(landlord).registerUser('ipfs://userMetadataA');

      await token.mint(tenant.address, REGISTER_FEE);
      await token.connect(tenant).approve(escrow.address, REGISTER_FEE);
      await escrow.connect(tenant).registerUser('ipfs://userMetadataB');
    });

    it('can add property', async function () {
      await token.mint(landlord.address, ADD_PROPERTY_FEE);
      await token.connect(landlord).approve(escrow.address, ADD_PROPERTY_FEE);
      await expect(escrow.connect(landlord).addProperty('ipfs://propertyMetadata'))
        .to.emit(property, 'Transfer')
        .withArgs(ethers.constants.AddressZero, landlord.address, 1);

      expect(await property.ownerOf(1)).to.equal(landlord.address);
    });

    describe('With added properties', async () => {
      let propertyId: BigNumber;
      beforeEach(async function () {
        await token.mint(landlord.address, ADD_PROPERTY_FEE);
        await token.connect(landlord).approve(escrow.address, ADD_PROPERTY_FEE);
        await escrow.connect(landlord).addProperty('ipfs://propertyMetadata');
        propertyId = await property.totalSupply();
      });

      it('can add images', async function () {
        await property
          .connect(landlord)
          .addImagesToProperty(propertyId, [
            'ipfs://image1.png',
            'ipfs://image2.png',
            'ipfs://image3.png',
          ]);
        expect(await property.getActiveAssets(propertyId)).to.eql([bn(1), bn(2), bn(3)]);
      });

      it('can list property', async function () {
        const pricePerDay = ethers.utils.parseEther('100');
        const deposit = ethers.utils.parseEther('300');
        await escrow.connect(landlord).listProperty(propertyId, pricePerDay, deposit);
        expect(await escrow.getListing(propertyId)).to.eql([
          pricePerDay,
          deposit,
          landlord.address,
        ]);
      });

      describe('With listed properties with images', async () => {
        let propertyId2: BigNumber;
        const pricePerDay1 = ethers.utils.parseEther('100');
        const deposit1 = ethers.utils.parseEther('300');
        const pricePerDay2 = ethers.utils.parseEther('200');
        const deposit2 = ethers.utils.parseEther('600');

        beforeEach(async function () {
          // Create a second property:
          await token.mint(landlord.address, ADD_PROPERTY_FEE);
          await token.connect(landlord).approve(escrow.address, ADD_PROPERTY_FEE);
          await escrow.connect(landlord).addProperty('ipfs://propertyMetadata2');
          propertyId2 = await property.totalSupply();

          // list both
          await escrow.connect(landlord).listProperty(propertyId, pricePerDay1, deposit1);
          await escrow.connect(landlord).listProperty(propertyId2, pricePerDay2, deposit2);

          // Add images to both
          await property
            .connect(landlord)
            .addImagesToProperty(propertyId, [
              'ipfs://image1.png',
              'ipfs://image2.png',
              'ipfs://image3.png',
            ]);
          await property
            .connect(landlord)
            .addImagesToProperty(propertyId2, ['ipfs://photo1.png', 'ipfs://photo2.png']);
        });

        it('can get listings', async function () {
          const listings = await escrow.getAllListings();
          expect(listings).to.eql([
            [propertyId, 'ipfs://propertyMetadata', pricePerDay1, deposit1, landlord.address],
            [propertyId2, 'ipfs://propertyMetadata2', pricePerDay2, deposit2, landlord.address],
          ]);
        });

        it('can book property', async function () {
          const startDate = new Date();
          startDate.setUTCHours(0, 0, 0, 0);
          const startDateBn = bn(Math.floor(startDate.getTime() / 1000));
          const dates = [
            startDateBn,
            startDateBn.add(24 * 60 * 60),
            startDateBn.add(2 * 24 * 60 * 60),
          ];
          await token.mint(tenant.address, pricePerDay1.mul(3).add(deposit1));
          await token.connect(tenant).approve(escrow.address, pricePerDay1.mul(3).add(deposit1));
          await escrow.connect(tenant).book(propertyId, dates);
          const bookingId = await escrow.getTotalBookings();

          expect(await escrow.getBooking(bookingId)).to.eql([
            bookingId,
            propertyId,
            dates,
            pricePerDay1.mul(3),
            deposit1,
            tenant.address,
            landlord.address,
          ]);
        });

        describe('With booked property', async () => {
          let bookingId: BigNumber;
          let dates: BigNumber[];

          beforeEach(async function () {
            const startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            const startDateBn = bn(Math.floor(startDate.getTime() / 1000));
            dates = [startDateBn, startDateBn.add(24 * 60 * 60), startDateBn.add(2 * 24 * 60 * 60)];
            await token.mint(tenant.address, pricePerDay1.mul(3).add(deposit1));
            await token.connect(tenant).approve(escrow.address, pricePerDay1.mul(3).add(deposit1));
            await escrow.connect(tenant).book(propertyId, dates);
            bookingId = await escrow.getTotalBookings();
          });

          it('can get bookings for tenant', async function () {
            expect(await escrow.getBookingsForTenant(tenant.address)).to.eql([
              [
                bookingId,
                propertyId,
                dates,
                pricePerDay1.mul(3),
                deposit1,
                tenant.address,
                landlord.address,
              ],
            ]);
          });

          it('can get finish booking', async function () {
            await time.increase(4 * 24 * 60 * 60); // 4 days later
            const initialBeneficiaryBalance = await token.balanceOf(deployer.address);

            await escrow.connect(tenant).confirmRentalAsTenant(bookingId);
            await escrow.connect(landlord).confirmRentalAsLandlord(bookingId);
            const platformFee = pricePerDay1.mul(3).mul(PLATFORM_FEE_BPS).div(10000);
            // Tenant got deposit back
            expect(await token.balanceOf(tenant.address)).to.equal(deposit1);
            // Landlord got the rest
            expect(await token.balanceOf(landlord.address)).to.equal(
              pricePerDay1.mul(3).sub(platformFee),
            );
            // Beneficiary got platform fee
            expect(await token.balanceOf(deployer.address)).to.equal(
              initialBeneficiaryBalance.add(platformFee),
            );
          });

          describe('With finished booking', async () => {
            beforeEach(async function () {
              await time.increase(4 * 24 * 60 * 60); // 4 days later
              await escrow.connect(tenant).confirmRentalAsTenant(bookingId);
              await escrow.connect(landlord).confirmRentalAsLandlord(bookingId);
            });

            it('can add badges', async function () {
              await escrow.connect(tenant).giveBadgeToProperty(bookingId, 3); // Clean property
              await escrow.connect(tenant).giveBadgeToLandlord(bookingId, 1); // Friendly landlord
              await escrow.connect(landlord).giveBadgeToTenant(bookingId, 2); // Punctual tenant

              expect(await property.getAllInfo(propertyId)).to.eql([
                'ipfs://propertyMetadata',
                ['ipfs://image1.png', 'ipfs://image2.png', 'ipfs://image3.png'],
                bn(0), // friendly medals
                bn(0), // puntual medals
                bn(1), // clean medals
                bn(0), // comfy medals
                bn(0), // good location medals
              ]);

              const landlordReputationId = await userReputation.getTokenIdForAddress(
                landlord.address,
              );
              expect(await userReputation.getMedals(landlordReputationId)).to.eql([
                bn(1), // friendly medals
                bn(0), // puntual medals
                bn(0), // clean medals
                bn(0), // comfy medals
                bn(0), // good location medals
              ]);
              const tenantReputationId = await userReputation.getTokenIdForAddress(tenant.address);
              expect(await userReputation.getMedals(tenantReputationId)).to.eql([
                bn(0), // friendly medals
                bn(1), // puntual medals
                bn(0), // clean medals
                bn(0), // comfy medals
                bn(0), // good location medals
              ]);
            });
          });
        });
      });
    });
  });
});

function bn(x: number): BigNumber {
  return BigNumber.from(x);
}
