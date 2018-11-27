import * as React from "react";

const stackedUserStyles = require("./StackedUser.css");

interface IStackedUserProps {
  githubUsername: string;
}

interface IStackedUserState {
  avatar_url: string;
  name: string;
  company: string;
}

export default class StackedUser extends React.Component<IStackedUserProps, IStackedUserState> {
  constructor(props) {
    super(props);

    this.state = {
      avatar_url: "",
      name: "",
      company: "",
    };
  }

  public async componentWillMount() {
    this.getGithubProfileInformation(this.props.githubUsername);
  }

  public async getGithubProfileInformation(username: string) {
    const url = `https://api.github.com/users/${username}`;
    const response = await fetch(url);
    const data = await response.json();
    this.setState({
      avatar_url: data.avatar_url,
      name: data.name,
      company: data.company,
    });
  }

  public render() {
    return (
      <div className={stackedUserStyles.stackedUser}>
        <p className={stackedUserStyles.stackedUserName}>
          {this.state.name ? this.state.name : this.props.githubUsername}
        </p>
        <img
          className={stackedUserStyles.stackedUserImage}
          src={this.state.avatar_url}
        />
      </div>
    );
  }
}
