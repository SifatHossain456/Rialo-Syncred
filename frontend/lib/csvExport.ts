import { formatEther } from "viem";

type WFState = 0 | 1 | 2 | 3 | 4 | 5;

interface Workflow {
  id: bigint;
  user: string;
  amount: bigint;
  state: WFState;
  createdAt: bigint;
  updatedAt: bigint;
  rejectReason: string;
  isLoan: boolean;
}

const STATE_MAP: Record<number, string> = {
  0: "PENDING", 1: "VERIFYING", 2: "APPROVED",
  3: "REJECTED", 4: "COMPLETED", 5: "CANCELLED",
};

function formatTs(ts: bigint): string {
  return new Date(Number(ts) * 1000).toISOString();
}

export function exportWorkflowsCSV(workflows: Workflow[], filename = "syncred-workflows.csv") {
  const headers = [
    "ID", "User Address", "Amount (ETH)", "Type", "Status",
    "Reject Reason", "Created At", "Updated At", "Processing Time (s)"
  ];

  const rows = workflows.map((wf) => [
    wf.id.toString(),
    wf.user,
    parseFloat(formatEther(wf.amount)).toFixed(6),
    wf.isLoan ? "LOAN" : "PAYMENT",
    STATE_MAP[wf.state] ?? "UNKNOWN",
    wf.rejectReason || "",
    formatTs(wf.createdAt),
    formatTs(wf.updatedAt),
    wf.updatedAt > wf.createdAt ? String(Number(wf.updatedAt - wf.createdAt)) : "0",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
