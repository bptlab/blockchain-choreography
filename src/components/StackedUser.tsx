import * as React from "react";

import User from "@/util/User";

const stackedUserStyles = require("./StackedUser.css");

interface IStackedUserProps {
  user: User;
}

export default class StackedUser extends React.Component<IStackedUserProps, {}> {

  public render() {
    return (
      <div className={stackedUserStyles.stackedUser}>
        <p className={stackedUserStyles.stackedUserName}>
          {this.props.user.github.name ? this.props.user.github.name : this.props.user.github.username}
        </p>
        <img
          className={stackedUserStyles.stackedUserImage}
          src={this.props.user.github.avatar_url}
        />
      </div>
    );
  }
}
