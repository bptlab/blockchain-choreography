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

  // getter
  state(): Promise<States>;
  diff(): Promise<string>;
  proposer(): Promise<string>;
  id(): Promise<BigNumber.BigNumber>;
  reviewers(): Promise<string[]>;

  // public functions
  proposeChange(diff: string): Promise<void>;
  addReviewer(address: string): Promise<void>;
  startVerification(): Promise<void>;
  verificateListOfReviewers(): Promise<void>;
  validateApprove(): Promise<boolean>;
  validateReject(): Promise<void>;
}
