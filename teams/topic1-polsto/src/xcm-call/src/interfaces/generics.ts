import { AccountId, Address } from '@polkadot/types/interfaces'
import { IKeyringPair } from '@polkadot/types/types'

export declare type AddressOrPair = IKeyringPair | string | AccountId | Address

export type XcmV2WeightLimit =
  | 'Unlimited'
  | {
      Limited: number
    }

export interface AccountDestination {
  network: 'Any'
  id: string
}

export type destination = 'Here' | 'Parachain' | 'AccountId32'

export type MultiLocationTypes = 'Parachain' | 'AccountId32'

type XcmV1MultilocationJunctions =
  | {
      Parachain: number
    }
  | {
      AccountId32: AccountDestination
    }

interface X1MultiLocationJunction {
  X1: XcmV1MultilocationJunctions
}

type XnMultiOptions = 'X2' | 'X3' | 'X4' | 'X5' | 'X6' | 'X7' | 'X8'

type XnMultiLocationJuntion = {
  [key in XnMultiOptions]: XcmV1MultilocationJunctions[]
}

type XcmV1MultiLocationJunctions = 'Here' | X1MultiLocationJunction | XnMultiLocationJuntion

interface XcmV1MultiLocation {
  V1: {
    parents: number
    interior: XcmV1MultiLocationJunctions
  }
}

export type XcmVersionedMultiLocation = XcmV1MultiLocation

export interface DestParam {
  dest: destination
  version: 'V1'
}

export type GenericBody =
  | any[]
  | {
      [key: string]: any
    }

export interface ExtrinsicParam {
  asSudo?: boolean
  pallet?: string
  method: string
  body: GenericBody
}
