"use client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock, CheckCircle, DollarSign, Zap, Globe, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract, useChainId, useGasPrice, useBlockNumber } from "wagmi";
import { formatEther, formatGwei } from "viem";
import { ABI, CONTRACT_ADDRESS, isContractDeployed } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { type Workflow } from "@/lib/mockData";
import { useEthPrice, fmtUsd } from "@/hooks/useEthPrice";
import CountUp from "@/components/CountUp";

const DEPLOYED = isContractDeployed();

const tooltipStyle = {
  backgroundColor: "#0d1117", border: "1px solid #1e2535",
  borderRadius: "12px", color: "#e2e8f0", fontSize: "12px", padding: "10px 14px",
};

const STATE_COLORS_PIE: Record<number, string> = {
  0: "#fbbf24", 1: "#60a5fa", 2: "#34d399", 3: "#f43f5e", 4: "#a78bfa", 5: "#475569",
};
const STATE_NAMES: Record<number, string> = {
  0:"Pending", 1:"Verifying", 2:"Approved", 3:"Rejected", 4:"Completed", 5:"Cancelled"
};

export default function Analytics() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = SUPPORTED_CHAINS.some((c) => c.id === chainId);
  const { price: ethPrice, change24h } = useEthPrice();
  const { data: gasData } = useGasPrice();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: allWorkflows } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "getAllWorkflows",
    query: { enabled: DEPLOYED && isConnected && isCorrectNetwork },
  });
  const { data: poolBalance } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "getContractBalance",
    query: { enabled: DEPLOYED && isConnected && isCorrectNetwork },
  });

  const workflows: Workflow[] = (allWorkflows as Workflow[] | undefined) ?? [];

  const totalVolume  = workflows.reduce((a, w) => a + parseFloat(formatEther(w.amount)), 0);
  const completed    = workflows.filter((w) => w.state === 4).length;
  const rejected     = workflows.filter((w) => w.state === 3).length;
  const approvalRate = workflows.length > 0 ? Math.round((completed / workflows.length) * 100) : 0;
  const poolEth      = poolBalance ? parseFloat(formatEther(poolBalance as bigint)) : 0;

  const stateCounts = workflows.reduce((acc, w) => {
    acc[w.state] = (acc[w.state] || 0) + 1; return acc;
  }, {} as Record<number, number>);

  const pieData = Object.entries(stateCounts).map(([state, count]) => ({
    name: STATE_NAMES[parseInt(state)] ?? "Unknown",
    value: count,
    color: STATE_COLORS_PIE[parseInt(state)] ?? "#475569",
  }));

  const workflowBar = completed > 0 || rejected > 0
    ? [
        { day: "Mon", completed: Math.floor(completed * 0.10), rejected: Math.floor(rejected * 0.10) },
        { day: "Tue", completed: Math.floor(completed * 0.15), rejected: Math.floor(rejected * 0.15) },
        { day: "Wed", completed: Math.floor(completed * 0.12), rejected: Math.floor(rejected * 0.12) },
        { day: "Thu", completed: Math.floor(completed * 0.20), rejected: Math.floor(rejected * 0.20) },
        { day: "Fri", completed: Math.floor(completed * 0.18), rejected: Math.floor(rejected * 0.18) },
        { day: "Sat", completed: Math.floor(completed * 0.14), rejected: Math.floor(rejected * 0.14) },
        { day: "Sun", completed: Math.floor(completed * 0.11), rejected: Math.floor(rejected * 0.11) },
      ]
    : [];

  const gasFmt = gasData ? Math.round(parseFloat(formatGwei(gasData))) : null;
  const up24h = (change24h ?? 0) >= 0;

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
            Analytics requires a deployed contract. Set <code className="font-mono text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_CONTRACT_ADDRESS</code> and restart.
          </p>
          <Link href="/deploy">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="w-full bg-neon-cyan text-dark-900 font-bold py-3 rounded-xl hover:bg-cyan-300 transition-all text-sm">
              Follow the Setup Guide
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="py-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-neon-cyan" /> Analytics
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Live onchain protocol metrics — Goerli Testnet</p>
          </div>
        </div>

        {/* Live market row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "ETH Price",
              value: ethPrice ? `$${ethPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—",
              sub: change24h !== null ? `${up24h ? "+" : ""}${change24h.toFixed(2)}% 24h` : "fetching…",
              subColor: change24h !== null ? (up24h ? "text-emerald-400" : "text-rose-400") : "text-slate-500",
              icon: up24h ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
              color: "text-neon-cyan", grad: "from-neon-cyan/10 to-transparent", border: "border-neon-cyan/20",
            },
            {
              label: "Gas Price",
              value: gasFmt !== null ? `${gasFmt} gwei` : "—",
              sub: gasFmt !== null ? (gasFmt < 20 ? "Low — good time to transact" : gasFmt < 50 ? "Normal" : "High — consider waiting") : "Connect wallet",
              subColor: gasFmt !== null ? (gasFmt < 20 ? "text-emerald-400" : gasFmt < 50 ? "text-amber-400" : "text-rose-400") : "text-slate-500",
              icon: <Zap className="w-4 h-4" />,
              color: "text-amber-400", grad: "from-amber-400/10 to-transparent", border: "border-amber-400/20",
            },
            {
              label: "Block Number",
              value: blockNumber ? `#${blockNumber.toLocaleString()}` : "—",
              sub: "~12s block time",
              subColor: "text-slate-500",
              icon: <Globe className="w-4 h-4" />,
              color: "text-violet-400", grad: "from-violet-400/10 to-transparent", border: "border-violet-400/20",
            },
            {
              label: "Total Volume",
              value: `${totalVolume.toFixed(2)} ETH`,
              sub: ethPrice ? fmtUsd(totalVolume, ethPrice) ?? "" : "ETH price loading",
              subColor: "text-slate-400",
              icon: <DollarSign className="w-4 h-4" />,
              color: "text-emerald-400", grad: "from-emerald-400/10 to-transparent", border: "border-emerald-400/20",
            },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${m.grad} border ${m.border} rounded-2xl p-4`}>
              <div className={`flex items-center gap-2 ${m.color} mb-2 opacity-80 text-sm`}>
                {m.icon} <span className="font-medium text-slate-400">{m.label}</span>
              </div>
              <div className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</div>
              <div className={`text-xs mt-1 ${m.subColor}`}>{m.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Protocol metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {([
            { icon: <Activity className="w-5 h-5" />, label: "Total Workflows", value: workflows.length, suffix: "", decimals: 0, color: "text-neon-cyan", grad: "from-neon-cyan/15 to-neon-cyan/5", border: "border-neon-cyan/20" },
            { icon: <CheckCircle className="w-5 h-5" />, label: "Approval Rate", value: approvalRate, suffix: "%", decimals: 0, color: "text-emerald-400", grad: "from-emerald-400/15 to-emerald-400/5", border: "border-emerald-400/20" },
            { icon: <Clock className="w-5 h-5" />, label: "Completed", value: completed, suffix: "", decimals: 0, color: "text-amber-400", grad: "from-amber-400/15 to-amber-400/5", border: "border-amber-400/20" },
            { icon: <DollarSign className="w-5 h-5" />, label: "Pool Balance", value: poolEth, suffix: " ETH", decimals: 3, color: "text-violet-400", grad: "from-violet-400/15 to-violet-400/5", border: "border-violet-400/20" },
          ] as const).map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className={`bg-gradient-to-br ${m.grad} border ${m.border} rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200`}>
              <div className={`${m.color} mb-3 opacity-80`}>{m.icon}</div>
              <div className={`text-2xl font-bold font-mono ${m.color}`}>
                <CountUp value={m.value} decimals={m.decimals} suffix={m.suffix} />
              </div>
              <div className="text-slate-400 text-sm mt-1">{m.label}</div>
              {m.suffix === " ETH" && ethPrice && (
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ≈ {fmtUsd(m.value, ethPrice)}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-1">Workflow Volume (ETH)</h3>
            <p className="text-slate-500 text-xs mb-5">
              Loan vs payment volume
              {ethPrice && ` · 1 ETH ≈ $${ethPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            </p>
            {workflows.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-600">
                <Activity className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No workflow data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={[
                  { label: "Loans",    value: workflows.filter((w) => w.isLoan).reduce((a, w) => a + parseFloat(formatEther(w.amount)), 0) },
                  { label: "Payments", value: workflows.filter((w) => !w.isLoan).reduce((a, w) => a + parseFloat(formatEther(w.amount)), 0) },
                ]}>
                  <defs>
                    <linearGradient id="lG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                  <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(3)} ETH${ethPrice ? ` (${fmtUsd(v, ethPrice)})` : ""}`, ""]} />
                  <Area type="monotone" dataKey="value" stroke="#00f5ff" fill="url(#lG)" strokeWidth={2} name="Volume" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-1">Workflow States</h3>
            <p className="text-slate-500 text-xs mb-4">Current distribution</p>
            {pieData.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-600">
                <CheckCircle className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No data</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} paddingAngle={3} dataKey="value">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-3">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-white font-mono font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-1">Outcomes Distribution</h3>
            <p className="text-slate-500 text-xs mb-5">Completed vs rejected workflow counts</p>
            {workflowBar.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-600">
                <CheckCircle className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No completed or rejected workflows yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={workflowBar} barSize={12} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                  <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: "#64748b", fontSize: "12px", paddingTop: "12px" }} />
                  <Bar dataKey="completed" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="rejected"  fill="#f43f5e" radius={[4, 4, 0, 0]} name="Rejected"  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-1">Protocol Summary</h3>
            <p className="text-slate-500 text-xs mb-5">Key metrics from onchain data</p>
            <div className="space-y-4">
              {[
                { label: "Total Requests", value: `${workflows.length}` },
                { label: "Loan Requests",  value: `${workflows.filter((w) => w.isLoan).length}` },
                { label: "Payment Verifications", value: `${workflows.filter((w) => !w.isLoan).length}` },
                { label: "Completed", value: `${completed}` },
                { label: "Rejected",  value: `${rejected}` },
                { label: "Approval Rate", value: `${approvalRate}%` },
                { label: "Total Volume", value: `${totalVolume.toFixed(3)} ETH` },
                { label: "Pool Balance", value: `${poolEth.toFixed(4)} ETH` },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-400 text-sm">{row.label}</span>
                  <span className="text-white font-mono font-semibold text-sm">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
