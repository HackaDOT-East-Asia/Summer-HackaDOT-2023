import { destination } from './generics'
export interface TransferAssetsProps {
  destination?: destination
  destinationParents?: number | string
  destinationValue?: number | string
  beneficiary: destination
  beneficiaryValue?: string
  assetParents?: number | string
  amount: number | string
  feeAssetItem?: number | string
  assetId?: number | string
}

export interface LimitedTransferAssetsProps extends TransferAssetsProps {
  weightLimit?: number | string
}
