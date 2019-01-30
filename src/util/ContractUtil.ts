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

  public static async initializeContract(web3: Web3, user: User): Promise<IChoreography> {
    if (web3.eth.accounts.length === 0) {
      throw Error("No blockchain accouns found.");
    }

    // Initialize contract
    ChoreographyContract.setProvider(web3.currentProvider);
    ChoreographyContract.defaults({
      from: user.publicKey,
      gas: 5000000,
    });

    return ChoreographyContract.new("friedow", "friedow@example.org");
  }

  public static async loadContract(web3: Web3, address: string, user: User): Promise<IChoreography> {
    if (web3.eth.accounts.length === 0) {
      throw Error("No blockchain accouns found.");
    }

    // Initialize contract
    ChoreographyContract.setProvider(web3.currentProvider);
    ChoreographyContract.defaults({
      from: user.publicKey,
      gas: 5000000,
    });

    return ChoreographyContract.at(address);
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
        mapFunction: ContractUtil.mapLogNewChange},
      {
        eventType: contract.LogVerificationStarted({}, blockFilter),
        mapFunction: ContractUtil.mapLogVerificationStarted},
      {
        eventType: contract.LogVerificationDone({}, blockFilter),
        mapFunction: ContractUtil.mapLogVerificationDone},
      {
        eventType: contract.LogReviewStarted({}, blockFilter),
        mapFunction: ContractUtil.mapLogReviewStarted},
      {
        eventType: contract.LogReviewGiven({}, blockFilter),
        mapFunction: ContractUtil.mapLogReviewGiven},
      {
        eventType: contract.LogReviewDone({}, blockFilter),
        mapFunction: ContractUtil.mapLogReviewDone},
      {
        eventType: contract.LogProposalProcessed({}, blockFilter),
        mapFunction: ContractUtil.mapLogProposalProcessed},
      {
        eventType: contract.LogNewCounterproposal({}, blockFilter),
        mapFunction: ContractUtil.mapLogNewCounterproposal},
    ];
    const events = await Promise.all(eventTypes.map((eventType) => ContractUtil.getLogEvents(contract, eventType)));
    // Concat array of arrays
    const unsortedEvents: IMessageHistoryEntry[] = [].concat.apply([], events);
    return unsortedEvents.sort((event1, event2) => (event1.timestamp as any) - (event2.timestamp as any));
  }

  public static async getLogEvents(contract: IChoreography, eventType: IEventType): Promise<IMessageHistoryEntry[]> {
    const events = await ContractUtil.getEvents(eventType.eventType);
    const messages = await Promise.all(events.map((logEvent) => eventType.mapFunction(contract, logEvent)));
    return messages as any;
  }

  public static async mapLogNewChange(contract: IChoreography, logEvent: any):
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

  public static async mapLogVerificationStarted(contract: IChoreography, logEvent: any):
    Promise<IMessageHistoryEntry> {
    const proposerUsername = await contract.getModelerUsername(logEvent.args._proposer);
    const user = await User.build(logEvent.args._proposer, proposerUsername);
    return {
      hash: logEvent.args._id,
      user,
      message: "started the automatic reviewer verification",
      timestamp: new Date(logEvent.args._timestamp * 1000),
    };
  }

  public static async mapLogVerificationDone(contract: IChoreography, logEvent: any):
    Promise<IMessageHistoryEntry> {
    const user = await User.build("", "ethereum");
    const message = logEvent.args._success ?
      "Automatic reviewer verification has finished successfully." :
      "Automatic reviewer verification has failed. Please recalculate the list of reviewers";
    return {
      hash: logEvent.args._id,
      user,
      message,
      timestamp: new Date(logEvent.args._timestamp * 1000),
    };
  }

  public static async mapLogReviewStarted(contract: IChoreography, logEvent: any):
    Promise<IMessageHistoryEntry> {
    const user = await User.build("", "ethereum");
    return {
      hash: logEvent.args._id,
      user,
      message: "started the review process",
      timestamp: new Date(logEvent.args._timestamp * 1000),
    };
  }

  public static async mapLogReviewGiven(contract: IChoreography, logEvent: any):
    Promise<IMessageHistoryEntry> {
    const reviewerUsername = await contract.getModelerUsername(logEvent.args._reviewer);
    const user = await User.build(logEvent.args._reviewer, reviewerUsername);
    const message = logEvent.args._approved ?
      "approved this change" :
      "rejected this change";
    return {
      hash: logEvent.args._id,
      user,
      message,
      timestamp: new Date(logEvent.args._timestamp * 1000),
    };
  }

  public static async mapLogReviewDone(contract: IChoreography, logEvent: any):
    Promise<IMessageHistoryEntry> {
    const user = await User.build("", "ethereum");
    return {
      hash: logEvent.args._id,
      user,
      message: "closed the review process",
      timestamp: new Date(logEvent.args._timestamp * 1000),
    };
  }

  public static async mapLogProposalProcessed(contract: IChoreography, logEvent: any):
    Promise<IMessageHistoryEntry> {
    const user = await User.build("", "ethereum");
    const message = logEvent.args._approved ?
      "Change proposal has been accepted and was merged." :
      "Change proposal has been rejected.";
    return {
      hash: logEvent.args._id,
      user,
      message,
      timestamp: new Date(logEvent.args._timestamp * 1000),
    };
  }

  public static async mapLogNewCounterproposal(contract: IChoreography, logEvent: any):
    Promise<IMessageHistoryEntry> {
    const proposerUsername = await contract.getModelerUsername(logEvent.args._proposer);
    const user = await User.build(logEvent.args._proposer, proposerUsername);
    return {
      hash: logEvent.args._id,
      user,
      message: "proposed this counterproposal",
      timestamp: new Date(logEvent.args._timestamp * 1000),
    };
  }

}
