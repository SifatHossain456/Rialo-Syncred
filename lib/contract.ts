export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export function isContractDeployed() {
  return CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
}

export const ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "requestLoan",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "requestPaymentVerification",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "startVerification",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "approveWorkflow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "reason", type: "string" },
    ],
    name: "rejectWorkflow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "cancelWorkflow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositFunds",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getWorkflow",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint8", name: "state", type: "uint8" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
          { internalType: "string", name: "rejectReason", type: "string" },
          { internalType: "bool", name: "isLoan", type: "bool" },
        ],
        internalType: "struct AsyncLending.Workflow",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllWorkflows",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint8", name: "state", type: "uint8" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
          { internalType: "string", name: "rejectReason", type: "string" },
          { internalType: "bool", name: "isLoan", type: "bool" },
        ],
        internalType: "struct AsyncLending.Workflow[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserWorkflows",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "workflowCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "bool", name: "status", type: "bool" },
    ],
    name: "setKYC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "score", type: "uint256" },
    ],
    name: "setCreditScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "bool", name: "isLoan", type: "bool" },
    ],
    name: "WorkflowCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "oldState", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "newState", type: "uint8" },
    ],
    name: "WorkflowStateChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "LoanApproved",
    type: "event",
  },
] as const;

export const STATE_MAP: Record<number, string> = {
  0: "PENDING",
  1: "VERIFYING",
  2: "APPROVED",
  3: "REJECTED",
  4: "COMPLETED",
  5: "CANCELLED",
};
