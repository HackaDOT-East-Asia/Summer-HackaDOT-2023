// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IAccount, UserOperationVariant } from "./interfaces/IAccount.sol";
import { IUniswapV3Router } from "./dependencies/IUniswapV3Router.sol";

contract Account is IAccount {
    event AccountCreated(address addr);

    address public immutable wETH;
    bytes public originCommitment;
    CommitmentProof[] public commitmentProof;

    constructor(address _wETH, bytes memory _commitment) {
        wETH = _wETH;
        originCommitment = _commitment;

        emit AccountCreated(address(this));
    }

    receive() external payable {}

    function validateUserOp(
        UserOperationVariant calldata userOp
    ) external returns (uint256 validationData) {}

    function verify(
        bytes calldata commitment,
        bytes calldata proof
    ) external returns (bool) {
        // NOTE: Verify(commitment, proof) returns true if the proof is valid and false otherwise.
        // However, verifying a proof went over 30_000_000 gas so it was impossible to do it on-chain.
        // Hence, in this PoC, we validate off-chain and publicly record commitments and proofs
        // so that anyone can detect a fruad if there is any.
        commitmentProof.push(CommitmentProof(commitment, proof));

        return true;
    }

    function exactInputSingle(
        address router,
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut,
        uint24 poolFee
    ) external payable returns (uint256 amountOut) {
        if (tokenIn != wETH) {
            IERC20(tokenIn).approve(router, amountIn);
        }

        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            });

        if (tokenIn != wETH) {
            amountOut = IUniswapV3Router(router).exactInputSingle(params);
        } else {
            amountOut = IUniswapV3Router(router).exactInputSingle{
                value: amountIn
            }(params);
        }
    }
}
