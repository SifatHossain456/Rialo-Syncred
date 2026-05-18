"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, XCircle, Loader2, Activity, DollarSign,
  Send, AlertTriangle, Wallet, RefreshCw, Ban, Download, ChevronRight,
} from "lucide-react";
import {
  useAccount, useReadContract, useWriteContract,
  useWaitForTransactionReceipt, useChainId
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { ABI, CONTRACT_ADDRESS, isContractDeployed } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { exportWorkflowsCSV } from "@/lib/csvExport";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import CountUp from "@/components/CountUp";
import WorkflowModal from "@/components/WorkflowModal";
import SearchFilter, { FilterState, FilterType } from "@/components/SearchFilter";
import LiveFeed from "@/components/LiveFeed";
import { SkeletonStatCard, SkeletonWorkflowRow } from "@/components/SkeletonCard";
import { type Workflow } from "@/lib/mockData";
import { useEthPrice, fmtUsd } from "@/hooks/useEthPrice";

const DEPLOYED = isContractDeployed();

const STATE_CONFIG = {
  0: { label: "Pending",   icon: <Clock className="w-3 h-3" />,                        color: "text-amber-400",   bg: "bg-amber-400/10  border-amber-400/25"  },
  1: { label: "Verifying", icon: <Loader2 className="w-3 h-3 animate-spin" />,          color: "text-blue-400",    bg: "bg-blue-400/10   border-blue-400/25"   },
  2: { label: "Approved",  icon: <CheckCircle className="w-3 h-3" />,                   color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25"},
  3: { label: "Rejected",  icon: <XCircle className="w-3 h-3" />,                       color: "text-rose-500",    bg: "bg-rose-500/10   border-rose-500/25"   },
  4: { label: "Completed", icon: <CheckCircle className="w-3 h-3" />,                   color: "text-violet-400",  bg: "bg-violet-400/10 border-violet-400/25" },
  5: { label: "Cancelled", icon: <Ban className="w-3 h-3" />,                           color: "text-slate-500",   bg: "bg-slate-700/30  border-slate-600/25"  },
} as const;

function StatusBadge({ state }: { state: number }) {
  const cfg = STATE_CONFIG[state as keyof typeof STATE_CONFIG] ?? STATE_CONFIG[0];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color} ${cfg.bg}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function timeAgo(ts: bigint) {
  const d = Math.floor(Date.now() / 1000) - Number(ts);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function fireConfetti() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#818cf8", "#c084fc", "#34d399", "#fbbf24"] });
  setTimeout(() => confetti({ particleCount: 50, angle: 60,  spread: 50, origin: { x: 0 } }), 300);
  setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 50, origin: { x: 1 } }), 420);
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = SUPPORTED_CHAINS.some((c) => c.id === chainId);
  const { price: ethPrice } = useEthPrice();

  const [amount, setAmount] = useState("0.01");
  const [isLoanType, setIsLoanType] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<FilterState>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();
  const [cancelTxHash, setCancelTxHash] = useState<`0x${string}` | undefined>();
  const prevCompletedRef = useRef(0);

  /* ── chain reads ─────────────────────────────────── */
  const { data: chainWorkflows, refetch, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllWorkflows",
    query: { enabled: DEPLOYED && isConnected && isCorrectNetwork },
  });
  const { data: poolBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getContractBalance",
    query: { enabled: DEPLOYED && isCorrectNetwork },
  });

  /* ── write ───────────────────────────────────────── */
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: pendingTxHash });
  const { isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({ hash: cancelTxHash });

  /* ── refresh ─────────────────────────────────────── */
  const doRefresh = useCallback(async () => {
    await refetch();
    setLastRefreshed(new Date());
  }, [refetch]);
  useAutoRefresh(doRefresh, 15000, autoRefresh && isConnected && DEPLOYED);

  /* ── tx effects ──────────────────────────────────── */
  useEffect(() => {
    if (isConfirmed) { toast.success("Workflow created! Verification starting..."); refetch(); setPendingTxHash(undefined); }
  }, [isConfirmed, refetch]);
  useEffect(() => {
    if (isCancelConfirmed) { toast.success("Workflow cancelled."); refetch(); setCancelTxHash(undefined); }
  }, [isCancelConfirmed, refetch]);

  const workflows: Workflow[] = (chainWorkflows as Workflow[] | undefined) ?? [];

  /* ── confetti on new completions ─────────────────── */
  useEffect(() => {
    const completed = workflows.filter((w) => w.state === 4).length;
    if (prevCompletedRef.current > 0 && completed > prevCompletedRef.current) fireConfetti();
    prevCompletedRef.current = completed;
  }, [workflows]);

  /* ── stats ───────────────────────────────────────── */
  const pool = poolBalance ? parseFloat(formatEther(poolBalance as bigint)) : 0;

  const stats = {
    total: workflows.length,
    active: workflows.filter((w) => w.state === 0 || w.state === 1).length,
    completed: workflows.filter((w) => w.state === 4).length,
    pool,
  };

  /* ── filter ──────────────────────────────────────── */
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

  /* ── write handlers ──────────────────────────────── */
  async function handleRequest() {
    if (!isConnected) return toast.error("Connect your wallet first");
    if (!isCorrectNetwork) return toast.error("Switch to Goerli Testnet");
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
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
      const hash = await writeContractAsync({ address: CONTRACT_ADDRESS, abi: ABI, functionName: "cancelWorkflow", args: [id] });
      setCancelTxHash(hash);
      toast.success("Cancel submitted!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.shortMessage || "Failed", { id: toastId });
    }
  }

  /* ── contract not deployed ───────────────────────── */
  if (!DEPLOYED) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full p-8 bg-dark-800 border border-slate-700/50 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-400/20">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Contract Not Deployed</h2>
          <p className="text-slate-400 mb-7 text-sm leading-relaxed">
            Set <code className="font-mono text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_CONTRACT_ADDRESS</code> to your deployed contract address, then restart the dev server.
          </p>
          <Link href="/deploy">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-400 transition-all text-sm">
              Follow the Setup Guide
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ── not connected screen ────────────────────────── */
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full p-8 bg-dark-800 border border-slate-700/50 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-400/20">
            <Wallet className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-slate-400 mb-7 text-sm leading-relaxed">Connect on Goerli Testnet to interact with the Syncred protocol.</p>
          <ConnectButton />
          <a href="/faucet" className="block mt-5 text-xs text-slate-500 hover:text-indigo-400 transition-colors">
            Need Goerli ETH? — Faucet Guide
          </a>
        </motion.div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full p-8 bg-dark-800 border border-amber-500/20 rounded-3xl">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Wrong Network</h2>
          <p className="text-slate-400 mb-6 text-sm">Switch to Goerli or Sepolia Testnet to continue.</p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-20">
      <WorkflowModal workflow={selectedWf} onClose={() => setSelectedWf(null)} chainId={chainId} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="py-7 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2 mt-1.5">
              {address && (
                <span className="text-slate-500 font-mono text-xs">{address.slice(0, 10)}...{address.slice(-6)}</span>
              )}
              <span className="text-slate-700 text-xs">·</span>
              <span className="text-slate-600 text-xs">Updated {lastRefreshed.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all font-medium ${
                autoRefresh ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-dark-700 border-slate-700 text-slate-500 hover:text-slate-300"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
              {autoRefresh ? "Live" : "Paused"}
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={doRefresh}
              className="w-9 h-9 flex items-center justify-center bg-dark-700 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-neon-cyan" : ""}`} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { exportWorkflowsCSV(workflows); toast.success("CSV exported!"); }}
              disabled={workflows.length === 0}
              className="flex items-center gap-1.5 bg-dark-700 border border-slate-700 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/30 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-40">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </motion.button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            : ([
                { icon: <Activity className="w-5 h-5" />, label: "Total Workflows", value: stats.total, suffix: "", color: "text-neon-cyan",    grad: "from-neon-cyan/20  to-neon-cyan/5",   border: "border-neon-cyan/20"   },
                { icon: <Clock className="w-5 h-5" />,    label: "Active",          value: stats.active,suffix: "", color: "text-amber-400",  grad: "from-amber-400/20 to-amber-400/5",  border: "border-amber-400/20"  },
                { icon: <CheckCircle className="w-5 h-5" />,label: "Completed",     value: stats.completed,suffix:"",color:"text-emerald-400",grad: "from-emerald-400/20 to-emerald-400/5",border:"border-emerald-400/20"},
                { icon: <DollarSign className="w-5 h-5" />, label: "Pool Balance",  value: stats.pool,  suffix: " ETH", color: "text-violet-400",  grad: "from-violet-400/20 to-violet-400/5",border: "border-violet-400/20"  },
              ] as const).map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`relative overflow-hidden bg-gradient-to-br ${s.grad} border ${s.border} rounded-2xl p-5 group hover:scale-[1.02] transition-all duration-200`}>
                  <div className={`${s.color} mb-3 opacity-80`}>{s.icon}</div>
                  <div className={`text-2xl font-bold font-mono ${s.color}`}>
                    <CountUp value={s.value} decimals={s.suffix === " ETH" ? 3 : 0} suffix={s.suffix} />
                  </div>
                  <div className="text-slate-400 text-sm mt-1">{s.label}</div>
                  {s.suffix === " ETH" && ethPrice && (
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      ≈ {fmtUsd(s.value, ethPrice)}
                    </div>
                  )}
                </motion.div>
              ))
          }
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Left: form + live feed */}
          <div className="space-y-5">
            {/* Request form */}
            <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5 shadow-xl">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-neon-cyan" /> New Request
              </h2>

              {/* Type toggle */}
              <div className="flex gap-1.5 mb-4 bg-dark-900/60 p-1 rounded-xl">
                {([["Loan", true], ["Payment", false]] as const).map(([label, val]) => (
                  <button key={label} onClick={() => setIsLoanType(val)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      isLoanType === val
                        ? val ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/25" : "bg-violet-500/15 text-violet-400 border border-violet-500/25"
                        : "text-slate-500 hover:text-slate-300"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="text-slate-400 text-xs mb-1.5 block font-medium uppercase tracking-wide">Amount (ETH)</label>
                <div className="relative">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    step="0.01" min="0.001" max="10"
                    className="w-full bg-dark-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all pr-20" />
                  {ethPrice && parseFloat(amount) > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono pointer-events-none">
                      {fmtUsd(parseFloat(amount), ethPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {["0.01", "0.1", "0.5", "1.0"].map((v) => (
                  <button key={v} onClick={() => setAmount(v)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                      amount === v ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30" : "bg-dark-900/60 text-slate-500 border-slate-700 hover:text-slate-200 hover:border-slate-600"}`}>
                    {v}
                  </button>
                ))}
              </div>

              {/* Info rows */}
              <div className="bg-dark-900/60 rounded-xl p-3 mb-4 space-y-1.5">
                {[["KYC", "Automated"], ["Credit Check", "Automated"], ["Settlement", "On approval"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-emerald-400 font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {/* Tx status */}
              {(isConfirming || isSending) && (
                <div className="flex items-center gap-2 bg-neon-cyan/8 border border-neon-cyan/20 rounded-xl px-4 py-3 mb-4">
                  <Loader2 className="w-4 h-4 text-neon-cyan animate-spin flex-shrink-0" />
                  <span className="text-neon-cyan text-sm">{isSending ? "Waiting for signature..." : "Confirming on chain..."}</span>
                </div>
              )}

              {/* Submit */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleRequest} disabled={isSending || isConfirming}
                className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-400 active:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20">
                {isSending || isConfirming
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : <><Send className="w-4 h-4" /> {isLoanType ? "Request Loan" : "Verify Payment"}</>}
              </motion.button>

              {pendingTxHash && (
                <a href={`https://goerli.etherscan.io/tx/${pendingTxHash}`} target="_blank" rel="noopener noreferrer"
                  className="block text-center text-neon-cyan/50 hover:text-neon-cyan text-xs font-mono mt-3 transition-all">
                  View on Etherscan
                </a>
              )}
            </div>

            {/* Live feed */}
            <LiveFeed workflows={workflows} />
          </div>

          {/* Right: workflow list */}
          <div className="lg:col-span-2 bg-dark-800 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neon-cyan" />
                  Workflows
                  <span className="text-slate-600 font-normal text-sm font-mono">({displayed.length})</span>
                </h2>
                <div className="flex gap-1 bg-dark-900/60 border border-slate-700/50 rounded-xl p-1">
                  {(["all", "mine"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/25" : "text-slate-500 hover:text-slate-300"}`}>
                      {tab === "mine" ? "My Requests" : "All"}
                    </button>
                  ))}
                </div>
              </div>
              <SearchFilter
                search={search} onSearch={setSearch}
                filterState={filterState} onFilterState={setFilterState}
                filterType={filterType} onFilterType={setFilterType}
                total={baseList.length} filtered={displayed.length}
              />
            </div>

            {/* Rows */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 520 }}>
              {isLoading ? (
                <div className="divide-y divide-slate-800">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonWorkflowRow key={i} />)}
                </div>
              ) : displayed.length === 0 ? (
                <div className="p-14 text-center">
                  <Activity className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <p className="text-slate-500 text-sm">
                    {workflows.length === 0 ? "No workflows submitted yet." : "No workflows match your filters."}
                  </p>
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
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={() => setSelectedWf(wf)}
                      className="px-5 py-4 hover:bg-dark-700/40 transition-all cursor-pointer group border-b border-slate-800/60 last:border-0">
                      <div className="flex items-center gap-3">
                        {/* Left info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-slate-500 text-xs font-mono">#{wf.id.toString()}</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${wf.isLoan ? "text-neon-cyan bg-neon-cyan/10" : "text-violet-400 bg-violet-400/10"}`}>
                              {wf.isLoan ? "LOAN" : "PAYMENT"}
                            </span>
                            {wf.user.toLowerCase() === address?.toLowerCase() && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded font-semibold text-amber-400 bg-amber-400/10">YOU</span>
                            )}
                          </div>
                          <div className="text-slate-300 font-mono text-sm truncate">
                            {wf.user.slice(0, 10)}...{wf.user.slice(-6)}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">{timeAgo(wf.createdAt)}</div>
                          {wf.rejectReason && (
                            <div className="text-xs text-rose-400/80 mt-1 truncate">↳ {wf.rejectReason}</div>
                          )}
                        </div>

                        {/* Right: amount + badge */}
                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                          <div className="text-white font-mono font-bold text-sm">
                            {parseFloat(formatEther(wf.amount)).toFixed(4)}
                            <span className="text-slate-500 font-normal text-xs ml-1">ETH</span>
                          </div>
                          {ethPrice && (
                            <div className="text-xs text-slate-600 font-mono">
                              {fmtUsd(parseFloat(formatEther(wf.amount)), ethPrice)}
                            </div>
                          )}
                          <StatusBadge state={wf.state} />
                          <div className="flex items-center gap-1.5">
                            {wf.state === 0 && wf.user.toLowerCase() === address?.toLowerCase() && (
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                onClick={(e) => handleCancel(wf.id, e)}
                                className="text-[11px] text-rose-500 hover:text-rose-400 border border-rose-500/25 hover:border-rose-500/50 px-2 py-1 rounded-lg transition-all">
                                Cancel
                              </motion.button>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {displayed.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-800/60 text-xs text-slate-600 text-center">
                Click any row to view full details and execution timeline
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
