import * as React from "react";

import IChoreography, { States } from "@/contract-interfaces/IChoreography";
import ButtonWidget from "./ButtonWidget";

const contractInteractionWidgetStyles = require("./ContractInteractionWidget.css");

interface IContractInteractionWidgetProps {
  contract: IChoreography;
  contractState: States;
  proposalTitle: string;
  getDiagramXML: () => string;
}

interface IContractInteractionWidgetState {
  textareaValue: string;
}

export default class ContractInteractionWidget
extends React.Component<IContractInteractionWidgetProps, IContractInteractionWidgetState> {
  constructor(props) {
    super(props);

    this.state = {
      textareaValue: "",
    };

    this.handleProposeChange = this.handleProposeChange.bind(this);
    this.handleProposeCounterproposal = this.handleProposeCounterproposal.bind(this);
  }

  public async handleProposeChange() {
    const proposalXML = await this.props.getDiagramXML();
    this.props.contract.proposeChange(this.props.proposalTitle, proposalXML);
  }

  public async handleProposeCounterproposal() {
    const proposalXML = await this.props.getDiagramXML();
    this.props.contract.proposeConterproposal(proposalXML);
  }

  public renderTextarea(): JSX.Element {
    const placeholderText: string = this.props.contractState !== States.SET_REVIEWERS ?
      "Leave a comment" : "Insert reviewer name";

    return(
      <textarea
        className={contractInteractionWidgetStyles.textarea}
        placeholder={placeholderText}
        value={this.state.textareaValue}
        onChange={(event) => this.onTextareChange(event)}
      />
    );
  }

  public renderButtonWidget(): JSX.Element {
    if (this.state.textareaValue !== "" && this.props.contractState !== States.SET_REVIEWERS) {
      return(
        <ButtonWidget
          firstButtonText="Add Comment"
          firstButtonOnClick={
            () => this.props.contract.proposeChange(this.props.proposalTitle, this.state.textareaValue)
            /* TODO: Call comment function */
          }
        />
      );
    } else if (this.state.textareaValue !== "" && this.props.contractState === States.SET_REVIEWERS) {
      return(
        <ButtonWidget
          firstButtonText="Add Reviewer"
          firstButtonOnClick={async () => {
            const reviewerAddress = await this.props.contract.getModelerAddress(this.state.textareaValue);
            await this.props.contract.addReviewer(reviewerAddress);
            this.setState({
              textareaValue: "",
            });
          }}
        />
      );
    } else if (this.props.contractState === States.READY) {
      return(
        <ButtonWidget
          firstButtonText="Propose Change"
          firstButtonOnClick={this.handleProposeChange}
        />
      );
    } else if (this.props.contractState === States.SET_REVIEWERS) {
      return(
        <ButtonWidget
          firstButtonText="Request Reviews"
          firstButtonOnClick={() => this.props.contract.startVerification()}
        />
      );
    } else if (this.props.contractState === States.WAIT_FOR_REVIEWERS) {
      return(
        <ButtonWidget
          firstButtonText="Approve Changes"
          firstButtonOnClick={() => this.props.contract.approveChange()}
          secondButtonText="Propose Counterproposal"
          secondButtonOnClick={this.handleProposeCounterproposal}
        />
      );
    }
  }

  public render(): JSX.Element {
    return (
      <div className={contractInteractionWidgetStyles.interactionContainer}>
        {this.renderTextarea()}
        {this.renderButtonWidget()}
      </div>
    );
  }

  private onTextareChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    this.setState({
      textareaValue: event.target.value,
    });
  }
}
