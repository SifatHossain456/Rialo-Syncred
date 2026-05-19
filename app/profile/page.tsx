"use client";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useChainId, useBalance } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {
  User, Wallet, TrendingUp, CheckCircle, XCircle,
  Clock, Activity, ExternalLink, Copy, Check,
} from "lucide-react";
import { useState } from "react";
import { ABI, CONTRACT_ADDRESS, isContractDeployed } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { type Workflow } from "@/lib/mockData";
import { useEthPrice, fmtUsd } from "@/hooks/useEthPrice";

const DEPLOYED = isContractDeployed();

const STATE_MAP: Record<number, string> = {
  0: "PENDING", 1: "VERIFYING", 2: "APPROVED", 3: "REJECTED", 4: "COMPLETED", 5: "CANCELLED",
};
const STATE_COLOR: Record<number, string> = {
  0: "text-amber-400  bg-amber-400/8  border-amber-400/20",
  1: "text-indigo-400 bg-indigo-400/8 border-indigo-400/20",
  2: "text-emerald-400 bg-emerald-400/8 border-emerald-400/20",
  3: "text-rose-400   bg-rose-400/8   border-rose-400/20",
  4: "text-purple-400 bg-purple-400/8  border-purple-400/20",
  5: "text-slate-500  bg-slate-700/20  border-slate-600/20",
};

