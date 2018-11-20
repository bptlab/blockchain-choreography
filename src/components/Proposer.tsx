import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

const ChoreographyContract = TruffleContract(require("../../build/contracts/Choreography.json"));
import IChoreography from "../contract-interfaces/IChoreography";

interface IProposerProps {
  web3: Web3;
}

interface IProposerState {
  account: string;
  accountError: boolean;
  contractAddress: string;
  proposer: string;
}

export default class Proposer extends React.Component<IProposerProps, IProposerState> {
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      accountError: false,
      contractAddress: "",
      proposer: "",
    };
  }

  public async componentWillMount() {
    if (this.props.web3.eth.accounts.length === 0) {
      this.setState({
        account: "",
        accountError: true,
      });
      return;
    }
    ChoreographyContract.setProvider(this.props.web3.currentProvider);
    let instance: IChoreography;
    try {
      instance = await ChoreographyContract.deployed();
    } catch (err) {
      alert(err);
      return;
    }

    console.log(this.props.web3);
    // Works like a charm
    const proposer: string = await instance.getProposer();
    // Errors: invalid address
    await instance.proposeChange("SomeChange");

    this.setState({
      account: this.props.web3.eth.accounts[0],
      accountError: false,
      contractAddress: instance.address,
      proposer,
    });
  }

  public render() {
    return (
    <div>
      <h3>Choreography Contract</h3>
      <p>Contract address: {this.state.contractAddress}</p>
      <p>Account: {this.state.accountError ? "No accounts found" : this.state.account}</p>
      <h3>Current Change</h3>
      <p>Proposer: {this.state.proposer}</p>
    </div>
    );
  }
}
