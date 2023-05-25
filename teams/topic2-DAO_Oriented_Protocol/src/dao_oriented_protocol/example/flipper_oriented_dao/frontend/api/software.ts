import { ContractPromise } from "@polkadot/api-contract";
import ApplicationCoreAbi from "../contract_abi/application_core.json";
import { getGasLimitForNotDeploy } from "./apiUtils";
import { SoftwareInfo } from "../types/SoftwareTypes";

export const getSoftwareList = async (
    api:any,
    peformanceAddress: string
  ): Promise<Array<SoftwareInfo>> => {
    const applicationCoreAddress = String(process.env.NEXT_PUBLIC_APPLICATION_CORE_CONTRACT_ADDRESS) ?? "";
    let response: SoftwareInfo[] = [];
    const contract = new ContractPromise(api, ApplicationCoreAbi, applicationCoreAddress);
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const { output } = await contract.query.getInstalledSoftware(peformanceAddress, {
      value: 0,
      gasLimit: gasLimit,
    });
    console.log("getInstalledSoftware:output:",output?.toJSON());
    if (output !== undefined && output !== null) {
        let response_json = output.toJSON().ok;
        let json_data = JSON.parse(JSON.stringify(response_json));
        for (let i = 0; i < json_data.length; i++) {
          let item: SoftwareInfo = {
            id: json_data[i].id,
            kind: json_data[i].kind,
            softwareType: json_data[i].softwareType,
            contractAddress: json_data[i].contractAddress,
            description: json_data[i].description,        
            name: json_data[i].name,
          };
          response.push(item);
        }
    }
    return response;
  };

  export const getPreSoftwareList = async (
    api:any,
    peformanceAddress: string
  ): Promise<Array<SoftwareInfo>> => {
    const applicationCoreAddress = String(process.env.NEXT_PUBLIC_APPLICATION_CORE_CONTRACT_ADDRESS) ?? "";
    let response: SoftwareInfo[] = [];
    const contract = new ContractPromise(api, ApplicationCoreAbi, applicationCoreAddress);
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const { output } = await contract.query.getPreInstalledSoftware(peformanceAddress, {
      value: 0,
      gasLimit: gasLimit,
    });
    console.log("getPreSoftwareList:output:",output?.toJSON());
    if (output !== undefined && output !== null) {
        let response_json = output.toJSON().ok;
        let json_data = JSON.parse(JSON.stringify(response_json));
        for (let i = 0; i < json_data.length; i++) {
          let item: SoftwareInfo = {
            id: json_data[i].id,
            kind: json_data[i].kind,
            softwareType: json_data[i].softwareType,
            contractAddress: json_data[i].contractAddress,
            description: json_data[i].description,        
            name: json_data[i].name,
          };
          response.push(item);
        }
    }
    return response;
  };