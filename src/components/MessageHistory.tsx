import * as React from "react";

import DateUtil from "@/util/DateUtil";
import User from "@/util/User";

const messageHistoryStyles = require("./MessageHistory.css");

export interface IMessageHistoryEntry {
  hash: string;
  user: User;
  message: string;
  timestamp: Date;
}

interface IMessageHistoryProps {
  messages: IMessageHistoryEntry[];
}

export default class MessageHistory extends React.Component<IMessageHistoryProps, {}> {

  public render() {
    const messages = this.props.messages.map((message: IMessageHistoryEntry, index: number) => {
      return(
        <div key={index} className={messageHistoryStyles.messageHistoryEntry}>
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
            {` ${message.message} ${DateUtil.dateToTimeAgo(message.timestamp)}.`}
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
