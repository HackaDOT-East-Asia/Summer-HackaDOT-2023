import { Keyring } from '@polkadot/keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { localNetworkUtils } from './local-network-utils'
import { Provider } from '../../provider'

const main = async () => {
  const rpc = localNetworkUtils.parachain1Rpc
  const destination = 'Parachain'
  const destinationValue = localNetworkUtils.parachain2ChainId // trappist parachain id
  const destinationParents = 1
  const beneficiary = 'AccountId32'
  const beneficiaryValue = localNetworkUtils.parachain2DestinationAccount
  const assetId = 1 // xUSD
  const amount = 100000000000000 // 100 xUSD

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const sender = keyring.addFromUri('//Alice')

  const provider = new Provider(rpc, sender)

  const res = await provider.limitedReserveTransferAssets({
    destination,
    destinationValue,
    destinationParents,
    beneficiary,
    beneficiaryValue,
    assetId,
    amount,
  })

  console.log(res)
}

main().then(() => process.exit(1))

/**
 *
npx ts-node src/examples/local-network/reserveAssets-statemine-to-trappist.ts
 */
