"use client";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";

const volumeData = [
  { day: "Mon", volume: 2.4, loans: 1.8, payments: 0.6 },
  { day: "Tue", volume: 4.1, loans: 3.2, payments: 0.9 },
  { day: "Wed", volume: 3.7, loans: 2.5, payments: 1.2 },
  { day: "Thu", volume: 6.2, loans: 4.8, payments: 1.4 },
  { day: "Fri", volume: 5.8, loans: 4.1, payments: 1.7 },
  { day: "Sat", volume: 8.3, loans: 6.4, payments: 1.9 },
  { day: "Sun", volume: 7.1, loans: 5.2, payments: 1.9 },
];

const workflowData = [
  { day: "Mon", completed: 14, rejected: 2, cancelled: 1 },
  { day: "Tue", completed: 23, rejected: 4, cancelled: 2 },
  { day: "Wed", completed: 19, rejected: 3, cancelled: 1 },
  { day: "Thu", completed: 31, rejected: 5, cancelled: 3 },
  { day: "Fri", completed: 28, rejected: 4, cancelled: 2 },
  { day: "Sat", completed: 42, rejected: 6, cancelled: 4 },
  { day: "Sun", completed: 37, rejected: 5, cancelled: 2 },
];

const stateDistribution = [
  { name: "Completed", value: 194, color: "#a855f7" },
  { name: "Pending", value: 24, color: "#fbbf24" },
  { name: "Rejected", value: 29, color: "#ff006e" },
  { name: "Verifying", value: 12, color: "#60a5fa" },
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

const customTooltipStyle = {
  backgroundColor: "#161b27",
  border: "1px solid #1e2535",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
};

function MetricCard({ icon, label, value, change, color }: {
  icon: React.ReactNode; label: string; value: string; change: string; color: string;
}) {
  const positive = change.startsWith("+");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-700 border border-slate-800 rounded-2xl p-6"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-slate-400 text-sm mt-1">{label}</div>
      <div className={`text-xs mt-2 font-mono ${positive ? "text-neon-green" : "text-pink-500"}`}>
        {change} vs last week
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-neon-cyan" /> Analytics
          </h1>
          <p className="text-slate-400 mt-1">Protocol performance and workflow statistics</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard icon={<Activity className="w-5 h-5 text-neon-cyan" />} label="Total Workflows" value="1,247" change="+23.4%" color="bg-neon-cyan/10" />
          <MetricCard icon={<CheckCircle className="w-5 h-5 text-neon-green" />} label="Approval Rate" value="84.3%" change="+5.2%" color="bg-neon-green/10" />
          <MetricCard icon={<Clock className="w-5 h-5 text-yellow-400" />} label="Avg Settlement" value="2.4s" change="-18%" color="bg-yellow-400/10" />
          <MetricCard icon={<DollarSign className="w-5 h-5 text-neon-purple" />} label="Total Volume" value="127 ETH" change="+41%" color="bg-neon-purple/10" />
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Volume chart */}
          <div className="lg:col-span-2 bg-dark-700 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6">Weekly Volume (ETH)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area type="monotone" dataKey="loans" stroke="#00f5ff" fill="url(#loanGrad)" strokeWidth={2} name="Loans" />
                <Area type="monotone" dataKey="payments" stroke="#a855f7" fill="url(#payGrad)" strokeWidth={2} name="Payments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution */}
          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6">Workflow States</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={stateDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {stateDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {stateDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-white font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Workflow count */}
          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6">Daily Workflow Outcomes</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={workflowData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="completed" fill="#a855f7" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="rejected" fill="#ff006e" radius={[4, 4, 0, 0]} name="Rejected" />
                <Bar dataKey="cancelled" fill="#475569" radius={[4, 4, 0, 0]} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Settlement time */}
          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6">Avg Settlement Time (seconds)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={settlementData}>
                <defs>
                  <linearGradient id="settleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff87" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area type="monotone" dataKey="avg" stroke="#00ff87" fill="url(#settleGrad)" strokeWidth={2} name="Avg (s)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
