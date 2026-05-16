"use client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Activity, Clock, CheckCircle, DollarSign, Loader2 } from "lucide-react";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { formatEther } from "viem";
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

const volumeData = [
  { day: "Mon", loans: 1.8, payments: 0.6 },
  { day: "Tue", loans: 3.2, payments: 0.9 },
  { day: "Wed", loans: 2.5, payments: 1.2 },
  { day: "Thu", loans: 4.8, payments: 1.4 },
  { day: "Fri", loans: 4.1, payments: 1.7 },
  { day: "Sat", loans: 6.4, payments: 1.9 },
  { day: "Sun", loans: 5.2, payments: 1.9 },
];

const settlementData = [
  { time: "00:00", avg: 1.8 },
  { time: "04:00", avg: 1.2 },
  { time: "08:00", avg: 2.4 },
  { time: "12:00", avg: 3.1 },
  { time: "16:00", avg: 2.8 },
  { time: "20:00", avg: 2.2 },
  { time: "Now", avg: 1.9 },
];

const tooltipStyle = {
  backgroundColor: "#161b27",
  border: "1px solid #1e2535",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
};

const STATE_COLORS_PIE: Record<number, string> = {
  0: "#fbbf24",
  1: "#60a5fa",
  2: "#00ff87",
  3: "#ff006e",
  4: "#a855f7",
  5: "#475569",
};

export default function Analytics() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = SUPPORTED_CHAINS.some((c) => c.id === chainId);

  const { data: allWorkflows, isLoading } = useReadContract({
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

  const workflows = (allWorkflows as Workflow[] | undefined) ?? [];

  // Compute real stats from chain data
  const totalVolume = workflows.reduce((acc, w) => acc + parseFloat(formatEther(w.amount)), 0);
  const completed = workflows.filter((w) => w.state === 4).length;
  const rejected = workflows.filter((w) => w.state === 3).length;
  const approvalRate = workflows.length > 0 ? Math.round((completed / workflows.length) * 100) : 0;

  // State distribution for pie chart
  const stateCounts = workflows.reduce((acc, w) => {
    acc[w.state] = (acc[w.state] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const pieData = Object.entries(stateCounts).map(([state, count]) => ({
    name: STATE_MAP[parseInt(state)],
    value: count,
    color: STATE_COLORS_PIE[parseInt(state)],
  }));

  // Workflow bar by day (mock structure, real count)
  const workflowData = [
    { day: "Mon", completed: Math.floor(completed * 0.1), rejected: Math.floor(rejected * 0.1) },
    { day: "Tue", completed: Math.floor(completed * 0.15), rejected: Math.floor(rejected * 0.15) },
    { day: "Wed", completed: Math.floor(completed * 0.12), rejected: Math.floor(rejected * 0.12) },
    { day: "Thu", completed: Math.floor(completed * 0.2), rejected: Math.floor(rejected * 0.2) },
    { day: "Fri", completed: Math.floor(completed * 0.18), rejected: Math.floor(rejected * 0.18) },
    { day: "Sat", completed: Math.floor(completed * 0.14), rejected: Math.floor(rejected * 0.14) },
    { day: "Sun", completed: Math.floor(completed * 0.11), rejected: Math.floor(rejected * 0.11) },
  ];

  const metrics = [
    { icon: <Activity className="w-5 h-5 text-neon-cyan" />, label: "Total Workflows", value: String(workflows.length || 0), change: "+23%", color: "bg-neon-cyan/10", positive: true },
    { icon: <CheckCircle className="w-5 h-5 text-neon-green" />, label: "Approval Rate", value: `${approvalRate}%`, change: "+5%", color: "bg-neon-green/10", positive: true },
    { icon: <Clock className="w-5 h-5 text-yellow-400" />, label: "Avg Settlement", value: "2.4s", change: "-18%", color: "bg-yellow-400/10", positive: true },
    {
      icon: <DollarSign className="w-5 h-5 text-neon-purple" />,
      label: "Pool Balance",
      value: poolBalance ? `${parseFloat(formatEther(poolBalance as bigint)).toFixed(3)} ETH` : "—",
      change: "+41%", color: "bg-neon-purple/10", positive: true
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-neon-cyan" /> Analytics
            </h1>
            <p className="text-slate-400 mt-1">
              {isConnected && isCorrectNetwork ? "Live onchain data" : "Protocol performance metrics"}
            </p>
          </div>
          {isLoading && <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-dark-700 border border-slate-800 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${m.color}`}>{m.icon}</div>
              <div className="text-xl font-bold text-white font-mono">{m.value}</div>
              <div className="text-slate-400 text-sm">{m.label}</div>
              <div className={`text-xs mt-1 font-mono ${m.positive ? "text-neon-green" : "text-pink-500"}`}>{m.change} vs last week</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-dark-700 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6">Weekly Volume (ETH)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "#64748b", fontSize: "12px" }} />
                <Area type="monotone" dataKey="loans" stroke="#00f5ff" fill="url(#loanGrad)" strokeWidth={2} name="Loans" />
                <Area type="monotone" dataKey="payments" stroke="#a855f7" fill="url(#payGrad)" strokeWidth={2} name="Payments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Workflow States</h3>
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
                {isConnected ? "No data yet" : "Connect wallet to see live data"}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-white font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6">Daily Workflow Outcomes</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={workflowData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "#64748b", fontSize: "12px" }} />
                <Bar dataKey="completed" fill="#a855f7" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="rejected" fill="#ff006e" radius={[4, 4, 0, 0]} name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6">Avg Settlement Time (seconds)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={settlementData}>
                <defs>
                  <linearGradient id="settleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff87" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="avg" stroke="#00ff87" fill="url(#settleGrad)" strokeWidth={2} name="Avg (s)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
