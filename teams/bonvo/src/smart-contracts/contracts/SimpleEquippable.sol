// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@rmrk-team/evm-contracts/contracts/implementations/nativeTokenPay/RMRKEquippableImpl.sol";

contract SimpleEquippable is RMRKEquippableImpl {
    constructor(
        string memory name_,
        string memory symbol_,
        string memory collectionMetadata_,
        string memory tokenURI_,
        InitData memory data
    )
        RMRKEquippableImpl(name_, symbol_, collectionMetadata_, tokenURI_, data)
    {}
}
