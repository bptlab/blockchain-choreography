import * as React from "react";

const stackedDateStyles = require("./StackedDate.css");

interface IStackedDateProps {
  timestamp: Date;
}

export default class StackedDate extends React.Component<IStackedDateProps, {}> {

  public getDay(date: Date): string {
    const options = {
      day: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  }

  public getMonth(date: Date): string {
    const options = {
      month: "long",
    };
    return date.toLocaleDateString(undefined, options);
  }

  public getYear(date: Date): string {
    const options = {
      year: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  }

  public render() {
    return (
      <div className={stackedDateStyles.stackedDate}>

        <div className={stackedDateStyles.stackedDateTop}>

          <div className={stackedDateStyles.stackedDateDay}>
            {this.getDay(this.props.timestamp)}
          </div>

          <div className={stackedDateStyles.stackedDateYear}>
            {this.getYear(this.props.timestamp)}
          </div>

        </div>

        <div className={stackedDateStyles.stackedDateMonth}>
          {this.getMonth(this.props.timestamp)}
        </div>
      </div>
    );
  }
}
