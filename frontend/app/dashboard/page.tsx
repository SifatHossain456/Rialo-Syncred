"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, XCircle, AlertCircle, RefreshCw,
  Send, Loader2, Activity, DollarSign, TrendingUp, Users
} from "lucide-react";

type WorkflowState = "PENDING" | "VERIFYING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";

interface Workflow {
  id: number;
  user: string;
  amount: string;
  state: WorkflowState;
  isLoan: boolean;
  createdAt: number;
  updatedAt: number;
  rejectReason?: string;
}

const STATE_CONFIG: Record<WorkflowState, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  PENDING: { label: "Pending", icon: <Clock className="w-3.5 h-3.5" />, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  VERIFYING: { label: "Verifying", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  APPROVED: { label: "Approved", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-neon-green", bg: "bg-neon-green/10 border-neon-green/30" },
  REJECTED: { label: "Rejected", icon: <XCircle className="w-3.5 h-3.5" />, color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/30" },
  COMPLETED: { label: "Completed", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-neon-purple", bg: "bg-neon-purple/10 border-neon-purple/30" },
  CANCELLED: { label: "Cancelled", icon: <XCircle className="w-3.5 h-3.5" />, color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/30" },
};

function generateMockWorkflows(): Workflow[] {
  const states: WorkflowState[] = ["PENDING", "VERIFYING", "COMPLETED", "REJECTED", "COMPLETED", "PENDING", "VERIFYING", "COMPLETED"];
  const addresses = [
    "0x1234567890abcdef1234567890abcdef12345678",
    "0xabcdef1234567890abcdef1234567890abcdef12",
    "0x9876543210fedcba9876543210fedcba98765432",
  ];
  return states.map((state, i) => ({
    id: i + 1,
    user: addresses[i % addresses.length],
    amount: (0.1 + Math.random() * 2).toFixed(3),
    state,
    isLoan: i % 3 !== 0,
    createdAt: Math.floor(Date.now() / 1000) - (states.length - i) * 300,
    updatedAt: Math.floor(Date.now() / 1000) - (states.length - i) * 60,
    rejectReason: state === "REJECTED" ? "Credit score too low" : undefined,
  }));
}

function StatusBadge({ state }: { state: WorkflowState }) {
  const cfg = STATE_CONFIG[state];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color} ${cfg.bg}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-700 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-slate-400 text-sm mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </motion.div>
  );
}

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [amount, setAmount] = useState("0.5");
  const [activeTab, setActiveTab] = useState<"all" | "loans" | "payments">("all");
  const [newId, setNewId] = useState<number | null>(null);

  useEffect(() => {
    setWorkflows(generateMockWorkflows());
  }, []);

  const filtered = workflows.filter((w) => {
    if (activeTab === "loans") return w.isLoan;
    if (activeTab === "payments") return !w.isLoan;
    return true;
  });

  const stats = {
    total: workflows.length,
    pending: workflows.filter((w) => w.state === "PENDING" || w.state === "VERIFYING").length,
    completed: workflows.filter((w) => w.state === "COMPLETED").length,
    volume: workflows.reduce((a, w) => a + parseFloat(w.amount), 0).toFixed(2),
  };

  async function handleRequest() {
    setRequesting(true);
    const mockAddr = "0x" + Math.random().toString(16).slice(2, 42).padStart(40, "0");
    await new Promise((r) => setTimeout(r, 800));

    const newWf: Workflow = {
      id: workflows.length + 1,
      user: mockAddr,
      amount,
      state: "PENDING",
      isLoan: true,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    setWorkflows((prev) => [newWf, ...prev]);
    setNewId(newWf.id);
    setRequesting(false);

    // Simulate verification flow
    await new Promise((r) => setTimeout(r, 1200));
    setWorkflows((prev) => prev.map((w) => w.id === newWf.id ? { ...w, state: "VERIFYING", updatedAt: Math.floor(Date.now() / 1000) } : w));

    await new Promise((r) => setTimeout(r, 2000));
    const approved = Math.random() > 0.2;
    setWorkflows((prev) => prev.map((w) =>
      w.id === newWf.id
        ? { ...w, state: approved ? "COMPLETED" : "REJECTED", rejectReason: approved ? undefined : "Credit score too low", updatedAt: Math.floor(Date.now() / 1000) }
        : w
    ));
    setTimeout(() => setNewId(null), 3000);
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white">Workflow Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time async lending & payment verification</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Activity className="w-5 h-5 text-neon-cyan" />} label="Total Workflows" value={String(stats.total)} color="bg-neon-cyan/10" />
          <StatCard icon={<Clock className="w-5 h-5 text-yellow-400" />} label="Active" value={String(stats.pending)} sub="pending verification" color="bg-yellow-400/10" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-neon-green" />} label="Completed" value={String(stats.completed)} color="bg-neon-green/10" />
          <StatCard icon={<DollarSign className="w-5 h-5 text-neon-purple" />} label="Volume" value={`${stats.volume} ETH`} color="bg-neon-purple/10" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Request form */}
          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-6 h-fit">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-neon-cyan" /> Request Loan
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Amount (ETH)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.1"
                  min="0.01"
                  max="10"
                  className="w-full bg-dark-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-cyan/50 transition-all"
                />
              </div>
              <div className="bg-dark-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>KYC Check</span>
                  <span className="text-neon-cyan">Automated</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Credit Score</span>
                  <span className="text-neon-cyan">Automated</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Settlement</span>
                  <span className="text-neon-cyan">Auto on approval</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequest}
                disabled={requesting}
                className="w-full bg-neon-cyan text-dark-900 font-bold py-3 rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {requesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Send className="w-4 h-4" /> Request Loan</>}
              </motion.button>
            </div>
          </div>

          {/* Workflow table */}
          <div className="lg:col-span-2 bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Workflows</h2>
              <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
                {(["all", "loans", "payments"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                      activeTab === tab ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <div className="p-12 text-center text-slate-600">No workflows yet</div>
                ) : (
                  filtered.map((wf) => (
                    <motion.div
                      key={wf.id}
                      initial={wf.id === newId ? { opacity: 0, x: -20, backgroundColor: "rgba(0,245,255,0.1)" } : false}
                      animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                      className="p-4 hover:bg-dark-800/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-500 text-xs font-mono">#{wf.id}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${wf.isLoan ? "text-neon-cyan bg-neon-cyan/10" : "text-neon-purple bg-neon-purple/10"}`}>
                              {wf.isLoan ? "LOAN" : "PAYMENT"}
                            </span>
                          </div>
                          <div className="text-white font-mono text-sm">
                            {wf.user.slice(0, 10)}...{wf.user.slice(-6)}
                          </div>
                          {wf.rejectReason && (
                            <div className="text-xs text-pink-500 mt-1">{wf.rejectReason}</div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-white font-mono font-semibold">{wf.amount} ETH</div>
                          <div className="mt-1.5">
                            <StatusBadge state={wf.state} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
