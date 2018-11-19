import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

const DemoContract = TruffleContract(require("../../build/contracts/DemoContract.json"));
import IDemoContract from "../contract-interfaces/IDemoContract";

interface IDemoComponentProps {
  web3: Web3;
}

interface IDemoComponentState {
  account: string;
  accountError: boolean;
}

export default class DemoComponent extends React.Component<IDemoComponentProps, IDemoComponentState> {
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      accountError: false,
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
    DemoContract.setProvider(this.props.web3.currentProvider);
    let instance: IDemoContract;
    try {
      instance = await DemoContract.deployed();
    } catch (err) {
      alert(err);
      return;
    }
  }

  public render() {
    return (
    <div>
      <h3>DemoContract</h3>
      <p>Account: {this.state.accountError ? "No accounts found" : this.state.account}</p>
    </div>
    );
  }
}
