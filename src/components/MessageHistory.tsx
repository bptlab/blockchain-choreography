import * as React from "react";

const messageHistoryStyles = require("./MessageHistory.css");

export interface IMessageHistoryEntry {
  username: string;
  message: string;
  timestamp: Date;
}

interface IMessageHistoryProps {
  messages: IMessageHistoryEntry[];
}

export default class MessageHistory extends React.Component<IMessageHistoryProps, {}> {

  public render() {
    return (
      <div className={messageHistoryStyles.changeHistory}>
        {this.props.messages.forEach((message: IMessageHistoryEntry) =>
          <MessageHistoryEntry message={message} />,
        )}
      </div>
    );
  }
}
