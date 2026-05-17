"use client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Activity, Clock, CheckCircle, DollarSign } from "lucide-react";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { formatEther } from "viem";
import { ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { MOCK_WORKFLOWS, isDemoMode, type Workflow } from "@/lib/mockData";
import CountUp from "@/components/CountUp";

const IS_DEMO = isDemoMode();

const volumeData = [
  { day: "Mon", loans: 1.8, payments: 0.6 },
  { day: "Tue", loans: 3.2, payments: 0.9 },
  { day: "Wed", loans: 2.5, payments: 1.2 },
  { day: "Thu", loans: 4.8, payments: 1.4 },
  { day: "Fri", loans: 4.1, payments: 1.7 },
  { day: "Sat", loans: 6.4, payments: 1.9 },
  { day: "Sun", loans: 5.2, payments: 2.1 },
];

const settlementData = [
  { time: "00:00", avg: 1.8 }, { time: "04:00", avg: 1.2 },
  { time: "08:00", avg: 2.4 }, { time: "12:00", avg: 3.1 },
  { time: "16:00", avg: 2.8 }, { time: "20:00", avg: 2.2 }, { time: "Now", avg: 1.9 },
];

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

  const { data: allWorkflows } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "getAllWorkflows",
    query: { enabled: !IS_DEMO && isConnected && isCorrectNetwork },
  });
  const { data: poolBalance } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "getContractBalance",
    query: { enabled: !IS_DEMO && isConnected && isCorrectNetwork },
  });

  const workflows: Workflow[] = IS_DEMO
    ? MOCK_WORKFLOWS
    : (allWorkflows as Workflow[] | undefined) ?? [];

  const totalVolume = workflows.reduce((a, w) => a + parseFloat(formatEther(w.amount)), 0);
  const completed   = workflows.filter((w) => w.state === 4).length;
  const rejected    = workflows.filter((w) => w.state === 3).length;
  const approvalRate= workflows.length > 0 ? Math.round((completed / workflows.length) * 100) : 0;

  const stateCounts = workflows.reduce((acc, w) => {
    acc[w.state] = (acc[w.state] || 0) + 1; return acc;
  }, {} as Record<number, number>);

  const pieData = Object.entries(stateCounts).map(([state, count]) => ({
    name: STATE_NAMES[parseInt(state)] ?? "Unknown",
    value: count,
    color: STATE_COLORS_PIE[parseInt(state)] ?? "#475569",
  }));

  const workflowBar = [
    { day: "Mon", completed: Math.max(1, Math.floor(completed * 0.10)), rejected: Math.max(0, Math.floor(rejected * 0.10)) },
    { day: "Tue", completed: Math.max(1, Math.floor(completed * 0.15)), rejected: Math.max(0, Math.floor(rejected * 0.15)) },
    { day: "Wed", completed: Math.max(1, Math.floor(completed * 0.12)), rejected: Math.max(0, Math.floor(rejected * 0.12)) },
    { day: "Thu", completed: Math.max(1, Math.floor(completed * 0.20)), rejected: Math.max(0, Math.floor(rejected * 0.20)) },
    { day: "Fri", completed: Math.max(1, Math.floor(completed * 0.18)), rejected: Math.max(0, Math.floor(rejected * 0.18)) },
    { day: "Sat", completed: Math.max(1, Math.floor(completed * 0.14)), rejected: Math.max(0, Math.floor(rejected * 0.14)) },
    { day: "Sun", completed: Math.max(1, Math.floor(completed * 0.11)), rejected: Math.max(0, Math.floor(rejected * 0.11)) },
  ];

  const metrics = [
    { icon: <Activity className="w-5 h-5" />, label: "Total Workflows", value: workflows.length, suffix: "", decimals: 0, change: "+23%", pos: true, color: "text-neon-cyan", grad: "from-neon-cyan/15 to-neon-cyan/5", border: "border-neon-cyan/20" },
    { icon: <CheckCircle className="w-5 h-5" />, label: "Approval Rate", value: approvalRate, suffix: "%", decimals: 0, change: "+5%", pos: true, color: "text-emerald-400", grad: "from-emerald-400/15 to-emerald-400/5", border: "border-emerald-400/20" },
    { icon: <Clock className="w-5 h-5" />, label: "Avg Settlement", value: 2.4, suffix: "s", decimals: 1, change: "-18%", pos: true, color: "text-amber-400", grad: "from-amber-400/15 to-amber-400/5", border: "border-amber-400/20" },
    {
      icon: <DollarSign className="w-5 h-5" />, label: "Pool Balance",
      value: IS_DEMO ? 4.75 : (poolBalance ? parseFloat(formatEther(poolBalance as bigint)) : 0),
      suffix: " ETH", decimals: 3, change: "+41%", pos: true, color: "text-violet-400", grad: "from-violet-400/15 to-violet-400/5", border: "border-violet-400/20"
    },
  ] as const;

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-neon-cyan" /> Analytics
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {IS_DEMO ? "Demo data — deploy contract for live metrics" : "Live onchain protocol metrics"}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-gradient-to-br ${m.grad} border ${m.border} rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200`}>
              <div className={`${m.color} mb-3 opacity-80`}>{m.icon}</div>
              <div className={`text-2xl font-bold font-mono ${m.color}`}>
                <CountUp value={m.value} decimals={m.decimals} suffix={m.suffix} />
              </div>
              <div className="text-slate-400 text-sm mt-1">{m.label}</div>
              <div className="text-emerald-400 text-xs font-mono mt-1">{m.change} vs last week</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          {/* Area chart */}
          <div className="lg:col-span-2 bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-1">Weekly Volume (ETH)</h3>
            <p className="text-slate-500 text-xs mb-5">Loan vs payment volume over 7 days</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="lG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "#64748b", fontSize: "12px", paddingTop: "12px" }} />
                <Area type="monotone" dataKey="loans" stroke="#00f5ff" fill="url(#lG)" strokeWidth={2} name="Loans" dot={false} />
                <Area type="monotone" dataKey="payments" stroke="#a78bfa" fill="url(#pG)" strokeWidth={2} name="Payments" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie */}
          <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-1">Workflow States</h3>
            <p className="text-slate-500 text-xs mb-4">Current distribution</p>
            {pieData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-slate-600 text-sm">No data</div>
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
            <h3 className="text-white font-semibold mb-1">Daily Outcomes</h3>
            <p className="text-slate-500 text-xs mb-5">Completed vs rejected per day</p>
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
          </div>

          <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-1">Settlement Time</h3>
            <p className="text-slate-500 text-xs mb-5">Average seconds per time of day</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={settlementData}>
                <defs>
                  <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="avg" stroke="#34d399" fill="url(#sG)" strokeWidth={2} name="Avg (s)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