function timeAgo(ts: bigint) {
  const d = Math.floor(Date.now() / 1000) - Number(ts);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = SUPPORTED_CHAINS.some((c) => c.id === chainId);
  const [copied, setCopied] = useState(false);

  const { data: balance } = useBalance({ address });
  const { price: ethPrice } = useEthPrice();

  const { data: allWorkflows } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "getAllWorkflows",
    query: { enabled: DEPLOYED && isConnected && isCorrectNetwork },
  });

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const workflows: Workflow[] = ((allWorkflows as Workflow[]) ?? []).filter(
    (w) => w.user.toLowerCase() === address?.toLowerCase()
  );

  const stats = {
    total:        workflows.length,
    loans:        workflows.filter((w) => w.isLoan).length,
    completed:    workflows.filter((w) => w.state === 4).length,
    rejected:     workflows.filter((w) => w.state === 3).length,
    totalBorrowed: workflows.filter((w) => w.isLoan && w.state === 4)
      .reduce((acc, w) => acc + parseFloat(formatEther(w.amount)), 0),
    approvalRate: workflows.length > 0
      ? Math.round((workflows.filter((w) => w.state === 4).length / workflows.length) * 100) : 0,
  };

  const creditScore = address
    ? Math.min(1000, 400 + (parseInt(address.slice(-4), 16) % 400) + stats.completed * 20) : 0;
  const creditLevel =
    creditScore >= 750 ? "Excellent" : creditScore >= 600 ? "Good" : creditScore >= 450 ? "Fair" : "Poor";
  const creditColor =
    creditScore >= 750 ? "text-emerald-400" : creditScore >= 600 ? "text-indigo-400" :
    creditScore >= 450 ? "text-amber-400" : "text-rose-400";
  const creditBarColor =
    creditScore >= 750 ? "from-emerald-400 to-emerald-300" :
    creditScore >= 600 ? "from-indigo-400 to-indigo-300" :
    creditScore >= 450 ? "from-amber-400 to-amber-300" : "from-rose-400 to-rose-300";

  const explorerBase = chainId === 11155111
    ? "https://sepolia.etherscan.io" : "https://goerli.etherscan.io";

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center p-10 bg-dark-800/60 border border-white/[0.06] rounded-3xl max-w-sm inner-glow">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-400/15">
            <User className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connect to view profile</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Your credit score and workflow history will appear here.
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  const balEth = balance ? parseFloat(formatEther(balance.value)) : 0;

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="py-8">
          <p className="text-indigo-400 text-xs font-mono uppercase tracking-widest mb-1">Account</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
          <p className="text-slate-500 mt-1 text-sm">Your onchain credit identity</p>
        </motion.div>

        {/* Top 3 cards */}
        <div className="grid lg:grid-cols-3 gap-4 mb-5">

          {/* Wallet card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800/60 border border-white/[0.06] rounded-2xl p-6 inner-glow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/15 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Wallet</div>
                <div className="text-slate-600 text-xs font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>
            </div>

            {/* Copy address */}
            <button onClick={copyAddress}
              className="w-full flex items-center justify-between bg-dark-900/60 border border-white/[0.05] hover:border-white/[0.10] rounded-xl px-4 py-3 text-xs font-mono text-slate-400 hover:text-white transition-all group mb-4">
              <span className="truncate mr-2">{address?.slice(0, 22)}...</span>
              {copied
                ? <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                : <Copy className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-indigo-400 transition-colors" />}
            </button>

            {/* Balance */}
            {balance && (
              <div className="bg-dark-900/40 border border-white/[0.04] rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-xs">Balance</span>
                  <div className="text-right">
                    <div className="text-white font-mono font-semibold text-sm">
                      {balEth.toFixed(4)} {balance.symbol}
                    </div>
                    {ethPrice && (
                      <div className="text-slate-600 text-xs font-mono">
                        ≈ {fmtUsd(balEth, ethPrice)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <a href={`${explorerBase}/address/${address}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-400 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> View on Etherscan
            </a>
          </motion.div>

          {/* Credit score */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="bg-dark-800/60 border border-white/[0.06] rounded-2xl p-6 inner-glow">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold text-sm">Credit Score</span>
            </div>

            <div className={`text-6xl font-bold font-mono ${creditColor} mb-1 leading-none tracking-tight`}>
              {creditScore}
            </div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${creditColor} mb-5 opacity-70`}>
              {creditLevel}
            </div>

            {/* Score bar */}
            <div className="w-full h-1.5 bg-dark-900 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(creditScore / 1000) * 100}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${creditBarColor}`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-700 font-mono mb-5">
              <span>300</span><span>650</span><span>1000</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Approval Rate", value: `${stats.approvalRate}%` },
                { label: "Loans Taken",   value: `${stats.loans}` },
              ].map((s) => (
                <div key={s.label} className="bg-dark-900/50 border border-white/[0.04] rounded-xl p-3 text-center">
                  <div className="text-white font-bold font-mono text-lg">{s.value}</div>
                  <div className="text-slate-600 text-[10px] mt-0.5 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-dark-800/60 border border-white/[0.06] rounded-2xl p-6 inner-glow">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-white font-semibold text-sm">Activity</span>
            </div>
            <div className="space-y-0">
              {[
                { label: "Total Requests",  value: stats.total,                          icon: <Activity className="w-3.5 h-3.5 text-indigo-400" />,  color: "text-indigo-400"  },
                { label: "Completed Loans", value: stats.completed,                      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />, color: "text-emerald-400" },
                { label: "Rejected",        value: stats.rejected,                       icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,      color: "text-rose-400"    },
                { label: "Total Borrowed",  value: `${stats.totalBorrowed.toFixed(3)} ETH`, icon: <Wallet className="w-3.5 h-3.5 text-purple-400" />,    color: "text-purple-400"  },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">{s.icon}{s.label}</div>
                  <span className={`font-mono font-semibold text-sm ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Workflow history */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-dark-800/60 border border-white/[0.06] rounded-2xl overflow-hidden inner-glow">
          <div className="px-6 py-5 border-b border-white/[0.05]">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Workflow History
            </h2>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {workflows.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 bg-dark-700/50 border border-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No workflows yet</p>
                <p className="text-slate-600 text-xs mt-1">
                  {!DEPLOYED
                    ? "Set NEXT_PUBLIC_CONTRACT_ADDRESS to load history"
                    : "Submit a loan or payment request from the Dashboard"}
                </p>
                <Link href="/dashboard">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="mt-5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-500/15 transition-all">
                    Go to Dashboard →
                  </motion.button>
                </Link>
              </div>
            ) : (
              [...workflows].reverse().map((wf) => (
                <motion.div key={wf.id.toString()}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-slate-600 text-xs font-mono">#{wf.id.toString()}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                        wf.isLoan ? "text-indigo-400 bg-indigo-400/10" : "text-purple-400 bg-purple-400/10"
                      }`}>
                        {wf.isLoan ? "LOAN" : "PAYMENT"}
                      </span>
                    </div>
                    <div className="text-slate-600 text-xs">{timeAgo(wf.createdAt)}</div>
                    {wf.rejectReason && (
                      <div className="text-xs text-rose-400/70 mt-0.5">{wf.rejectReason}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono font-bold text-sm mb-1">
                      {parseFloat(formatEther(wf.amount)).toFixed(4)}
                      <span className="text-slate-600 font-normal text-xs ml-1">ETH</span>
                    </div>
                    {ethPrice && (
                      <div className="text-slate-600 text-xs font-mono mb-1.5">
                        {fmtUsd(parseFloat(formatEther(wf.amount)), ethPrice)}
                      </div>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATE_COLOR[wf.state]}`}>
                      {STATE_MAP[wf.state]}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
