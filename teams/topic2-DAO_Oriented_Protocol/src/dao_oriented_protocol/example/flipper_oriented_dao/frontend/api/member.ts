import { ContractPromise } from "@polkadot/api-contract";
import ApplicationCoreAbi from "../contract_abi/application_core.json";
import { getGasLimitForNotDeploy } from "./apiUtils";
import { MemberInfo } from "../types/MemberTypes";

export const getMemberList = async (
    api:any,
    peformanceAddress: string
  ): Promise<Array<MemberInfo>> => {
    const applicationCoreAddress = String(process.env.NEXT_PUBLIC_APPLICATION_CORE_CONTRACT_ADDRESS) ?? "";
    let response: MemberInfo[] = [];
    const contract = new ContractPromise(api, ApplicationCoreAbi, applicationCoreAddress);
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const { output } = await contract.query.getMemberList(peformanceAddress, {
      value: 0,
      gasLimit: gasLimit,
    });
    console.log("getMemberList:output:",output?.toJSON());
    if (output !== undefined && output !== null) {
        let response_json = output.toJSON().ok;
        let json_data = JSON.parse(JSON.stringify(response_json));
        for (let i = 0; i < json_data.length; i++) {
          let item: MemberInfo = {
            name: json_data[i].name,
            eoaAddress: json_data[i].address,
            memberId: Number(json_data[i].id),
          };
          response.push(item);
        }
    }
    return response;
  };

  export const getElectionCommisionList = async (
    api:any,
    peformanceAddress: string
  ): Promise<Array<MemberInfo>> => {
    const applicationCoreAddress = String(process.env.NEXT_PUBLIC_APPLICATION_CORE_CONTRACT_ADDRESS) ?? "";
    let response: MemberInfo[] = [];
    const contract = new ContractPromise(api, ApplicationCoreAbi, applicationCoreAddress);
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const { output } = await contract.query.getElectionCommisionList(peformanceAddress, {
      value: 0,
      gasLimit: gasLimit,
    });
    if (output !== undefined && output !== null) {
        let response_json = output.toJSON().ok;
        let json_data = JSON.parse(JSON.stringify(response_json));
        for (let i = 0; i < json_data.length; i++) {
          let item: MemberInfo = {
            name: json_data[i].name,
            eoaAddress: json_data[i].address,
            memberId: Number(json_data[i].id),
          };
          response.push(item);
        }
    }
    return response;
  };