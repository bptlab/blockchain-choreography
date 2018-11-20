import * as BigNumber from "bignumber.js";

export enum States {
  READY,                 // 0 (default) | Aenderungsset kann gepushed werden
  SET_REVIEWERS,         // 1 |
  WAIT_FOR_VERIFICATORS, // 2
  WAIT_FOR_REVIEWERS,    // 3
  REJECTED,              // 4
}

export default interface IChoreography {
  address: string;
  state: States;
  diff: string;
  id: BigNumber.BigNumber;
  reviewers: string[];
  proposer: string;

  getProposer(): Promise<string>;
  proposeChange(diff: string): Promise<void>;
  addReviewer(address: string): Promise<void>;
  startVerification(): Promise<void>;
  verificateListOfReviewers(): Promise<void>;
  validateApprove(): Promise<boolean>;
  validateReject(): Promise<void>;
}
