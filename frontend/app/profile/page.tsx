"use client";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useChainId, useBalance } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  User, Wallet, TrendingUp, CheckCircle, XCircle, Clock,
  Ban, Activity, ExternalLink, Copy, Check
} from "lucide-react";
import { useState } from "react";
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

const STATE_COLORS: Record<number, string> = {
  0: "text-yellow-400",
  1: "text-blue-400",
  2: "text-neon-green",
  3: "text-pink-500",
  4: "text-neon-purple",
  5: "text-slate-500",
};

const STATE_BG: Record<number, string> = {
  0: "bg-yellow-400/10 border-yellow-400/30",
  1: "bg-blue-400/10 border-blue-400/30",
  2: "bg-neon-green/10 border-neon-green/30",
  3: "bg-pink-500/10 border-pink-500/30",
  4: "bg-neon-purple/10 border-neon-purple/30",
  5: "bg-slate-700/30 border-slate-600/30",
};

function timeAgo(ts: bigint) {
  const diff = Math.floor(Date.now() / 1000) - Number(ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = SUPPORTED_CHAINS.some((c) => c.id === chainId);
  const [copied, setCopied] = useState(false);

  // ETH balance
  const { data: balance } = useBalance({ address });

  // User's workflow IDs
  const { data: userWfIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getUserWorkflows",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isCorrectNetwork },
  });

  // All workflows to filter user's
  const { data: allWorkflows } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllWorkflows",
    query: { enabled: isConnected && isCorrectNetwork },
  });

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const workflows = ((allWorkflows as Workflow[]) ?? []).filter(
    (w) => w.user.toLowerCase() === address?.toLowerCase()
  );

  const stats = {
    total: workflows.length,
    loans: workflows.filter((w) => w.isLoan).length,
    payments: workflows.filter((w) => !w.isLoan).length,
    completed: workflows.filter((w) => w.state === 4).length,
    rejected: workflows.filter((w) => w.state === 3).length,
    totalBorrowed: workflows
      .filter((w) => w.isLoan && w.state === 4)
      .reduce((acc, w) => acc + parseFloat(formatEther(w.amount)), 0),
    approvalRate: workflows.length > 0
      ? Math.round((workflows.filter((w) => w.state === 4).length / workflows.length) * 100)
      : 0,
  };

  // Credit score (deterministic mock based on wallet + on-chain activity)
  const creditScore = address
    ? Math.min(1000, 400 + (parseInt(address.slice(-4), 16) % 400) + stats.completed * 20)
    : 0;
  const creditLevel = creditScore >= 750 ? "Excellent" : creditScore >= 600 ? "Good" : creditScore >= 450 ? "Fair" : "Poor";
  const creditColor = creditScore >= 750 ? "text-neon-green" : creditScore >= 600 ? "text-neon-cyan" : creditScore >= 450 ? "text-yellow-400" : "text-pink-500";

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-10 bg-dark-700 border border-slate-800 rounded-3xl max-w-sm"
        >
          <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connect to view profile</h2>
          <p className="text-slate-400 mb-6 text-sm">Your credit score and loan history will appear here.</p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 mt-1">Your onchain credit identity</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Wallet card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-700 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 border border-neon-cyan/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <div className="text-white font-semibold">Wallet</div>
                <div className="text-xs text-slate-500 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>
            </div>
            <button
              onClick={copyAddress}
              className="w-full flex items-center justify-between bg-dark-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-slate-400 hover:text-white hover:border-slate-600 transition-all group"
            >
              <span>{address?.slice(0, 14)}...{address?.slice(-8)}</span>
              {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4 group-hover:text-neon-cyan transition-all" />}
            </button>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">Balance</span>
              <span className="text-white font-mono font-semibold">
                {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : "—"} {balance?.symbol}
              </span>
            </div>
            <a
              href={`https://goerli.etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-xs text-neon-cyan/60 hover:text-neon-cyan transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View on Etherscan
            </a>
          </motion.div>

          {/* Credit Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-700 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-neon-purple" />
              <span className="text-white font-semibold">Credit Score</span>
            </div>
            <div className={`text-6xl font-bold font-mono ${creditColor} mb-1`}>{creditScore}</div>
            <div className={`text-sm font-semibold ${creditColor} mb-4`}>{creditLevel}</div>
            {/* Score bar */}
            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(creditScore / 1000) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-neon-green"
              />
            </div>
            <div className="grid grid-cols-3 text-xs text-slate-600 text-center">
              <span>300</span><span>650</span><span>1000</span>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Complete more workflows to improve your score.
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-700 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-neon-cyan" />
              <span className="text-white font-semibold">Activity</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Requests", value: stats.total, icon: <Activity className="w-4 h-4 text-neon-cyan" /> },
                { label: "Loans", value: stats.loans, icon: <TrendingUp className="w-4 h-4 text-neon-purple" /> },
                { label: "Completed", value: stats.completed, icon: <CheckCircle className="w-4 h-4 text-neon-green" /> },
                { label: "Rejected", value: stats.rejected, icon: <XCircle className="w-4 h-4 text-pink-500" /> },
                { label: "Approval Rate", value: `${stats.approvalRate}%`, icon: <TrendingUp className="w-4 h-4 text-yellow-400" /> },
                { label: "Total Borrowed", value: `${stats.totalBorrowed.toFixed(3)} ETH`, icon: <Wallet className="w-4 h-4 text-neon-cyan" /> },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">{s.icon} {s.label}</div>
                  <span className="text-white font-mono text-sm font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Workflow history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-white font-semibold">My Workflow History</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {workflows.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No workflows yet. Request a loan from the Dashboard.</p>
              </div>
            ) : (
              [...workflows].reverse().map((wf) => (
                <div key={wf.id.toString()} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500 text-xs font-mono">#{wf.id.toString()}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${wf.isLoan ? "text-neon-cyan bg-neon-cyan/10" : "text-neon-purple bg-neon-purple/10"}`}>
                        {wf.isLoan ? "LOAN" : "PAYMENT"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{timeAgo(wf.createdAt)}</div>
                    {wf.rejectReason && <div className="text-xs text-pink-500 mt-0.5">{wf.rejectReason}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono font-semibold mb-1.5">
                      {parseFloat(formatEther(wf.amount)).toFixed(4)} ETH
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATE_BG[wf.state]} ${STATE_COLORS[wf.state]}`}>
                      {STATE_MAP[wf.state]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
