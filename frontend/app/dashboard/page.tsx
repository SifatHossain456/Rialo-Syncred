"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, XCircle, Loader2, Activity,
  DollarSign, Send, AlertTriangle, Wallet, RefreshCw, Ban
} from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";
import { ABI, CONTRACT_ADDRESS, STATE_MAP } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

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
  0: { label: "Pending", icon: <Clock className="w-3.5 h-3.5" />, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  1: { label: "Verifying", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  2: { label: "Approved", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-neon-green", bg: "bg-neon-green/10 border-neon-green/30" },
  3: { label: "Rejected", icon: <XCircle className="w-3.5 h-3.5" />, color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/30" },
  4: { label: "Completed", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-neon-purple", bg: "bg-neon-purple/10 border-neon-purple/30" },
  5: { label: "Cancelled", icon: <Ban className="w-3.5 h-3.5" />, color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/30" },
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
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = SUPPORTED_CHAINS.some((c) => c.id === chainId);

  const [amount, setAmount] = useState("0.01");
  const [isLoanType, setIsLoanType] = useState(true);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();
  const [cancelTxHash, setCancelTxHash] = useState<`0x${string}` | undefined>();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  // Read all workflows
  const { data: allWorkflows, refetch, isLoading: loadingWfs } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllWorkflows",
    query: { enabled: isConnected && isCorrectNetwork },
  });

  // Contract balance
  const { data: poolBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getContractBalance",
    query: { enabled: isConnected && isCorrectNetwork },
  });

  // Write contract
  const { writeContractAsync, isPending: isSending } = useWriteContract();

  // Wait for tx receipts
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: pendingTxHash });
  const { isLoading: isCancelConfirming, isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({ hash: cancelTxHash });

  // Refetch after confirmed
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

  async function handleRequest() {
    if (!isConnected) return toast.error("Connect your wallet first");
    if (!isCorrectNetwork) return toast.error("Switch to Goerli Testnet");
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return toast.error("Contract not deployed yet. Set NEXT_PUBLIC_CONTRACT_ADDRESS.");
    }

    const toastId = toast.loading("Sending transaction...");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: isLoanType ? "requestLoan" : "requestPaymentVerification",
        args: [parseEther(amount)],
      });
      setPendingTxHash(hash);
      toast.success("Transaction submitted!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.shortMessage || err?.message || "Transaction failed", { id: toastId });
    }
  }

  async function handleCancel(id: bigint) {
    const toastId = toast.loading("Cancelling...");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "cancelWorkflow",
        args: [id],
      });
      setCancelTxHash(hash);
      toast.success("Cancel submitted!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.shortMessage || "Cancel failed", { id: toastId });
    }
  }

  const workflows = (allWorkflows as Workflow[] | undefined) ?? [];
  const displayed = activeTab === "mine"
    ? workflows.filter((w) => w.user.toLowerCase() === address?.toLowerCase())
    : [...workflows].reverse();

  const stats = {
    total: workflows.length,
    active: workflows.filter((w) => w.state === 0 || w.state === 1).length,
    completed: workflows.filter((w) => w.state === 4).length,
    pool: poolBalance ? formatEther(poolBalance as bigint) : "0",
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-dark-700 border border-slate-800 rounded-3xl"
        >
          <div className="w-16 h-16 bg-neon-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neon-cyan/20">
            <Wallet className="w-8 h-8 text-neon-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
          <p className="text-slate-400 mb-8">
            Connect your wallet to interact with the Syncred protocol on Goerli Testnet.
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-dark-700 border border-yellow-500/20 rounded-3xl"
        >
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Wrong Network</h2>
          <p className="text-slate-400 mb-6">Switch to Goerli or Sepolia Testnet to continue.</p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="py-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1 font-mono text-sm">
              {address?.slice(0, 8)}...{address?.slice(-6)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-dark-700 border border-slate-700 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loadingWfs ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Activity className="w-5 h-5 text-neon-cyan" />, label: "Total", value: String(stats.total), bg: "bg-neon-cyan/10" },
            { icon: <Clock className="w-5 h-5 text-yellow-400" />, label: "Active", value: String(stats.active), bg: "bg-yellow-400/10" },
            { icon: <CheckCircle className="w-5 h-5 text-neon-green" />, label: "Completed", value: String(stats.completed), bg: "bg-neon-green/10" },
            { icon: <DollarSign className="w-5 h-5 text-neon-purple" />, label: "Pool Balance", value: `${parseFloat(stats.pool).toFixed(3)} ETH`, bg: "bg-neon-purple/10" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-dark-700 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>{s.icon}</div>
              <div className="text-xl font-bold text-white font-mono">{s.value}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Request Panel */}
          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6 h-fit">
            <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <Send className="w-5 h-5 text-neon-cyan" /> New Request
            </h2>

            {/* Type toggle */}
            <div className="flex gap-2 mb-4 bg-dark-800 p-1 rounded-xl">
              <button
                onClick={() => setIsLoanType(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLoanType ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30" : "text-slate-500 hover:text-slate-300"}`}
              >
                Loan Request
              </button>
              <button
                onClick={() => setIsLoanType(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLoanType ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "text-slate-500 hover:text-slate-300"}`}
              >
                Payment Verify
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Amount (ETH)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0.001"
                  max="10"
                  className="w-full bg-dark-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-cyan/50 transition-all"
                  placeholder="0.01"
                />
              </div>

              <div className="bg-dark-800 rounded-xl p-4 space-y-2 text-sm border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span className={isLoanType ? "text-neon-cyan" : "text-neon-purple"}>{isLoanType ? "Loan" : "Payment"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">KYC</span>
                  <span className="text-neon-green">Auto-verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credit Check</span>
                  <span className="text-neon-green">Auto-verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement</span>
                  <span className="text-neon-green">On approval</span>
                </div>
              </div>

              {(isConfirming || isSending) && (
                <div className="flex items-center gap-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl px-4 py-3">
                  <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
                  <span className="text-neon-cyan text-sm">
                    {isSending ? "Waiting for signature..." : "Confirming on Goerli..."}
                  </span>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequest}
                disabled={isSending || isConfirming}
                className="w-full bg-neon-cyan text-dark-900 font-bold py-3 rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSending || isConfirming
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : <><Send className="w-4 h-4" /> {isLoanType ? "Request Loan" : "Submit Payment"}</>
                }
              </motion.button>

              {pendingTxHash && (
                <a
                  href={`https://goerli.etherscan.io/tx/${pendingTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-neon-cyan/70 hover:text-neon-cyan text-xs font-mono transition-all"
                >
                  View on Etherscan ↗
                </a>
              )}
            </div>
          </div>

          {/* Workflow List */}
          <div className="lg:col-span-2 bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-cyan" /> Workflows
              </h2>
              <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
                {(["all", "mine"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    {tab === "mine" ? "My Requests" : "All"}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-800 max-h-[520px] overflow-y-auto">
              {loadingWfs ? (
                <div className="p-12 flex flex-col items-center gap-3 text-slate-600">
                  <Loader2 className="w-8 h-8 animate-spin text-neon-cyan/40" />
                  <p className="text-sm">Loading from blockchain...</p>
                </div>
              ) : displayed.length === 0 ? (
                <div className="p-12 text-center text-slate-600">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No workflows found</p>
                  {activeTab === "mine" && <p className="text-xs mt-1">Submit a loan request to get started</p>}
                </div>
              ) : (
                <AnimatePresence>
                  {displayed.map((wf) => (
                    <motion.div
                      key={wf.id.toString()}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 hover:bg-dark-800/50 transition-all"
                    >
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
                          {wf.state === 0 && wf.user.toLowerCase() === address?.toLowerCase() && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleCancel(wf.id)}
                              disabled={isCancelConfirming}
                              className="text-xs text-pink-500 hover:text-pink-400 border border-pink-500/30 hover:border-pink-500/60 px-2 py-1 rounded-lg transition-all"
                            >
                              Cancel
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
