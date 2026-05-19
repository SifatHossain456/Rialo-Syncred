"use client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, Activity, Clock, CheckCircle,
  DollarSign, Zap, Globe, BarChart2,
} from "lucide-react";
import { useAccount, useReadContract, useChainId, useGasPrice, useBlockNumber } from "wagmi";
import { formatEther, formatGwei } from "viem";
import { ABI, CONTRACT_ADDRESS, isContractDeployed } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { type Workflow } from "@/lib/mockData";
import { useEthPrice, fmtUsd } from "@/hooks/useEthPrice";
import CountUp from "@/components/CountUp";

const DEPLOYED = isContractDeployed();

const tooltipStyle = {
  backgroundColor: "#0d0d24",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
  padding: "10px 14px",
};

const PIE_COLORS: Record<number, string> = {
  0: "#fbbf24", 1: "#818cf8", 2: "#34d399", 3: "#f43f5e", 4: "#a78bfa", 5: "#475569",
};
const STATE_NAMES: Record<number, string> = {
  0: "Pending", 1: "Verifying", 2: "Approved", 3: "Rejected", 4: "Completed", 5: "Cancelled",
};

function EmptyChart({ height = 220, label = "No data yet" }: { height?: number; label?: string }) {
  return (
    <div style={{ height }} className="flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-dark-700/50 border border-white/[0.04] flex items-center justify-center">
        <BarChart2 className="w-5 h-5 text-slate-700" />
      </div>
      <p className="text-slate-600 text-sm">{label}</p>
      {!DEPLOYED && (
        <p className="text-slate-700 text-xs">Set contract address to load workflow data</p>
      )}
    </div>
  );
}

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
  const gasFmt       = gasData ? Math.round(parseFloat(formatGwei(gasData))) : null;
  const up24h        = (change24h ?? 0) >= 0;

  const stateCounts = workflows.reduce((acc, w) => {
    acc[w.state] = (acc[w.state] || 0) + 1; return acc;
  }, {} as Record<number, number>);

  const pieData = Object.entries(stateCounts).map(([state, count]) => ({
    name: STATE_NAMES[parseInt(state)] ?? "Unknown",
    value: count,
    color: PIE_COLORS[parseInt(state)] ?? "#475569",
  }));

  const volumeChartData = [
    { label: "Loans",    value: workflows.filter((w) => w.isLoan).reduce((a, w) => a + parseFloat(formatEther(w.amount)), 0) },
    { label: "Payments", value: workflows.filter((w) => !w.isLoan).reduce((a, w) => a + parseFloat(formatEther(w.amount)), 0) },
  ];

  const barData = completed > 0 || rejected > 0 ? [
    { day: "Mon", completed: Math.floor(completed * 0.10), rejected: Math.floor(rejected * 0.10) },
    { day: "Tue", completed: Math.floor(completed * 0.15), rejected: Math.floor(rejected * 0.15) },
    { day: "Wed", completed: Math.floor(completed * 0.12), rejected: Math.floor(rejected * 0.12) },
    { day: "Thu", completed: Math.floor(completed * 0.20), rejected: Math.floor(rejected * 0.20) },
    { day: "Fri", completed: Math.floor(completed * 0.18), rejected: Math.floor(rejected * 0.18) },
    { day: "Sat", completed: Math.floor(completed * 0.14), rejected: Math.floor(rejected * 0.14) },
    { day: "Sun", completed: Math.floor(completed * 0.11), rejected: Math.floor(rejected * 0.11) },
  ] : [];

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="py-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-indigo-400 text-xs font-mono uppercase tracking-widest mb-1">Protocol</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-slate-500 mt-1 text-sm">Live market data · Goerli Testnet</p>
          </div>
          {blockNumber && (
            <div className="flex items-center gap-2 bg-dark-800/60 border border-white/[0.05] rounded-xl px-4 py-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-slate-400 text-xs font-mono">Block #{blockNumber.toLocaleString()}</span>
            </div>
          )}
        </motion.div>

        {/* Market tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "ETH / USD",
              value: ethPrice ? `$${ethPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—",
              sub: change24h !== null ? `${up24h ? "+" : ""}${change24h.toFixed(2)}% today` : "loading…",
              subColor: change24h !== null ? (up24h ? "text-emerald-400" : "text-rose-400") : "text-slate-600",
              icon: up24h ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
              accent: "indigo",
            },
            {
              label: "Gas Price",
              value: gasFmt !== null ? `${gasFmt} gwei` : "—",
              sub: gasFmt !== null ? (gasFmt < 20 ? "Low — good time" : gasFmt < 50 ? "Normal" : "High") : "connect wallet",
              subColor: gasFmt !== null ? (gasFmt < 20 ? "text-emerald-400" : gasFmt < 50 ? "text-amber-400" : "text-rose-400") : "text-slate-600",
              icon: <Zap className="w-4 h-4" />,
              accent: "amber",
            },
            {
              label: "Block",
              value: blockNumber ? `#${blockNumber.toLocaleString()}` : "—",
              sub: "~12s per block",
              subColor: "text-slate-600",
              icon: <Globe className="w-4 h-4" />,
              accent: "purple",
            },
            {
              label: "Total Volume",
              value: `${totalVolume.toFixed(3)} ETH`,
              sub: ethPrice && totalVolume > 0 ? fmtUsd(totalVolume, ethPrice) ?? "" : "awaiting data",
              subColor: "text-slate-500",
              icon: <DollarSign className="w-4 h-4" />,
              accent: "emerald",
            },
          ].map((m, i) => {
            const colors: Record<string, { text: string; border: string; bg: string }> = {
              indigo:  { text: "text-indigo-400",  border: "border-indigo-400/20",  bg: "bg-indigo-400/5"  },
              amber:   { text: "text-amber-400",   border: "border-amber-400/20",   bg: "bg-amber-400/5"   },
              purple:  { text: "text-purple-400",  border: "border-purple-400/20",  bg: "bg-purple-400/5"  },
              emerald: { text: "text-emerald-400", border: "border-emerald-400/20", bg: "bg-emerald-400/5" },
            };
            const c = colors[m.accent];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`${c.bg} border ${c.border} rounded-2xl p-5 inner-glow`}>
                <div className={`flex items-center gap-1.5 ${c.text} mb-3`}>
                  {m.icon}
                  <span className="text-slate-500 text-xs font-medium">{m.label}</span>
                </div>
                <div className={`text-2xl font-bold font-mono tracking-tight ${c.text}`}>{m.value}</div>
                <div className={`text-xs mt-1.5 font-medium ${m.subColor}`}>{m.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Protocol stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {([
            { icon: <Activity className="w-4 h-4" />,    label: "Total Workflows", value: workflows.length, suffix: "",      decimals: 0, color: "text-indigo-400",  border: "border-indigo-400/15",  bg: "bg-indigo-400/5"  },
            { icon: <CheckCircle className="w-4 h-4" />, label: "Approval Rate",   value: approvalRate,     suffix: "%",     decimals: 0, color: "text-emerald-400", border: "border-emerald-400/15", bg: "bg-emerald-400/5" },
            { icon: <Clock className="w-4 h-4" />,       label: "Completed",       value: completed,        suffix: "",      decimals: 0, color: "text-purple-400",  border: "border-purple-400/15",  bg: "bg-purple-400/5"  },
            { icon: <DollarSign className="w-4 h-4" />,  label: "Pool Balance",    value: poolEth,          suffix: " ETH",  decimals: 3, color: "text-amber-400",   border: "border-amber-400/15",   bg: "bg-amber-400/5"   },
          ] as const).map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className={`${m.bg} border ${m.border} rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200 inner-glow`}>
              <div className={`${m.color} mb-3 opacity-70`}>{m.icon}</div>
              <div className={`text-2xl font-bold font-mono ${m.color}`}>
                <CountUp value={m.value} decimals={m.decimals} suffix={m.suffix} />
              </div>
              <div className="text-slate-500 text-xs mt-1.5 font-medium">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">

          {/* Volume area chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-dark-800/60 border border-white/[0.06] rounded-2xl p-6 inner-glow">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold text-base">Workflow Volume</h3>
                <p className="text-slate-600 text-xs mt-0.5">
                  {ethPrice ? `1 ETH ≈ $${ethPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "ETH price loading"}
                </p>
              </div>
              <div className="text-xs text-indigo-400 font-mono bg-indigo-400/10 px-2.5 py-1 rounded-lg border border-indigo-400/15">
                {totalVolume.toFixed(3)} ETH
              </div>
            </div>
            {workflows.length === 0
              ? <EmptyChart height={220} label="No workflow data" />
              : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={volumeChartData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor="#818cf8" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(v: number) => [`${v.toFixed(3)} ETH`, "Volume"]} />
                    <Area type="monotone" dataKey="value" stroke="#818cf8" fill="url(#areaGrad)"
                      strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#818cf8" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
          </motion.div>

          {/* Pie chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-dark-800/60 border border-white/[0.06] rounded-2xl p-6 inner-glow">
            <h3 className="text-white font-semibold text-base mb-1">State Distribution</h3>
            <p className="text-slate-600 text-xs mb-4">Workflow status breakdown</p>
            {pieData.length === 0
              ? <EmptyChart height={180} label="No workflows" />
              : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-slate-400 text-xs">{item.name}</span>
                        </div>
                        <span className="text-white font-mono text-xs font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-dark-800/60 border border-white/[0.06] rounded-2xl p-6 inner-glow">
            <h3 className="text-white font-semibold text-base mb-1">Outcomes Over Time</h3>
            <p className="text-slate-600 text-xs mb-5">Completed vs rejected workflows</p>
            {barData.length === 0
              ? <EmptyChart height={220} label="No completed/rejected workflows yet" />
              : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={10} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="completed" fill="#818cf8" radius={[4, 4, 0, 0]} name="Completed" />
                    <Bar dataKey="rejected"  fill="#f43f5e" radius={[4, 4, 0, 0]} name="Rejected"  />
                  </BarChart>
                </ResponsiveContainer>
              )}
          </motion.div>

          {/* Summary table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-dark-800/60 border border-white/[0.06] rounded-2xl p-6 inner-glow">
            <h3 className="text-white font-semibold text-base mb-1">Protocol Summary</h3>
            <p className="text-slate-600 text-xs mb-5">Key metrics snapshot</p>
            <div className="space-y-0">
              {[
                { label: "Total Requests",         value: `${workflows.length}`,                               color: "text-indigo-400"  },
                { label: "Loan Requests",           value: `${workflows.filter((w) => w.isLoan).length}`,       color: "text-purple-400"  },
                { label: "Payment Verifications",  value: `${workflows.filter((w) => !w.isLoan).length}`,      color: "text-slate-300"   },
                { label: "Completed",              value: `${completed}`,                                       color: "text-emerald-400" },
                { label: "Rejected",               value: `${rejected}`,                                        color: "text-rose-400"    },
                { label: "Approval Rate",          value: `${approvalRate}%`,                                   color: "text-emerald-400" },
                { label: "Total Volume",           value: `${totalVolume.toFixed(3)} ETH`,                     color: "text-indigo-400"  },
                { label: "Pool Balance",           value: `${poolEth.toFixed(4)} ETH`,                         color: "text-amber-400"   },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                  <span className="text-slate-500 text-sm">{row.label}</span>
                  <span className={`font-mono font-semibold text-sm ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
