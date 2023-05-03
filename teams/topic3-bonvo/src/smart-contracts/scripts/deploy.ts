import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { SimpleEquippable } from '../typechain-types';
import { IRMRKInitData } from '../typechain-types/contracts/SimpleEquippable';

async function main() {
  await deployContracts();
}

async function deployContracts(): Promise<void> {
  console.log('Deploying smart simple equippable contract');

  const contractFactory = await ethers.getContractFactory('SimpleEquippable');
  const initData: IRMRKInitData.InitDataStruct = {
    erc20TokenAddress: ethers.constants.AddressZero,
    tokenUriIsEnumerable: false,
    royaltyRecipient: ethers.constants.AddressZero,
    royaltyPercentageBps: 1000,
    maxSupply: BigNumber.from(1000),
    pricePerMint: ethers.utils.parseEther('1.0'),
  };

  const kanaria: SimpleEquippable = await contractFactory.deploy(
    'Kanaria',
    'KAN',
    'ipfs://collectionMeta',
    'ipfs://tokenMeta',
    initData,
  );

  await kanaria.deployed();
  console.log(`Sample contracts deployed to ${kanaria.address}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
