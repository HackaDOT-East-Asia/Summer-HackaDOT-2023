import { useState, useContext } from "react";
import { ProposalInfo } from "../types/ProposalTypes";
import { AppContext } from "../pages/_app";
import {
  get_account_info,
  get_selected_address,
} from "../api/accountInfoUtils";
import { submitProposal } from "../api/proposal";

const SubmitProposal = () => {
  const [addProposalInfo, setAddProposalInfo] = useState<ProposalInfo>({
    id: "0",
    kind: 0,
    title: "",
    outline: "",
    description: "",
    githubUrl: "",
    targetContract: "",
    targetFunction: "",
    parameters: "",
    status: 0,
  });
  const { api } = useContext(AppContext);

  const onChangeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAddProposalInfo({
      ...addProposalInfo,
      [event.target.name]: Number(event.target.value),
    });
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddProposalInfo({
      ...addProposalInfo,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddProposalInfo({
      ...addProposalInfo,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("## _onSubmit 1");
    event.preventDefault();
    const selectedAccount = await get_account_info(get_selected_address());
    await submitProposal(api, selectedAccount, addProposalInfo);
  };

  return (
    <>
      <div className="p-7"></div>
      <form className="" onSubmit={_onSubmit}>
        <div className="m-5 flex justify-center text-24px text-blue-200">
          <label>Proposal Information</label>
        </div>
        <div className="p-2 m-5 flex flex-col">
          <table>
            <tr>
              <th className=" flex justify-end px-4 py-2 text-white">Kind:</th>
              <td className=" px-4 py-2">
                <select
                  className="font-bold"
                  name="kind"
                  onChange={onChangeSelect}
                >
                  <option value="0">* Plese Select *</option>
                  <option value="1">ResetElectionCommisioner</option>
                  <option value="2">Other</option>
                </select>
              </td>
            </tr>
            <tr>
              <th className=" flex justify-end px-4 py-2 text-white">Title:</th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="title"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Outline:
              </th>
              <td className=" px-4 py-2">
                <textarea
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="outline"
                  rows={5}
                  onInput={onChangeText}
                ></textarea>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Description:
              </th>
              <td className=" px-4 py-2">
                <textarea
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="description"
                  rows={10}
                  onInput={onChangeText}
                ></textarea>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Github URL:
              </th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="githubUrl"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Target Contract Address:
              </th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="targetContract"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Target Function:
              </th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="targetFunction"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Parameters:
              </th>
              <td className=" px-4 py-2">
                <textarea
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="parameters"
                  rows={10}
                  onInput={onChangeText}
                  placeholder="# Note: The delimiter is $2$. Example: aaa$2$bbb$2$ccc"
                ></textarea>
              </td>
            </tr>
          </table>
        </div>

        <div className="flex justify-center">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
            onClick={() => _onSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default SubmitProposal;
