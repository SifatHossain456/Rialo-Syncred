export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatEth(wei: string | number) {
  const n = typeof wei === "string" ? parseFloat(wei) : wei;
  return n.toFixed(4) + " ETH";
}

export function timeAgo(timestamp: number) {
  const diff = Date.now() / 1000 - timestamp;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const STATE_LABELS: Record<number, string> = {
  0: "PENDING",
  1: "VERIFYING",
  2: "APPROVED",
  3: "REJECTED",
  4: "COMPLETED",
  5: "CANCELLED",
};

export const STATE_COLORS: Record<number, string> = {
  0: "status-pending",
  1: "status-verifying",
  2: "status-approved",
  3: "status-rejected",
  4: "status-completed",
  5: "status-rejected",
};
