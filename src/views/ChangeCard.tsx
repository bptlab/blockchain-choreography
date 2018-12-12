import * as React from "react";
import * as Web3 from "web3";

import ContractInteractionWidget from "@/components/ContractInteractionWidget";
import MessageHistory, { IMessageHistoryEntry } from "@/components/MessageHistory";
import StackedDate from "@/components/StackedDate";
import StackedUser from "@/components/StackedUser";
import IChoreography, { States } from "@/contract-interfaces/IChoreography";
import ContractUtil from "@/util/ContractUtil";
import User from "@/util/User";

const changeCardStyles = require("./ChangeCard.css");

interface IChangeCardProps {
  web3: Web3;
}

interface IChangeCardState {
  timestamp: Date;
  title: string;
  diff: string;
  state: States;
  proposer: User;
  messages: IMessageHistoryEntry[];
  contract: IChoreography;
}

export default class ChangeCard extends React.Component<IChangeCardProps, IChangeCardState> {
  constructor(props) {
    super(props);

    this.state = {
      timestamp: new Date(),
      title: "Click here to add a title",
      diff: "",
      state: States.READY,
      proposer: User.emptyUser(),
      messages: [],
      contract: undefined,
    };

    this.handleLogEvent = this.handleLogEvent.bind(this);
    this.handleLogNewChange = this.handleLogNewChange.bind(this);
    this.clearTitleInput = this.clearTitleInput.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
  }

  public async componentWillMount() {
    let timestamp: Date = new Date();
    let publicKey: string = "";
    let diff: string = "";
    let state: States = States.READY;

    const contract: IChoreography = await ContractUtil.initializeContract(this.props.web3);
    this.subscribeToLogEvents(contract);

    // Get current change values
    timestamp = new Date(await contract.timestamp() * 1000);
    publicKey = await contract.proposer();
    diff = await contract.diff();
    state = await ContractUtil.getContractState(contract);

    const proposer = await User.build(publicKey, "friedow");
    const messages: IMessageHistoryEntry[] = await ContractUtil.getMessageHistory(contract);

    this.setState({
      timestamp,
      diff,
      state,
      proposer,
      messages,
      contract,
    });
  }

  public subscribeToLogEvents(contract: IChoreography) {
    contract.LogNewChange().watch(this.handleLogEvent);
    contract.LogVerificationStarted().watch(this.handleLogEvent);
    contract.LogVerificationDone().watch(this.handleLogEvent);
    contract.LogReviewStarted().watch(this.handleLogEvent);
    contract.LogReviewGiven().watch(this.handleLogEvent);
    contract.LogVoteDistribution().watch(this.handleLogEvent);
    contract.LogReviewDone().watch(this.handleLogEvent);
    contract.LogProposalProcessed().watch(this.handleLogEvent);

    contract.LogNewChange().watch(this.handleLogNewChange);
  }

  public async handleLogEvent(error, result) {
    const state = await ContractUtil.getContractState(this.state.contract);
    const messages = await ContractUtil.getMessageHistory(this.state.contract);
    this.setState({
      state,
      messages,
    });
  }

  public async handleLogNewChange(error, result) {
    const proposerUsername = await this.state.contract.getModelerUsername(result.args._proposer);
    const proposer = await User.build(result.args.proposer, proposerUsername);
    this.setState({
      proposer,
    });
  }

  public clearTitleInput() {
    if (this.state.state === States.READY) {
      this.setState({
        title: "",
      });
    }
  }

  public handleTitleChange(e: React.FormEvent<HTMLParagraphElement>) {
    this.setState({
      title: e.currentTarget.textContent,
    });
  }

  public render() {
    return (
    <div className={changeCardStyles.card}>
      <div className={changeCardStyles.cardLeft}>
        <div className={changeCardStyles.cardContent}>
          <img
            className={changeCardStyles.changedModel}
            src="https://bpmn.io/assets/attachments/blog/2016/019-colors.png"
          />
        </div>

        <div className={changeCardStyles.cardFooter}>
          <StackedDate timestamp={this.state.timestamp} />
          <StackedUser user={this.state.proposer} />
        </div>
      </div>

      <div className={changeCardStyles.cardRight}>
        <p
          contentEditable={this.state.state === States.READY}
          className={changeCardStyles.changeDescription}
          onClick={this.clearTitleInput}
          onChange={this.handleTitleChange}
        >
          {this.state.title}
        </p>
        <MessageHistory messages={this.state.messages} />
        <ContractInteractionWidget
          contract={this.state.contract}
          contractState={this.state.state}
          proposalTitle={this.state.title}
        />
      </div>
    </div>
    );
  }
}
