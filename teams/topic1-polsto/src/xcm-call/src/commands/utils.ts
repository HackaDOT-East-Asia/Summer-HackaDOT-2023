import { Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { Options as YargsOptions } from 'yargs'
import { Provider } from '../provider'

export enum SUPPORTED_METHODS {
  reserveTransferAssets = 'reserveTransferAssets',
  limitedReserveTransferAssets = 'limitedReserveTransferAssets',
  teleportAssets = 'teleportAssets',
  limitedTeleportAssets = 'limitedTeleportAssets',
}

export const commonArgsOptions: { [key: string]: YargsOptions } = {
  rpc: { type: 'string', demandOption: true },
  mnemonic: { type: 'string', demandOption: true },
  /*
    Destination

  */
  destination: { type: 'string', alias: 'dest', default: 'Here' },
  destinationValue: { type: 'string', alias: 'destV' },
  destinationParents: { type: 'number', alias: 'destP', default: 0 },
  /*
    Beneficiary
  */
  beneficiary: { type: 'string', alias: 'ben', demandOption: true },
  beneficiaryValue: { type: 'string', alias: 'benV', demandOption: true },
  /*
    Asset
  */
  amount: { type: 'number', alias: 'a', default: 0, number: true, demandOption: true },
  feeAsset: { type: 'string', alias: 'feeAsset', default: 0, number: true },
  assetParents: { type: 'string', alias: 'assetP', default: 0, number: true },
  assetId: { type: 'string', alias: 'assetId', default: 0, number: true },
  /*
    Weight
  */
  weightLimit: { type: 'string', alias: 'wl' },
}

export const getArgsValues = (args: any) => {
  const rpc = args['rpc']
  const mnemonic = args['mnemonic']
  const destinationV = args['destV']
  const destinationParents = args['destP']
  const beneficiary = args['ben']
  const beneficiaryValue = args['benV']
  const amount = args['a']
  const feeAsset = args['feeAsset']
  const assetParents = args['assetP']
  const assetId = args['assetId']
  const weightLimit = args['wl']

  return {
    rpc,
    mnemonic,
    destinationV,
    destinationParents,
    beneficiary,
    beneficiaryValue,
    amount,
    feeAsset,
    assetParents,
    assetId,
    weightLimit,
  }
}

export const getSender = (mnemonic: string) => {
  let sender: KeyringPair
  const keyring = new Keyring({ type: 'sr25519' })

  if (mnemonic.startsWith('//')) {
    sender = keyring.addFromUri(mnemonic)
  }

  sender = keyring.addFromMnemonic(mnemonic)

  return sender
}

export const executeCommand = async (args: any, method: SUPPORTED_METHODS) => {
  await cryptoWaitReady()

  new Keyring({ type: 'sr25519' })

  const { rpc, mnemonic, ...extrinsicArgs } = args

  const sender = getSender(mnemonic)

  const provider = new Provider(rpc, sender)

  console.log('Sending tx..')
  const res = await provider[method](extrinsicArgs)

  console.log('tx send!')
  console.log('result: ', res)
  process.exit(1)
}
