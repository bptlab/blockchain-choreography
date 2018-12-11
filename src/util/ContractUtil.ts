import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

import IChoreography, { States } from "@/contract-interfaces/IChoreography";
import { IMessageHistoryEntry } from "@/components/MessageHistory";
import User from "./User";

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

  public static getEvents(eventType: any): Promise<any> {
    return new Promise((resolve, reject) => {
      eventType.get((error, result) => {
        resolve(result);
      });
    });
  }

  public static async getMessageHistory(contract: IChoreography): Promise<IMessageHistoryEntry []> {
    const LogNewChangeEvent = contract.LogNewChange({}, { fromBlock: 0, toBlock: "latest" });
    const events = await ContractUtil.getEvents(LogNewChangeEvent);
    console.log(events);
    const messages = (await Promise.all(events.map(async (result): Promise<IMessageHistoryEntry> => {
      const proposerUsername = await contract.getModelerUsername(result.args._proposer);
      const proposer = await User.build(result.args._proposer, proposerUsername);
      return {
        user: proposer,
        message: "proposed this change",
        timestamp: new Date(),
      };
    })) as any);
    console.log(messages);
    return messages;
  }

}
