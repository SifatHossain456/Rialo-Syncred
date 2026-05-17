import { formatEther, parseEther } from "viem";

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

const now = BigInt(Math.floor(Date.now() / 1000));

const ADDRESSES = [
  "0xDeA96c363A64d3e831B3ec3bACA1D1B7D50E2A45",
  "0x1A2b3C4d5E6f7A8B9c0D1e2F3a4B5c6D7e8F9a0B",
  "0xaBcDeF1234567890AbCdEf1234567890aBcDeF12",
  "0x9876543210FeDcBa9876543210FeDcBa98765432",
  "0xCafeBabe00000000000000000000000000000001",
  "0xDeAdBeEf00000000000000000000000000000002",
];

export const MOCK_WORKFLOWS: Workflow[] = [
  { id: 1n, user: ADDRESSES[0], amount: parseEther("0.5"),  state: 4, createdAt: now - 3600n, updatedAt: now - 3540n, rejectReason: "", isLoan: true  },
  { id: 2n, user: ADDRESSES[1], amount: parseEther("1.2"),  state: 4, createdAt: now - 7200n, updatedAt: now - 7140n, rejectReason: "", isLoan: true  },
  { id: 3n, user: ADDRESSES[2], amount: parseEther("0.1"),  state: 1, createdAt: now - 300n,  updatedAt: now - 280n,  rejectReason: "", isLoan: false },
  { id: 4n, user: ADDRESSES[3], amount: parseEther("2.0"),  state: 3, createdAt: now - 5400n, updatedAt: now - 5380n, rejectReason: "Credit score too low (380/1000)", isLoan: true },
  { id: 5n, user: ADDRESSES[4], amount: parseEther("0.3"),  state: 0, createdAt: now - 120n,  updatedAt: now - 120n,  rejectReason: "", isLoan: true  },
  { id: 6n, user: ADDRESSES[5], amount: parseEther("0.8"),  state: 4, createdAt: now - 86400n,updatedAt: now - 86350n,rejectReason: "", isLoan: false },
  { id: 7n, user: ADDRESSES[0], amount: parseEther("0.05"), state: 4, createdAt: now - 43200n,updatedAt: now - 43180n,rejectReason: "", isLoan: true  },
  { id: 8n, user: ADDRESSES[1], amount: parseEther("3.0"),  state: 3, createdAt: now - 10800n,updatedAt: now - 10780n,rejectReason: "KYC verification failed", isLoan: true },
  { id: 9n, user: ADDRESSES[2], amount: parseEther("0.15"), state: 1, createdAt: now - 60n,   updatedAt: now - 45n,   rejectReason: "", isLoan: false },
  { id: 10n,user: ADDRESSES[3], amount: parseEther("0.4"),  state: 4, createdAt: now - 21600n,updatedAt: now - 21590n,rejectReason: "", isLoan: true  },
];

export function isDemoMode() {
  return (
    !process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
  );
}

export const MOCK_POOL_BALANCE = parseEther("4.75");
