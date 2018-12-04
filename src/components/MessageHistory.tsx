import * as React from "react";

import User from "../util/User";

const messageHistoryStyles = require("./MessageHistory.css");

export interface IMessageHistoryEntry {
  user: User;
  message: string;
  timestamp: Date;
}

interface IMessageHistoryProps {
  messages: IMessageHistoryEntry[];
}

export default class MessageHistory extends React.Component<IMessageHistoryProps, {}> {

  private static dateToTimeAgo(date: Date): string {
    const currentDate = new Date();
    const secondsAgo = ((currentDate as any) - (date as any)) / 1000;

    if (secondsAgo < 60) {
      return "just now";
    } else if (secondsAgo < 3600) {
      return `${Math.floor(secondsAgo / 60)} minutes ago`;
    } else if (secondsAgo < 86400) {
      return `${Math.floor(secondsAgo / 3600)} hours ago`;
    } else {
      return `${Math.floor(secondsAgo / 86400)} days ago`;
    }
  }

  public render() {
    const messages = this.props.messages.map((message: IMessageHistoryEntry) => {
      return(
        <div key="1" className={messageHistoryStyles.messageHistoryEntry}>
          <img
            className={messageHistoryStyles.messageHistoryEntryAuthorImage}
            src={message.user.github.avatar_url}
          />
          <p className={messageHistoryStyles.messageHistoryEntryDescription}>
            <a
              href={`https://github.com/${message.user.github.username}`}
              className={messageHistoryStyles.messageHistoryEntryAuthorName}
            >
              {message.user.github.username}
            </a>
            {` ${message.message} ${MessageHistory.dateToTimeAgo(message.timestamp)}.`}
          </p>
        </div>
      );
    });

    return (
      <div className={messageHistoryStyles.messageHistory}>
        {messages}
      </div>
    );
  }
}
