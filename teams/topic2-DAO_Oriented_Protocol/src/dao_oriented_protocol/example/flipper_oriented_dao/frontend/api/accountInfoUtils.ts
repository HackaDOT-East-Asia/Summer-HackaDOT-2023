import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

export const get_selected_address = ():string => {
    const address = sessionStorage.getItem("selected_account_address") ?? "";
    return address;
}

export const get_account_info = async ( selected_address:string ):Promise<InjectedAccountWithMeta> =>  {
    const { web3Accounts, web3Enable } = await import(
      "@polkadot/extension-dapp"
    );

    let result:InjectedAccountWithMeta = {address:"",meta:{genesisHash:"",name:"",source:""}};
    const extensions = await web3Enable("Polk4NET");
    if (extensions.length === 0) {
      return result;
    }
    const account = await web3Accounts();

    for (let i = 0; i<account.length; i++){
        if (selected_address == account[i].address){
            result =  account[i];
            break;
        }
    }
    return result;
  };