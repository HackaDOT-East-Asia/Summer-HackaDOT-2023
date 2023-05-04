# Instructions

1. Install packages with `yarn` or `npm i`
2. Test contracts compile: `yarn hardhat compile`
3. Check contract size: `yarn hardhat size-contracts`
4. Run tests: `yarn test`
5. Run prettier: `yarn prettier`
6. Copy .env.example into .env and set your variables
7. Use `contracts/`, `tests/` and `scripts/` to build your code.
8. Deploy on testnet: `yarn hardhat run scripts/deploy.ts --network moonbaseAlpha`
9. Verify contracts, using the contract address and arguments from previous step:
   ```
      yarn hardhat verify 0x.... --network moonbaseAlpha --contract contracts/SimpleEquippable.sol:SimpleEquippable --arguments ...
   ```

Remember to give credit to RMRK if you're using it's technology. Check the license and notice for more details.
