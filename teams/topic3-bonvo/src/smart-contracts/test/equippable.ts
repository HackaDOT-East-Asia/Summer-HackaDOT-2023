import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SimpleEquippable } from '../typechain-types';
import { IRMRKInitData } from '../typechain-types/contracts/SimpleEquippable';

async function fixture(): Promise<SimpleEquippable> {
  const equipFactory = await ethers.getContractFactory('SimpleEquippable');

  const initData: IRMRKInitData.InitDataStruct = {
    erc20TokenAddress: ethers.constants.AddressZero,
    tokenUriIsEnumerable: false,
    royaltyRecipient: ethers.constants.AddressZero,
    royaltyPercentageBps: 1000,
    maxSupply: BigNumber.from(1000),
    pricePerMint: ethers.utils.parseEther('1.0'),
  };

  const equip: SimpleEquippable = await equipFactory.deploy(
    'Kanaria',
    'KAN',
    'ipfs://collectionMeta',
    'ipfs://tokenMeta',
    initData,
  );
  await equip.deployed();

  return equip;
}

describe('SimpleEquippable Assets', async () => {
  let equip: SimpleEquippable;
  beforeEach(async function () {
    equip = await loadFixture(fixture);
  });

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await equip.name()).to.equal('Kanaria');
      expect(await equip.symbol()).to.equal('KAN');
    });
  });
});
