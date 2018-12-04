import * as React from "react";
import * as TruffleContract from "truffle-contract";
import * as Web3 from "web3";

const ChoreographyContract = TruffleContract(require("../../build/contracts/Choreography.json"));
import IChoreography, { States } from "../contract-interfaces/IChoreography";
import StackedDate from "./StackedDate";
import StackedUser from "./StackedUser";

const changeCardStyles = require("./ChangeCard.css");

interface IProfileInformation {
  username: string;
  avatar_url: string;
  name: string;
  company: string;
}

interface IUserInformation {
  public_key: string;
  profile: IProfileInformation;
}

interface IChangeCardProps {
  web3: Web3;
}

interface IChangeCardState {
  account: string;
  accountError: boolean;
  timestamp: Date;
  proposer: IUserInformation;
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
      proposer: {
        public_key: "",
        profile: {
          username: "",
          avatar_url: "",
          name: "",
          company: "",
        },
      },
      diff: "",
      state: States.READY,
    };
  }

  public async componentWillMount() {
    const instance: IChoreography = await this.initializeContract();

    // Get current change values
    const timestamp: Date = new Date(await instance.timestamp() * 1000);
    const publicKey = await instance.proposer();
    const profile = await this.getGithubProfileInformation("friedow");
    const proposer = {
      public_key: publicKey,
      profile,
    };
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
          <StackedUser githubUsername="friedow" />
        </div>

      </div>

      <div className={changeCardStyles.cardRight}>

        <h1 className={changeCardStyles.changeDescription}>New Design for the current change card</h1>

        <div className={changeCardStyles.changeHistory}>
          <div className={changeCardStyles.changeHistoryEntry}>
            <img
              className={changeCardStyles.changeHistoryEntryAuthorImage}
              src={this.state.proposer.profile.avatar_url}
            />
            <p className={changeCardStyles.changeHistoryEntryDescription}>
              <a
                href={`https://github.com/${this.state.proposer.profile.username}`}
                className={changeCardStyles.changeHistoryEntryAuthorName}
              >
                {this.state.proposer.profile.username}
              </a>
              {` proposed a change to the "Card Design" diagram 4 days ago.`}
            </p>
          </div>
          <div className={changeCardStyles.changeHistoryEntry}>
            <img
              className={changeCardStyles.changeHistoryEntryAuthorImage}
              src="https://github.com/MaximilianV.png"
            />
            <p className={changeCardStyles.changeHistoryEntryDescription}>
              <a
                href={`https://github.com/MaximilianV`}
                className={changeCardStyles.changeHistoryEntryAuthorName}
              >
                MaximilianV
              </a>
              {` approved this change 3 days ago. 👍`}
            </p>
          </div>
          <div className={changeCardStyles.changeHistoryEntry}>
            <img
              className={changeCardStyles.changeHistoryEntryAuthorImage}
              src="https://github.com/bptlab.png"
            />
            <p className={changeCardStyles.changeHistoryEntryDescription}>
              <a
                href={`https://github.com/bptlab`}
                className={changeCardStyles.changeHistoryEntryAuthorName}
              >
                bptlab
              </a>
              {` approved this change just now. 👍`}
            </p>
          </div>
          <div className={changeCardStyles.changeHistoryEntry}>
            <img
              className={changeCardStyles.changeHistoryEntryAuthorImage}
              src="https://github.com/github.png"
            />
            <p className={changeCardStyles.changeHistoryEntryDescription}>
              <a
                href={`https://github.com/choreo-bot`}
                className={changeCardStyles.changeHistoryEntryAuthorName}
              >
                choreo-bot
              </a>
              {` merged this change just now. 🎉`}
            </p>
          </div>
        </div>
      </div>
    </div>
    );
  }
}
