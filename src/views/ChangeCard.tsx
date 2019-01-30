import * as React from "react";
import * as Web3 from "web3";

import ContractInteractionWidget from "@/components/ContractInteractionWidget";
import DiagramWidget from "@/components/DiagramWidget";
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
  user: User;
  possibleUsers: User[];
  timestamp: Date;
  title: string;
  diff: string;
  state: States;
  messages: IMessageHistoryEntry[];
  contract: IChoreography;
  contractAddress: string;
}

export default class ChangeCard extends React.Component<IChangeCardProps, IChangeCardState> {
  public diagramWidget;

  constructor(props) {
    super(props);

    this.state = {
      user: undefined,
      possibleUsers: [],
      timestamp: new Date(),
      title: "",
      diff: "",
      state: States.READY,
      messages: [],
      contract: undefined,
      contractAddress: "",
    };

    this.handleLogEvent = this.handleLogEvent.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
  }

  public async componentDidMount() {
    const friedow = await User.build(this.props.web3.eth.accounts[0], "friedow");
    const maximilianV = await User.build(this.props.web3.eth.accounts[1], "MaximilianV");
    const possibleUsers = [friedow, maximilianV];
    this.setState({
      possibleUsers,
    });
  }

  public async newContract() {
    const contract: IChoreography = await ContractUtil.initializeContract(this.props.web3);
    this.state.possibleUsers.forEach((user) => {
      contract.addModeler(user.publicKey, user.github.username, user.github.username);
    });
    await this.updateContractInformation(contract);
  }

  public async loadContract(address: string) {
    const contract: IChoreography = await ContractUtil.loadContract(this.props.web3, address);
    await this.updateContractInformation(contract);
  }

  public async updateContractInformation(contract: IChoreography) {
    let timestamp: Date = new Date();
    let diff: string = "";
    let state: States = States.READY;
    let contractAddress: string = "";
    this.subscribeToLogEvents(contract);

    // Get current change values
    timestamp = new Date(await contract.timestamp() * 1000);
    diff = await contract.diff();
    state = await ContractUtil.getContractState(contract);
    contractAddress = contract.address;
    const messages: IMessageHistoryEntry[] = await ContractUtil.getMessageHistory(contract);

    this.setState({
      timestamp,
      diff,
      state,
      messages,
      contract,
      contractAddress,
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
    contract.LogNewCounterproposal().watch(this.handleLogEvent);
  }

  public async handleLogEvent(error, result) {
    const state = await ContractUtil.getContractState(this.state.contract);
    const messages = await ContractUtil.getMessageHistory(this.state.contract);
    this.setState({
      state,
      messages,
    });
  }

  public handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      title: e.target.value,
    });
  }

  public handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      contractAddress: e.target.value,
    });
  }

  public handleChooseUser(user: User) {
    this.setState({
      user,
    });
  }

  public render() {
    if (!this.state.user) {
      const userList = this.state.possibleUsers.map((user) => {
        return(
          <a key={user.publicKey} onClick={() => this.handleChooseUser(user)}>
            <li>
              <StackedUser user={user} />
            </li>
          </a>
        );
      });

      return(
      <div className={changeCardStyles.card}>
        <ul className={changeCardStyles.userList}>
          {userList}
        </ul>
      </div>
      );
    }
    return (
    <div className={changeCardStyles.card}>
      <div className={changeCardStyles.cardLeft}>
        <div className={changeCardStyles.cardContent}>
        {
          this.state.contract ?
          <DiagramWidget diagramXML={this.state.diff} ref={(instance) => { this.diagramWidget = instance; }} /> :
          <div>
            <button onClick={() => this.newContract()}>Create new model</button>
            <input onChange={this.handleAddressChange} placeholder="Model ID" />
            <button onClick={() => this.loadContract(this.state.contractAddress)}>Load model</button>
          </div>
        }
        </div>

        <div className={changeCardStyles.cardFooter}>
          <StackedDate timestamp={this.state.timestamp} />
          <StackedUser user={this.state.user} />
        </div>
      </div>

      <div className={changeCardStyles.cardRight}>
        <div>
          {this.state.contractAddress}
        </div>
        <input
          disabled={this.state.state !== States.READY}
          className={changeCardStyles.changeDescription}
          onChange={this.handleTitleChange}
          placeholder="Click here to add a title"
          required={true}
        />
        <MessageHistory messages={this.state.messages} />
        <ContractInteractionWidget
          contract={this.state.contract}
          contractState={this.state.state}
          proposalTitle={this.state.title}
          getDiagramXML={() => this.diagramWidget.getDiagramXML()}
        />
      </div>
    </div>
    );
  }
}
