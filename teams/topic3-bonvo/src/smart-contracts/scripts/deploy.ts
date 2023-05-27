import { ethers, run } from 'hardhat';
import {
  BonvoBadge,
  BonvoExperienceDeployerHelper,
  BonvoExperiencesCollection,
  BonvoPlatform,
  BonvoProperty,
  BonvoToken,
  BonvoUserReputation,
} from '../typechain-types';

const ADD_PROPERTY_FEE = ethers.utils.parseEther('10');
const REGISTER_FEE = ethers.utils.parseEther('1');
const PLATFORM_FEE_BPS = 500; // 5%

async function main() {
  await deployContracts();
}

async function deployContracts(): Promise<void> {
  console.log('Deploying smart contracts');
  const [deployer] = await ethers.getSigners();

  const tokenFactory = await ethers.getContractFactory('BonvoToken');
  const token = <BonvoToken>tokenFactory.attach('0x7B9B40908ce6B559227B7FC9752B2b2CA5abe48b');
  // const token = <BonvoToken>await tokenFactory.deploy();
  // await token.deployed();
  // console.log('Deployed token');
  // await token.mint(deployer.address, ethers.utils.parseEther('10000')); // Stoic
  // await token.mint('0x2a0E2DEc635E178D1560B95a31386109c3700Fec', ethers.utils.parseEther('10000')); // BETAX
  // await token.mint('0x95a2BADb990aAc347C0BfBDb3B93A25A10864778', ethers.utils.parseEther('10000')); // MAT
  // await token.mint('0xCb81A5E01Ab29F224DF0AA25D103F888dF32934e', ethers.utils.parseEther('10000')); // SUKU
  // await token.mint('0xc586Fcc510eb49f59De8261Ea550f4A59534b1Ec', ethers.utils.parseEther('10000')); // TINCHO 1
  // await token.mint('0xe2155b4CAe66142853F730aA485E7E88E6860af9', ethers.utils.parseEther('10000')); // TINCHO 2

  const badgeFactory = await ethers.getContractFactory('BonvoBadge');
  const badgeArgs = [
    ethers.constants.MaxUint256,
    'ipfs://collectionMetadata',
    'ipfs://baseTokenURI',
    ethers.constants.AddressZero,
  ];
  const badge = <BonvoBadge>await badgeFactory.deploy(...badgeArgs);
  await badge.deployed();

  const propertyFactory = await ethers.getContractFactory('BonvoProperty');
  const propertyArgs = [
    ethers.constants.MaxUint256,
    'ipfs://collectionMetadata',
    ethers.constants.AddressZero,
    badge.address,
  ];
  const property = <BonvoProperty>await propertyFactory.deploy(...propertyArgs);
  await property.deployed();
  console.log('Deployed property');

  const userReputationFactory = await ethers.getContractFactory('BonvoUserReputation');
  const userReputationArgs = [
    ethers.constants.MaxUint256,
    'ipfs://collectionMetadata',
    ethers.constants.AddressZero,
    badge.address,
  ];
  const userReputation = <BonvoUserReputation>(
    await userReputationFactory.deploy(...userReputationArgs)
  );
  await userReputation.deployed();
  console.log('Deployed userReputation');

  const platformFactory = await ethers.getContractFactory('BonvoPlatform');
  const platformArgs = [
    token.address,
    property.address,
    userReputation.address,
    badge.address,
    ADD_PROPERTY_FEE,
    REGISTER_FEE,
    PLATFORM_FEE_BPS,
    deployer.address,
  ];
  const platform = <BonvoPlatform>await platformFactory.deploy(...platformArgs);
  await platform.deployed();
  console.log('Deployed escrow');

  await property.setPlatform(platform.address);
  await userReputation.setPlatform(platform.address);
  await badge.setPlatform(platform.address);

  const experiencesCollectionArgs = [
    ethers.constants.MaxUint256,
    'ipfs://collectionMetadata',
    platform.address,
    badge.address,
  ];
  const bonvoExperiencesCollectionFactory = await ethers.getContractFactory(
    'BonvoExperiencesCollection',
  );
  const bonvoExperiencesCollection = <BonvoExperiencesCollection>(
    await bonvoExperiencesCollectionFactory.deploy(...experiencesCollectionArgs)
  );
  await bonvoExperiencesCollection.deployed();

  const bonvoExperienceDeployerHelperFactory = await ethers.getContractFactory(
    'BonvoExperienceDeployerHelper',
  );
  const bonvoExperienceDeployerHelper = <BonvoExperienceDeployerHelper>(
    await bonvoExperienceDeployerHelperFactory.deploy(platform.address)
  );
  await bonvoExperienceDeployerHelper.deployed();

  await platform.setExperiencesContracts(
    bonvoExperiencesCollection.address,
    bonvoExperienceDeployerHelper.address,
  );

  console.log(`Plaform contract deployed to ${platform.address}`);
  console.log(`Property contract deployed to ${property.address}`);
  console.log(`UserReputation contract deployed to ${userReputation.address}`);
  console.log(`Badge contract deployed to ${badge.address}`);
  console.log(`Token contract deployed to ${token.address}`);
  console.log(
    `BonvoExperiencesCollection contract deployed to ${bonvoExperiencesCollection.address}`,
  );
  console.log(
    `BonvoExperienceDeployerHelper contract deployed to ${bonvoExperienceDeployerHelper.address}`,
  );

  console.log('Verification started');

  try {
    await run(`verify:verify`, {
      address: token.address,
      constructorArguments: [],
    });
    console.log('Verified token');
  } catch (error) {
    console.log(error);
  }

  try {
    await run(`verify:verify`, {
      address: property.address,
      constructorArguments: propertyArgs,
    });
    console.log('Verified property');
  } catch (error) {
    console.log(error);
  }

  try {
    await run(`verify:verify`, {
      address: userReputation.address,
      constructorArguments: userReputationArgs,
    });
    console.log('Verified userReputation');
  } catch (error) {
    console.log(error);
  }

  try {
    await run(`verify:verify`, {
      address: badge.address,
      constructorArguments: badgeArgs,
    });
    console.log('Verified badge');
  } catch (error) {
    console.log(error);
  }

  try {
    await run(`verify:verify`, {
      address: platform.address,
      constructorArguments: platformArgs,
    });
  } catch (error) {
    console.log(error);
  }

  try {
    await run(`verify:verify`, {
      address: bonvoExperiencesCollection.address,
      constructorArguments: [
        ethers.constants.MaxUint256,
        'ipfs://collectionMetadata',
        platform.address,
        badge.address,
      ],
    });
    console.log('Verified bonvoExperiencesCollection');
  } catch (error) {
    console.log(error);
  }

  try {
    await run(`verify:verify`, {
      address: bonvoExperienceDeployerHelper.address,
      constructorArguments: [platform.address],
    });
    console.log('Verified bonvoExperienceDeployerHelper');
  } catch (error) {
    console.log(error);
  }

  console.log('Verification completed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
