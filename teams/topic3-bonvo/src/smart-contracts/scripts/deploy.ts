import { ethers, run } from 'hardhat';
import { BonvoBadge, BonvoUserReputation, BonvoExperienceDeployer, BonvoExperienceDeployerHelper, BonvoExperience } from '../typechain-types';

async function main() {
  await deployContracts();
}

async function deployContracts(): Promise<void> {
  console.log('Deploying smart simple equippable contract');

  const badgesFactory = await ethers.getContractFactory('BonvoBadge');
  const experienceDeployerFactory = await ethers.getContractFactory('BonvoExperienceDeployer');
  const userReputationFactory = await ethers.getContractFactory('BonvoUserReputation');
  const experienceDeployerHelperFactory = await ethers.getContractFactory('BonvoExperienceDeployerHelper');
  const experiencesFactory = await ethers.getContractFactory('BonvoExperience');

  const experienceDeployer = (await experienceDeployerFactory.deploy()) as BonvoExperienceDeployer;
  await experienceDeployer.deployed();

  const badges = (await badgesFactory.deploy(100000, "", "", experienceDeployer.address)) as BonvoBadge;
  await badges.deployed();

  const userReputation = (await userReputationFactory.deploy(100000, "", experienceDeployer.address, badges.address)) as BonvoUserReputation;
  await userReputation.deployed();

  const experienceDeployerHelper = (await experienceDeployerHelperFactory.deploy(experienceDeployer.address)) as BonvoExperienceDeployerHelper;
  await experienceDeployerHelper.deployed();

  const experiences = (await experiencesFactory.deploy(100000, "", experienceDeployer.address, badges.address)) as BonvoExperience;
  await experiences.deployed();

  await experienceDeployer.setContracts(userReputation.address, experiences.address, experienceDeployerHelper.address);

  console.log('Verification started');

  try {
    await run(`verify:verify`, {
      address: experienceDeployer.address,
      constructorArguments: [],
    });
    console.log('Verified experienceDeployer');
  } catch (error) {
    console.log('Token already verified');
  }

  try {
    await run(`verify:verify`, {
      address: badges.address,
      constructorArguments: [100000, "", "", experienceDeployer.address],
    });
    console.log('Verified badges');
  }
  catch (error) {
    console.log('Token already verified');
  }

  try {
    await run(`verify:verify`, {
      address: userReputation.address,
      constructorArguments: [100000, "", experienceDeployer.address, badges.address],
    });
    console.log('Verified userReputation');
  } catch (error) {
    console.log('Token already verified');
  }

  try {
    await run(`verify:verify`, {
      address: experienceDeployerHelper.address,
      constructorArguments: [experienceDeployer.address],
    });
    console.log('Verified experienceDeployerHelper');
  } catch (error) {
    console.log('Token already verified');
  }

  try {
    await run(`verify:verify`, {
      address: experiences.address,
      constructorArguments: [100000, "", experienceDeployer.address, badges.address],
    });
    console.log('Verified experience');
  } catch (error) {
    console.log('Token already verified');
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
