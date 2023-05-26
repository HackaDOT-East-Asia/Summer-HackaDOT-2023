import { ContractPromise } from "@polkadot/api-contract";
import ApplicationCoreAbi from "../contract_abi/application_core.json";
import { getGasLimitForNotDeploy } from "./apiUtils";
import { ElectionInfo } from "../types/ElectionTypes";

export const getElectionList = async (
  api: any,
  peformanceAddress: string
): Promise<Array<ElectionInfo>> => {
  const applicationCoreAddress =
    String(process.env.NEXT_PUBLIC_APPLICATION_CORE_CONTRACT_ADDRESS) ?? "";
  let response: ElectionInfo[] = [];
  const contract = new ContractPromise(
    api,
    ApplicationCoreAbi,
    applicationCoreAddress
  );
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const { output } = await contract.query.getElectionInfoList(
    peformanceAddress,
    {
      value: 0,
      gasLimit: gasLimit,
    }
  );
  if (output !== undefined && output !== null) {
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
        // let listOfVoters:string[] = [];
        // for (let j=0; j<json_data[i].listOfVoters.length; j++){
        // }
      let item: ElectionInfo = {
        id: json_data[i].id,
        proposalId: json_data[i].proposalId,
        minimumVoterTurnoutPercentage: json_data[i].minimumVoterTurnoutPercentage,
        passingPercentage: json_data[i].passingPercentage,
        numberOfVotes: json_data[i].numberOfVotes,
        countOfYes: json_data[i].countOfYes,
        countOfNo: json_data[i].countOfNo,
        listOfVoters: json_data[i].listOfVoters,
        listOfElectoralCommissioner: json_data[i].listOfElectoralCommissioner,
        isPassed: json_data[i].isPassed,
      };
      response.push(item);
    }
  }
  return response;
};
