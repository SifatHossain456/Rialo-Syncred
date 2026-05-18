export type WFState = 0 | 1 | 2 | 3 | 4 | 5;

export interface Workflow {
  id: bigint;
  user: string;
  amount: bigint;
  state: WFState;
  createdAt: bigint;
  updatedAt: bigint;
  rejectReason: string;
  isLoan: boolean;
}
