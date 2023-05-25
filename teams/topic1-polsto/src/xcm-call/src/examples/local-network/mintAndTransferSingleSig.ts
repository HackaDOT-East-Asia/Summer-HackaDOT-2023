import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { localNetworkUtils } from './local-network-utils'
import { MultiLocationTypes } from '../../interfaces'
import { makeAsssetMultiAsset, makeXcmVersionedMultiLocation } from '../../utils'
const main = async () => {
  const ASSET_INDEX = 1

  const httpProvider = new WsProvider(localNetworkUtils.parachain1Rpc)
  const api = await ApiPromise.create({ provider: httpProvider })
  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const sender = keyring.addFromUri('//Alice')

  const pallet = api.tx.xcmPallet ? 'xcmPallet' : 'polkadotXcm'

  const dest = makeXcmVersionedMultiLocation({
    target: 'Parachain' as MultiLocationTypes,
    value: 2000,
    parents: 1,
  })

  const beneficiary = makeXcmVersionedMultiLocation({
    target: 'AccountId32' as MultiLocationTypes,
    value: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', //dave
  })

  const assets = makeAsssetMultiAsset({
    amount: 200000000000000,
    parents: 0,
    assetId: 1,
  })

  const transactions = [
    api.tx.assets.mint(ASSET_INDEX, localNetworkUtils.parachain2AliceAccount, 1000000000000000),
    api.tx[pallet]?.limitedReserveTransferAssets(dest, beneficiary, assets, 0, 'Unlimited'),
  ]

  const txHash = await api.tx.utility.batch(transactions).signAndSend(sender)

  console.log(`tx hash is ${txHash}`)
}

main().then(() => process.exit(1))

/**
 *
npx ts-node src/examples/local-network/reserveAssets-statemine-to-trappist.ts
 */
