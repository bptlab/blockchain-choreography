import * as React from "react";
import * as Web3 from "web3";
import getWeb3 from "./util/getWeb3";

const appStyles = require("./App.css");

interface IAppState {
  web3: Web3;
}

class App extends React.Component<{}, IAppState> {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
    };
  }

  public async componentWillMount() {
    const web3 = await getWeb3();
    this.setState({
      web3,
    });
  }

  public render() {
    return (
      <div className={appStyles.app}>
      </div>
    );
  }
}

export default App;
