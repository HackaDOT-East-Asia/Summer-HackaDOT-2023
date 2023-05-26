import { ContractPromise } from "@polkadot/api-contract";
import DaoOrientedFlipperAbi from "../contract_abi/dao_oriented_flipper.json";
import { getGasLimitForNotDeploy } from "./apiUtils";

export const getFlipState = async (
    api:any,
    peformanceAddress: string
  ): Promise<string> => {
    const flipperAddress = String(process.env.NEXT_PUBLIC_DAO_ORIENTED_FLIPPER_CONTRACT_ADDRESS) ?? "";
    let res = "0";
    const contract = new ContractPromise(api, DaoOrientedFlipperAbi, flipperAddress);
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const { output } = await contract.query.get(peformanceAddress, {
      value: 0,
      gasLimit: gasLimit,
    });
    if (output !== undefined && output !== null) {
      console.log("getFlip: output: ", output.toHuman());
      res = output.toHuman().Ok.toString() ?? "NaN";
    }
    return res;
  };