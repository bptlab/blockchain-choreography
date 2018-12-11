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
  state(): Promise<BigNumber.BigNumber>;
  title(): Promise<string>;
  diff(): Promise<string>;
  proposer(): Promise<string>;
  id(): Promise<BigNumber.BigNumber>;
  timestamp(): Promise<number>;
  getModelerUsername(address: string): Promise<string>;
  getModelerEmail(address: string): Promise<string>;

  LogNewChange(): any; // Return type shpuld be specified

  // public functions
  addModeler(address: string, username: string, email: string): Promise<boolean>;
  proposeChange(title: string, diff: string): Promise<void>;
  addReviewer(address: string): Promise<void>;
  startVerification(): Promise<void>;
  approveReviewers(): Promise<void>;
  rejectReviewers(): Promise<void>;
  approveChange(): Promise<void>;
  rejectChange(): Promise<void>;
}
