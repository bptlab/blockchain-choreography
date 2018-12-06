import * as React from "react";

import DateUtil from "@/util/DateUtil";

const stackedDateStyles = require("./StackedDate.css");

interface IStackedDateProps {
  timestamp: Date;
}

export default class StackedDate extends React.Component<IStackedDateProps, {}> {

  public render() {
    return (
      <div className={stackedDateStyles.stackedDate}>

        <div className={stackedDateStyles.stackedDateTop}>

          <div className={stackedDateStyles.stackedDateDay}>
            {DateUtil.getDay(this.props.timestamp)}
          </div>

          <div className={stackedDateStyles.stackedDateYear}>
            {DateUtil.getYear(this.props.timestamp)}
          </div>

        </div>

        <div className={stackedDateStyles.stackedDateMonth}>
          {DateUtil.getMonth(this.props.timestamp)}
        </div>
      </div>
    );
  }
}
