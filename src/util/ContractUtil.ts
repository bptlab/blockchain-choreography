import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

import { IMessageHistoryEntry } from "@/components/MessageHistory";
import IChoreography, { States } from "@/contract-interfaces/IChoreography";
import User from "./User";

const ChoreographyContract = TruffleContract(require("../../build/contracts/Choreography.json"));

export type EventTypeMapFunction = (contract: IChoreography, logEvent: any) => Promise<IMessageHistoryEntry>;

export interface IEventType {
  eventType: any;
  mapFunction: EventTypeMapFunction;
}

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

  public static async getMessageHistory(contract: IChoreography): Promise<IMessageHistoryEntry[]> {
    const blockFilter = { fromBlock: 0, toBlock: "latest" };
    const eventTypes: IEventType[] = [
      {
        eventType: contract.LogNewChange({}, blockFilter),
        mapFunction: ContractUtil.transformLogNewChange},
      // {
      //   eventType: contract.LogVerificationStarted({}, blockFilter),
      //   mapFunction: ContractUtil.transformLogNewChange},
      // {
      //   eventType: contract.LogVerificationDone({}, blockFilter),
      //   mapFunction: ContractUtil.transformLogNewChange},
      // {
      //   eventType: contract.LogReviewStarted({}, blockFilter),
      //   mapFunction: ContractUtil.transformLogNewChange},
      // {
      //   eventType: contract.LogReviewGiven({}, blockFilter),
      //   mapFunction: ContractUtil.transformLogNewChange},
      // {
      //   eventType: contract.LogVoteDistribution({}, blockFilter),
      //   mapFunction: ContractUtil.transformLogNewChange},
      // {
      //   eventType: contract.LogReviewDone({}, blockFilter),
      //   mapFunction: ContractUtil.transformLogNewChange},
      // {
      //   eventType: contract.LogProposalProcessed({}, blockFilter),
      //   mapFunction: ContractUtil.transformLogNewChange},
    ];
    const events = await Promise.all(eventTypes.map((eventType) => ContractUtil.getLogEvents(contract, eventType)));
    // Concat array of arrays
    return [].concat.apply([], events);
  }

  public static async getLogEvents(contract: IChoreography, eventType: IEventType): Promise<IMessageHistoryEntry[]> {
    const events = await ContractUtil.getEvents(eventType.eventType);
    const messages = await Promise.all(events.map((logEvent) => eventType.mapFunction(contract, logEvent)));
    return messages as any;
  }

  public static async transformLogNewChange(contract: IChoreography, logEvent: any):
    Promise<IMessageHistoryEntry> {
    const proposerUsername = await contract.getModelerUsername(logEvent.args._proposer);
    const user = await User.build(logEvent.args._proposer, proposerUsername);
    return {
      hash: logEvent.args._id,
      user,
      message: "proposed this change",
      timestamp: new Date(logEvent.args._timestamp * 1000),
    };
  }

}
