import { MultiLocationTypes } from './generics'

export interface MakeXcmVersionedMultiLocationProps {
  target: MultiLocationTypes
  value: string | number | undefined
  parents?: number | string | undefined
}

export interface MakeXcmVersionedMultiAssetsProps {
  assetId?: number | string
  palletInstance?: number
  amount: number | string
  parents?: number | string
}
