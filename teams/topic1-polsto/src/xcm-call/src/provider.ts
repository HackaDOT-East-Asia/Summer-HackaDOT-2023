import { ApiPromise, WsProvider } from '@polkadot/api'
import { Signer } from '@polkadot/types/types'
import { AddressOrPair, MultiLocationTypes, ExtrinsicParam } from './interfaces/generics'
import { TransferAssetsProps, LimitedTransferAssetsProps } from './interfaces/methods'
import { getPallet, parseGenericBody} from './utils'
import { makeXcmVersionedMultiLocation, makeAsssetMultiAsset, formatExtrinsicResponse } from './utils'

export class Provider {
  rpc: string
  signer: AddressOrPair
  injectorSigner: Signer | null = null

  constructor(rpc: string, signer: AddressOrPair) {
    this.rpc = rpc
    this.signer = signer
  }

  private async getApi() {
    const api = await ApiPromise.create({
      provider: new WsProvider(this.rpc),
    })

    if (this.injectorSigner) {
      api.setSigner(this.injectorSigner)
    }

    return api
  }

  private prepareExtrinsic(props: LimitedTransferAssetsProps) {
    const {
      destination: _destination,
      destinationValue: _destinationValue,
      destinationParents: _destinationParents,
      beneficiary: _beneficiary,
      beneficiaryValue: _beneficiaryValue,
      amount: _amount,
      feeAssetItem: _feeAssetItem,
      assetParents: _assetParents,
      weightLimit: _weightLimit,
      assetId: _assetId,
    } = props

    let dest = null
    let beneficiary = null
    let assets = null
    let feeAssetItem = null
    let weightLimit = null

    dest = makeXcmVersionedMultiLocation({
      target: _destination as MultiLocationTypes,
      value: _destinationValue,
      parents: _destinationParents,
    })

    beneficiary = makeXcmVersionedMultiLocation({
      target: _beneficiary as MultiLocationTypes,
      value: _beneficiaryValue,
    })

    assets = makeAsssetMultiAsset({
      amount: _amount,
      parents: _assetParents,
      assetId: _assetId,
    })

    feeAssetItem = _feeAssetItem || 0

    weightLimit = _weightLimit ? { Limited: _weightLimit } : 'Unlimited'

    return {
      dest,
      beneficiary,
      assets,
      feeAssetItem,
      weightLimit,
    }
  }

  public async setInjectorSigner(signer: Signer) {
    this.injectorSigner = signer
  }

  public async reserveTransferAssets(props: TransferAssetsProps) {
    const api = await this.getApi()

    const pallet = getPallet(api)

    if (!api.tx[pallet]?.reserveTransferAssets) throw new Error('No reserveTransferAssets method found')

    const { dest, beneficiary, assets, feeAssetItem } = this.prepareExtrinsic(props)

    return new Promise(async (res, rej) => {
      api.tx[pallet]
        ?.reserveTransferAssets(dest, beneficiary, assets, feeAssetItem)
        .signAndSend(this.signer, ({ status, txHash, dispatchError, dispatchInfo }: any) => {
          formatExtrinsicResponse({
            api,
            res,
            rej,
            status,
            txHash,
            dispatchError,
            dispatchInfo,
          })
        })
    })
  }

  public async limitedReserveTransferAssets(props: LimitedTransferAssetsProps) {
    const api = await this.getApi()
    const pallet = getPallet(api)

    if (!api.tx[pallet]?.limitedReserveTransferAssets) throw new Error('No limitedReserveTransferAssets method found')

    const { dest, beneficiary, assets, feeAssetItem, weightLimit } = this.prepareExtrinsic(props)

    return new Promise(async (res, rej) => {
      api.tx[pallet]
        ?.limitedReserveTransferAssets(dest, beneficiary, assets, feeAssetItem, weightLimit)
        .signAndSend(this.signer, ({ status, txHash, dispatchError, dispatchInfo }: any) => {
          formatExtrinsicResponse({
            api,
            res,
            rej,
            status,
            txHash,
            dispatchError,
            dispatchInfo,
          })
        })
    })
  }
  public async teleportAssets(props: TransferAssetsProps) {
    const api = await this.getApi()

    const pallet = getPallet(api)

    if (!api.tx[pallet]?.teleportAssets) throw new Error('No teleportAssets method found')

    const { dest, beneficiary, assets, feeAssetItem } = this.prepareExtrinsic(props)

    return new Promise(async (res, rej) => {
      api.tx[pallet]
        ?.teleportAssets(dest, beneficiary, assets, feeAssetItem)
        .signAndSend(this.signer, ({ status, txHash, dispatchError, dispatchInfo }: any) => {
          formatExtrinsicResponse({
            api,
            res,
            rej,
            status,
            txHash,
            dispatchError,
            dispatchInfo,
          })
        })
    })
  }

  public async limitedTeleportAssets(props: LimitedTransferAssetsProps) {
    const api = await this.getApi()

    const pallet = getPallet(api)

    if (!api.tx[pallet]?.limitedTeleportAssets) throw new Error('No limitedTeleportAssets method found')

    const { dest, beneficiary, assets, feeAssetItem, weightLimit } = this.prepareExtrinsic(props)

    return new Promise(async (res, rej) => {
      api.tx[pallet]
        ?.limitedTeleportAssets(dest, beneficiary, assets, feeAssetItem, weightLimit)
        .signAndSend(this.signer, ({ status, txHash, dispatchError, dispatchInfo }: any) => {
          formatExtrinsicResponse({
            api,
            res,
            rej,
            status,
            txHash,
            dispatchError,
            dispatchInfo,
          })
        })
    })
  }

  public async customExtrinsic(props: ExtrinsicParam) {
    const api = await this.getApi()
    const pallet = getPallet(api, props.pallet)

    if (!api.tx[pallet][props.method]) {
      throw new Error(`${props.method} method unsupported`)
    }

    const body = parseGenericBody(props.body)

    let extrinsic = api.tx[pallet][props.method](...body)

    if (props.asSudo) {
      extrinsic = api.tx.sudo.sudo(extrinsic)
    }

    return new Promise(async (res, rej) => {
      extrinsic.signAndSend(this.signer, ({ status, txHash, dispatchError, dispatchInfo }: any) => {
        formatExtrinsicResponse({
          api,
          res,
          rej,
          status,
          txHash,
          dispatchError,
          dispatchInfo,
        })
      })
    })
  }
}
