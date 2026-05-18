"use client";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useChainId, useBalance } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { User, Wallet, TrendingUp, CheckCircle, XCircle, Clock, Activity, ExternalLink, Copy, Check, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ABI, CONTRACT_ADDRESS, isContractDeployed } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { type Workflow } from "@/lib/mockData";
import { useEthPrice, fmtUsd } from "@/hooks/useEthPrice";

const DEPLOYED = isContractDeployed();

const STATE_MAP: Record<number, string> = { 0:"PENDING",1:"VERIFYING",2:"APPROVED",3:"REJECTED",4:"COMPLETED",5:"CANCELLED" };
const STATE_COLOR: Record<number, string> = {
  0:"text-amber-400 bg-amber-400/10 border-amber-400/25",
  1:"text-blue-400 bg-blue-400/10 border-blue-400/25",
  2:"text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  3:"text-rose-500 bg-rose-500/10 border-rose-500/25",
  4:"text-violet-400 bg-violet-400/10 border-violet-400/25",
  5:"text-slate-500 bg-slate-700/30 border-slate-600/25",
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
    total: workflows.length,
    loans: workflows.filter((w) => w.isLoan).length,
    completed: workflows.filter((w) => w.state === 4).length,
    rejected: workflows.filter((w) => w.state === 3).length,
    totalBorrowed: workflows.filter((w) => w.isLoan && w.state === 4)
      .reduce((acc, w) => acc + parseFloat(formatEther(w.amount)), 0),
    approvalRate: workflows.length > 0
      ? Math.round((workflows.filter((w) => w.state === 4).length / workflows.length) * 100) : 0,
  };

  const creditScore = address
    ? Math.min(1000, 400 + (parseInt(address.slice(-4), 16) % 400) + stats.completed * 20)
    : 0;
  const creditLevel = creditScore >= 750 ? "Excellent" : creditScore >= 600 ? "Good" : creditScore >= 450 ? "Fair" : "Poor";
  const creditColor = creditScore >= 750 ? "text-emerald-400" : creditScore >= 600 ? "text-neon-cyan" : creditScore >= 450 ? "text-amber-400" : "text-rose-500";
  const creditBarColor = creditScore >= 750 ? "from-emerald-400 to-emerald-300" : creditScore >= 600 ? "from-neon-cyan to-cyan-300" : creditScore >= 450 ? "from-amber-400 to-amber-300" : "from-rose-500 to-rose-400";

  const explorerUrl = chainId === 11155111 ? "https://sepolia.etherscan.io" : "https://goerli.etherscan.io";

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
            Profile data requires a deployed contract. Set <code className="font-mono text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_CONTRACT_ADDRESS</code> and restart.
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center p-10 bg-dark-800 border border-slate-700/50 rounded-3xl max-w-sm shadow-2xl">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connect to view profile</h2>
          <p className="text-slate-400 mb-6 text-sm">Your credit score and workflow history will appear here.</p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
          <p className="text-slate-400 mt-1 text-sm">Your onchain credit identity</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          {/* Wallet card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan/25 to-violet-500/25 border border-neon-cyan/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <div className="text-white font-semibold">Wallet</div>
                <div className="text-xs text-slate-500 font-mono">{address?.slice(0,6)}...{address?.slice(-4)}</div>
              </div>
            </div>
            <button onClick={copyAddress}
              className="w-full flex items-center justify-between bg-dark-900/70 border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-400 hover:text-white hover:border-slate-600 transition-all group mb-4">
              <span className="truncate mr-2">{address?.slice(0,20)}...</span>
              {copied ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Copy className="w-4 h-4 flex-shrink-0 group-hover:text-neon-cyan" />}
            </button>
            {balance && (
              <div className="flex items-center justify-between text-sm mb-4 bg-dark-900/40 rounded-xl px-4 py-2.5">
                <span className="text-slate-500 text-xs">Balance</span>
                <div className="text-right">
                  <span className="text-white font-mono font-semibold text-sm">
                    {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                  </span>
                  {ethPrice && (
                    <div className="text-xs text-slate-500 font-mono">
                      ≈ {fmtUsd(parseFloat(formatEther(balance.value)), ethPrice)}
                    </div>
                  )}
                </div>
              </div>
            )}
            <a href={`${explorerUrl}/address/${address}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-neon-cyan transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> View on Etherscan
            </a>
          </motion.div>

          {/* Credit score */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              <span className="text-white font-semibold">Credit Score</span>
            </div>
            <div className={`text-6xl font-bold font-mono ${creditColor} mb-1 leading-none`}>{creditScore}</div>
            <div className={`text-sm font-semibold ${creditColor} mb-5`}>{creditLevel}</div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(creditScore / 1000) * 100}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${creditBarColor}`} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 font-mono mb-4">
              <span>300</span><span>650</span><span>1000</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Approval Rate", value: `${stats.approvalRate}%` },
                { label: "Loans Taken",   value: String(stats.loans)     },
              ].map((s) => (
                <div key={s.label} className="bg-dark-900/50 rounded-xl p-2.5 text-center">
                  <div className="text-white font-bold font-mono text-base">{s.value}</div>
                  <div className="text-slate-600 text-[10px] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-5 h-5 text-neon-cyan" />
              <span className="text-white font-semibold">Activity</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Requests",   value: stats.total,    icon: <Activity className="w-4 h-4 text-neon-cyan" /> },
                { label: "Completed Loans",  value: stats.completed,icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
                { label: "Rejected",         value: stats.rejected, icon: <XCircle className="w-4 h-4 text-rose-500" /> },
                { label: "Total Borrowed",   value: `${stats.totalBorrowed.toFixed(3)} ETH`, icon: <Wallet className="w-4 h-4 text-violet-400" /> },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">{s.icon} {s.label}</div>
                  <span className="text-white font-mono font-semibold text-sm">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Workflow history */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="bg-dark-800 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-700/50">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-neon-cyan" /> Workflow History
            </h2>
          </div>
          <div className="divide-y divide-slate-800/60">
            {workflows.length === 0 ? (
              <div className="p-14 text-center text-slate-600">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-sm">No workflows submitted from this wallet yet.</p>
              </div>
            ) : (
              [...workflows].reverse().map((wf) => (
                <div key={wf.id.toString()} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-dark-700/30 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500 text-xs font-mono">#{wf.id.toString()}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${wf.isLoan ? "text-neon-cyan bg-neon-cyan/10" : "text-violet-400 bg-violet-400/10"}`}>
                        {wf.isLoan ? "LOAN" : "PAYMENT"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{timeAgo(wf.createdAt)}</div>
                    {wf.rejectReason && <div className="text-xs text-rose-400/80 mt-0.5">{wf.rejectReason}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono font-bold mb-0.5">
                      {parseFloat(formatEther(wf.amount)).toFixed(4)}
                      <span className="text-slate-500 font-normal text-xs ml-1">ETH</span>
                    </div>
                    {ethPrice && (
                      <div className="text-xs text-slate-500 font-mono mb-1">
                        {fmtUsd(parseFloat(formatEther(wf.amount)), ethPrice)}
                      </div>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATE_COLOR[wf.state]}`}>
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
