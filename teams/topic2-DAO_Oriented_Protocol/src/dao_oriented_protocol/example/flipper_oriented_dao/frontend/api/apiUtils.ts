import { BN } from "@polkadot/util";
import { ApiPromise, WsProvider } from "@polkadot/api";

export const getGasLimitForNotDeploy = (api:any):any => {
    const gasLimit: any = api.registry.createType("WeightV2", {
      refTime: new BN("100000000000"),
      proofSize: new BN("100000000000"),
      // refTime: 6219235328,
      // proofSize: 131072,
    });
    return gasLimit;
  }

  export const checkEventsAndInculueError = (events: any[]): boolean => {
    let ret = false;
    events.forEach(({ event: { data } }) => {
      console.log("### data.methhod:", data.method);
      if (String(data.method) == "ExtrinsicFailed") {
        console.log("### check ExtrinsicFailed");
        ret = true;
      }
    });
    console.log("### ret is:", ret);
    return ret;
  };

  export const checkAndCreateApiObject = async (
    api: any,
    setApi: (api: any) => void
  ): Promise<any> => {
    let apiObject: any = api;
    if (api == undefined) {
      const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
      const wsProvider = new WsProvider(blockchainUrl);
      apiObject = await ApiPromise.create({ provider: wsProvider });
      console.log("### pass SetApi:", apiObject);
      setApi(apiObject);
    }
    return apiObject;
  };