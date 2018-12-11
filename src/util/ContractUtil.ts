import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

import IChoreography, { States } from "@/contract-interfaces/IChoreography";

const ChoreographyContract = TruffleContract(require("../../build/contracts/Choreography.json"));

export default class ContractUtil {

  public static async initializeContract(web3: Web3): Promise<IChoreography> {
    if (web3.eth.accounts.length === 0) {
      throw Error("No blockchain accouns found.");
    }

    // Initialize contract
    ChoreographyContract.setProvider(web3.currentProvider);
    ChoreographyContract.defaults({
      from: web3.eth.accounts[0],
      gas: 5000000,
    });

    return ChoreographyContract.new("friedow", "friedow@example.org");
  }

  public static async getContractState(contract: IChoreography): Promise<States> {
    return (await contract.state()).toNumber();
  }

}
