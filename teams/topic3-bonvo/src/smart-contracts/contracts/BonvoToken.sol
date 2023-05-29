// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BonvoToken is Ownable, ERC20 {
    constructor() ERC20("Bonvo", "Bnv") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
