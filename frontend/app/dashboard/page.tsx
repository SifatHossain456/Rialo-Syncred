"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, XCircle, Loader2, Activity, DollarSign,
  Send, AlertTriangle, Wallet, RefreshCw, Ban, Download,
  ChevronRight, Zap
} from "lucide-react";
import {
  useAccount, useReadContract, useWriteContract,
  useWaitForTransactionReceipt, useChainId
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { ABI, CONTRACT_ADDRESS, STATE_MAP } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { exportWorkflowsCSV } from "@/lib/csvExport";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import CountUp from "@/components/CountUp";
import WorkflowModal from "@/components/WorkflowModal";
import SearchFilter, { FilterState, FilterType } from "@/components/SearchFilter";
import LiveFeed from "@/components/LiveFeed";
import { SkeletonStatCard, SkeletonWorkflowRow } from "@/components/SkeletonCard";

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

const STATE_CONFIG = {
  0: { label: "Pending",    icon: <Clock className="w-3.5 h-3.5" />,                       color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  1: { label: "Verifying",  icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,         color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30" },
  2: { label: "Approved",   icon: <CheckCircle className="w-3.5 h-3.5" />,                  color: "text-neon-green", bg: "bg-neon-green/10 border-neon-green/30" },
  3: { label: "Rejected",   icon: <XCircle className="w-3.5 h-3.5" />,                      color: "text-pink-500",   bg: "bg-pink-500/10 border-pink-500/30" },
  4: { label: "Completed",  icon: <CheckCircle className="w-3.5 h-3.5" />,                  color: "text-neon-purple",bg: "bg-neon-purple/10 border-neon-purple/30" },
  5: { label: "Cancelled",  icon: <Ban className="w-3.5 h-3.5" />,                          color: "text-slate-500",  bg: "bg-slate-700/30 border-slate-600/30" },
};

function StatusBadge({ state }: { state: WFState }) {
  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color} ${cfg.bg}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function timeAgo(ts: bigint) {
  const diff = Math.floor(Date.now() / 1000) - Number(ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fireConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#00f5ff", "#a855f7", "#00ff87"] });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }), 300);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 400);
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = SUPPORTED_CHAINS.some((c) => c.id === chainId);

  const [amount, setAmount] = useState("0.01");
  const [isLoanType, setIsLoanType] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<FilterState>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();
  const [cancelTxHash, setCancelTxHash] = useState<`0x${string}` | undefined>();
  const prevCompletedRef = useRef(0);

  // ── contract reads ──────────────────────────────────────────────
  const { data: allWorkflows, refetch, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllWorkflows",
    query: { enabled: isConnected && isCorrectNetwork },
  });
  const { data: poolBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getContractBalance",
    query: { enabled: isConnected && isCorrectNetwork },
  });

  // ── write + wait ────────────────────────────────────────────────
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: pendingTxHash });
  const { isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({ hash: cancelTxHash });

  // ── auto-refresh every 15 s ─────────────────────────────────────
  const doRefresh = useCallback(async () => {
    await refetch();
    setLastRefreshed(new Date());
  }, [refetch]);

  useAutoRefresh(doRefresh, 15000, autoRefreshEnabled && isConnected && isCorrectNetwork);

  // ── tx effects ──────────────────────────────────────────────────
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Workflow created! Verification starting...");
      refetch();
      setPendingTxHash(undefined);
    }
  }, [isConfirmed, refetch]);

  useEffect(() => {
    if (isCancelConfirmed) {
      toast.success("Workflow cancelled.");
      refetch();
      setCancelTxHash(undefined);
    }
  }, [isCancelConfirmed, refetch]);

  // ── confetti when new completions appear ─────────────────────────
  const workflows = (allWorkflows as Workflow[] | undefined) ?? [];
  useEffect(() => {
    const completed = workflows.filter((w) => w.state === 4).length;
    if (prevCompletedRef.current > 0 && completed > prevCompletedRef.current) fireConfetti();
    prevCompletedRef.current = completed;
  }, [workflows]);

  // ── stats ───────────────────────────────────────────────────────
  const stats = {
    total: workflows.length,
    active: workflows.filter((w) => w.state === 0 || w.state === 1).length,
    completed: workflows.filter((w) => w.state === 4).length,
    pool: poolBalance ? parseFloat(formatEther(poolBalance as bigint)) : 0,
  };

  // ── filter logic ────────────────────────────────────────────────
  const baseList = activeTab === "mine"
    ? workflows.filter((w) => w.user.toLowerCase() === address?.toLowerCase())
    : [...workflows].reverse();

  const displayed = baseList.filter((w) => {
    if (filterType === "loan" && !w.isLoan) return false;
    if (filterType === "payment" && w.isLoan) return false;
    if (filterState !== "all" && w.state !== parseInt(filterState)) return false;
    if (search) {
      const s = search.toLowerCase();
      return w.user.toLowerCase().includes(s) || w.id.toString().includes(s);
    }
    return true;
  });

  // ── actions ─────────────────────────────────────────────────────
  async function handleRequest() {
    if (!isConnected) return toast.error("Connect your wallet first");
    if (!isCorrectNetwork) return toast.error("Switch to Goerli Testnet");
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000")
      return toast.error("Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");

    const toastId = toast.loading("Waiting for signature...");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS, abi: ABI,
        functionName: isLoanType ? "requestLoan" : "requestPaymentVerification",
        args: [parseEther(amount)],
      });
      setPendingTxHash(hash);
      toast.success("Transaction submitted!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.shortMessage || "Transaction failed", { id: toastId });
    }
  }

  async function handleCancel(id: bigint, e: React.MouseEvent) {
    e.stopPropagation();
    const toastId = toast.loading("Cancelling...");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS, abi: ABI,
        functionName: "cancelWorkflow", args: [id],
      });
      setCancelTxHash(hash);
      toast.success("Cancel submitted!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.shortMessage || "Cancel failed", { id: toastId });
    }
  }

  // ── not connected ────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-dark-700 border border-slate-800 rounded-3xl">
          <div className="w-16 h-16 bg-neon-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neon-cyan/20">
            <Wallet className="w-8 h-8 text-neon-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
          <p className="text-slate-400 mb-8 text-sm">Connect on Goerli Testnet to interact with the Syncred protocol.</p>
          <ConnectButton />
          <a href="/faucet" className="block mt-4 text-xs text-neon-cyan/60 hover:text-neon-cyan transition-all">
            Need Goerli ETH? Visit the Faucet Guide →
          </a>
        </motion.div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-dark-700 border border-yellow-500/20 rounded-3xl">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Wrong Network</h2>
          <p className="text-slate-400 mb-6 text-sm">Switch to Goerli or Sepolia Testnet to continue.</p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <WorkflowModal workflow={selectedWf} onClose={() => setSelectedWf(null)} chainId={chainId} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="py-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-slate-500 font-mono text-sm">{address?.slice(0, 8)}...{address?.slice(-6)}</p>
              <span className="text-slate-700 text-xs">·</span>
              <span className="text-slate-600 text-xs">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${
                autoRefreshEnabled
                  ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
                  : "bg-dark-700 border-slate-700 text-slate-500"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefreshEnabled ? "bg-neon-green animate-pulse" : "bg-slate-600"}`} />
              {autoRefreshEnabled ? "Live" : "Paused"}
            </button>
            {/* Manual refresh */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => doRefresh()}
              className="flex items-center gap-2 bg-dark-700 border border-slate-700 text-slate-400 hover:text-white px-3 py-2 rounded-xl text-sm transition-all">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-neon-cyan" : ""}`} />
            </motion.button>
            {/* Export CSV */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => { exportWorkflowsCSV(workflows); toast.success("CSV exported!"); }}
              disabled={workflows.length === 0}
              className="flex items-center gap-2 bg-dark-700 border border-slate-700 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/30 px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-40">
              <Download className="w-4 h-4" /> Export
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isLoading && !workflows.length ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            [
              { icon: <Activity className="w-5 h-5 text-neon-cyan" />, label: "Total", value: stats.total, suffix: "", bg: "bg-neon-cyan/10", decimals: 0 },
              { icon: <Clock className="w-5 h-5 text-yellow-400" />, label: "Active", value: stats.active, suffix: "", bg: "bg-yellow-400/10", decimals: 0 },
              { icon: <CheckCircle className="w-5 h-5 text-neon-green" />, label: "Completed", value: stats.completed, suffix: "", bg: "bg-neon-green/10", decimals: 0 },
              { icon: <DollarSign className="w-5 h-5 text-neon-purple" />, label: "Pool Balance", value: stats.pool, suffix: " ETH", bg: "bg-neon-purple/10", decimals: 4 },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-dark-700 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>{s.icon}</div>
                <div className="text-xl font-bold text-white font-mono">
                  <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </motion.div>
            ))
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column: Request form + Live feed */}
          <div className="space-y-5">
            {/* Request Panel */}
            <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                <Send className="w-5 h-5 text-neon-cyan" /> New Request
              </h2>

              {/* Type toggle */}
              <div className="flex gap-2 mb-4 bg-dark-800 p-1 rounded-xl">
                <button onClick={() => setIsLoanType(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLoanType ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30" : "text-slate-500 hover:text-slate-300"}`}>
                  Loan
                </button>
                <button onClick={() => setIsLoanType(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLoanType ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "text-slate-500 hover:text-slate-300"}`}>
                  Payment
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Amount (ETH)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    step="0.01" min="0.001" max="10"
                    className="w-full bg-dark-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-cyan/50 transition-all"
                    placeholder="0.01" />
                </div>

                {/* Quick amount buttons */}
                <div className="flex gap-2">
                  {["0.01", "0.1", "0.5", "1.0"].map((v) => (
                    <button key={v} onClick={() => setAmount(v)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all border ${amount === v ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30" : "bg-dark-800 text-slate-500 border-slate-700 hover:text-slate-300"}`}>
                      {v}
                    </button>
                  ))}
                </div>

                <div className="bg-dark-800 rounded-xl p-3 space-y-1.5 text-xs border border-slate-800">
                  {[["KYC", "Automated"], ["Credit", "Automated"], ["Settlement", "On approval"]].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-neon-green">{v}</span>
                    </div>
                  ))}
                </div>

                {(isConfirming || isSending) && (
                  <div className="flex items-center gap-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl px-4 py-3">
                    <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
                    <span className="text-neon-cyan text-sm">
                      {isSending ? "Waiting for signature..." : "Confirming on Goerli..."}
                    </span>
                  </div>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleRequest} disabled={isSending || isConfirming}
                  className="w-full bg-neon-cyan text-dark-900 font-bold py-3 rounded-xl hover:bg-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {isSending || isConfirming
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    : <><Send className="w-4 h-4" /> {isLoanType ? "Request Loan" : "Submit Payment"}</>}
                </motion.button>

                {pendingTxHash && (
                  <a href={`https://goerli.etherscan.io/tx/${pendingTxHash}`} target="_blank" rel="noopener noreferrer"
                    className="block text-center text-neon-cyan/60 hover:text-neon-cyan text-xs font-mono transition-all">
                    View on Etherscan ↗
                  </a>
                )}
              </div>
            </div>

            {/* Live Feed */}
            <LiveFeed workflows={workflows} />
          </div>

          {/* Right column: Workflow list */}
          <div className="lg:col-span-2 bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="p-5 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neon-cyan" /> Workflows
                  <span className="text-xs text-slate-600 font-normal font-mono">({displayed.length})</span>
                </h2>
                <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
                  {(["all", "mine"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-500 hover:text-slate-300"}`}>
                      {tab === "mine" ? "My Requests" : "All"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Search + Filter */}
              <SearchFilter
                search={search} onSearch={setSearch}
                filterState={filterState} onFilterState={setFilterState}
                filterType={filterType} onFilterType={setFilterType}
                total={baseList.length} filtered={displayed.length}
              />
            </div>

            {/* Workflow rows */}
            <div className="divide-y divide-slate-800 overflow-y-auto flex-1" style={{ maxHeight: 520 }}>
              {isLoading && !workflows.length ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonWorkflowRow key={i} />)
              ) : displayed.length === 0 ? (
                <div className="p-12 text-center text-slate-600">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No workflows found</p>
                  {(search || filterState !== "all" || filterType !== "all") && (
                    <button onClick={() => { setSearch(""); setFilterState("all"); setFilterType("all"); }}
                      className="mt-2 text-xs text-neon-cyan/60 hover:text-neon-cyan transition-all">
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {displayed.map((wf) => (
                    <motion.div key={`${wf.id}-${wf.state}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedWf(wf)}
                      className="p-4 hover:bg-dark-800/60 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-slate-500 text-xs font-mono">#{wf.id.toString()}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${wf.isLoan ? "text-neon-cyan bg-neon-cyan/10" : "text-neon-purple bg-neon-purple/10"}`}>
                              {wf.isLoan ? "LOAN" : "PAYMENT"}
                            </span>
                            {wf.user.toLowerCase() === address?.toLowerCase() && (
                              <span className="text-xs px-1.5 py-0.5 rounded font-mono text-yellow-400 bg-yellow-400/10">YOU</span>
                            )}
                          </div>
                          <div className="text-slate-400 font-mono text-sm">
                            {wf.user.slice(0, 8)}...{wf.user.slice(-6)}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">{timeAgo(wf.createdAt)}</div>
                          {wf.rejectReason && (
                            <div className="text-xs text-pink-500 mt-1">↳ {wf.rejectReason}</div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                          <div className="text-white font-mono font-semibold">
                            {parseFloat(formatEther(wf.amount)).toFixed(4)} ETH
                          </div>
                          <StatusBadge state={wf.state} />
                          <div className="flex items-center gap-1.5">
                            {wf.state === 0 && wf.user.toLowerCase() === address?.toLowerCase() && (
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                onClick={(e) => handleCancel(wf.id, e)}
                                className="text-xs text-pink-500 hover:text-pink-400 border border-pink-500/30 hover:border-pink-500/60 px-2 py-1 rounded-lg transition-all">
                                Cancel
                              </motion.button>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-all" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer hint */}
            {displayed.length > 0 && (
              <div className="p-3 border-t border-slate-800 text-center text-xs text-slate-600">
                Click any row to see full details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
