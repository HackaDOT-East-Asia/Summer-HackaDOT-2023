import { useEffect, useState, useContext } from "react";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { checkAndCreateApiObject } from "../api/apiUtils";
import { AppContext } from "../pages/_app";
import { useRouter } from "next/router";
import Link from "next/link";

interface AccountInfo {
  string2display: string;
  account: InjectedAccountWithMeta;
  address: string;
}

const SelectAccount = () => {
  const [showStartLink, setShowStartLink] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const { api, setApi } = useContext(AppContext);
  // const router = useRouter();

  const extensionSetup = async () => {
    const { web3Accounts, web3Enable } = await import(
      "@polkadot/extension-dapp"
    );
    const extensions = await web3Enable("Polk4NET");
    console.log("index: extensions:",extensions);
    if (extensions.length === 0) {
      return;
    }
    const account = await web3Accounts();

    let account_info_array: Array<AccountInfo> = [];
    const empty_data: AccountInfo = {
      string2display: "",
      address: "",
      account: { address: "", meta: { genesisHash: "", name: "", source: "" } },
    };
    account_info_array.push(empty_data);
    for (let i = 0; i < account.length; i++) {
      let account_info: AccountInfo = {
        string2display: account[i].address + " [" + account[i].meta.name + "]",
        account: account[i],
        address: account[i].address,
      };
      account_info_array.push(account_info);
    }
    setAccounts(account_info_array);
  };

  const _onSubmit = async () => {
    await checkAndCreateApiObject(api, setApi);
    if (selectedAccount == "") {
      alert("Please select valid account.");
      return;
    }
    sessionStorage.setItem("selected_account_address", selectedAccount);
    setShowStartLink(true);
    // router.push("start/index.tsx");
  };

  const _onConnectWallet = async () => {
    console.log("index: _onConnectWallet");
    await extensionSetup();
  };

  return (
    <>
      <div className="bg-black min-h-screen">
        <div className="text-center text-100px font-extrabold leading-none tracking-tight">
          <div className="p-3"></div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-500">
            Example:DAO Flip By DAO Oriented Protocol
          </span>
        </div>
        <div className="m-10"></div>
        <div className="flex justify-center p-3">
          <button
            className="px-4 py-2 border-double border-white border-2 bg-black rounded text-30px text-orange-200  hover:bg-blue-200"
            onClick={_onConnectWallet}
          >
            Connect Wallet
          </button>
        </div>

        {/* <form className="" onSubmit={_onSubmit}> */}

        <div className="flex justify-center px-2 py-3 text-white text-30px">
          Select your account:{" "}
        </div>
        <div className="flex justify-center px-2 py-3 text-black">
          <select
            className="font-bold"
            name="Status"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map((account_info) => (
              <option key={account_info.address} value={account_info.address}>
                {account_info.string2display}
              </option>
            ))}{" "}
          </select>
        </div>

        <div className="flex justify-center p-3">
          <button
            className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-200  hover:bg-blue-200"
            onClick={_onSubmit}
          >
            Ok
          </button>
        </div>
        {/* </form> */}

        <div className="m-10"></div>
        <div className="flex justify-center">
          {showStartLink == true && (
            <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
              <Link href="/start">Start</Link>
            </button>
          )}
        </div>

        {/* <form className="" onSubmit={_onSubmit}>
          <div className="flex justify-center">
            <table className="p-5">
              <tr>
                <th className="px-2 py-3 text-white">Select your account: </th>
                <td className="px-2 py-3 text-black">
                  <select
                    className="font-bold"
                    name="Status"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                  >
                    {accounts.map((account_info) => (
                      <option
                        key={account_info.address}
                        value={account_info.address}
                      >
                        {account_info.string2display}
                      </option>
                    ))}{" "}
                  </select>
                </td>
              </tr>
            </table>
          </div>
          <div className="flex justify-center p-3">
            <button
              className="px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-orange-400  hover:bg-orange-200"
              onClick={() => _onSubmit}
            >
              Ok
            </button>
          </div>
        </form> */}
      </div>
    </>
  );
};

export default SelectAccount;
