import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

const ChoreographyContract = TruffleContract(require("../../build/contracts/Choreography.json"));
import IChoreography, { States } from "../contract-interfaces/IChoreography";

interface IChangeCardProps {
  web3: Web3;
}

interface IChangeCardState {
  account: string;
  accountError: boolean;
  timestamp: Date;
  proposer: string;
  diff: string;
  state: States;
}

export default class ChangeCard extends React.Component<IChangeCardProps, IChangeCardState> {
  constructor(props) {
    super(props);

    this.state = {
      account: "",
      accountError: false,
      timestamp: new Date(),
      proposer: "",
      diff: "",
      state: States.READY,
    };
  }

  public async componentWillMount() {
    const instance: IChoreography = await this.initializeContract();

    // Get current change values
    const timestamp: Date = new Date(await instance.timestamp() * 1000);
    const proposer: string = await instance.proposer();
    const diff: string = await instance.diff();
    const state: States = await instance.state();

    this.setState({
      account: this.props.web3.eth.accounts[0],
      accountError: false,
      timestamp,
      proposer,
      diff,
      state,
    });
  }

  public async initializeContract(): Promise<IChoreography> {
    if (this.props.web3.eth.accounts.length === 0) {
      this.setState({
        account: "",
        accountError: true,
      });
      return;
    }

    // Initialize contract
    ChoreographyContract.setProvider(this.props.web3.currentProvider);
    ChoreographyContract.defaults({
      from: this.props.web3.eth.accounts[0],
      gas: 1000000,
    });

    // Initialize contract instance
    let instance: IChoreography;
    try {
      instance = await ChoreographyContract.deployed();
    } catch (err) {
      alert(err);
      return;
    }
    return instance;
  }

  public localeDateString(date: Date): string {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  }

  public render() {
    return (
    <div>
      <h3>Choreography Contract</h3>
      <p>Account: {this.state.accountError ? "No accounts found" : this.state.account}</p>
      <h3>Current Change</h3>
      <p>Proposer: {this.state.proposer}</p>
      <p>Timestamp: {this.localeDateString(this.state.timestamp)}</p>
      <p>Diff: {this.state.diff}</p>
      <p>state: {this.state.state.toString()}</p>
    </div>
    );
  }
}
