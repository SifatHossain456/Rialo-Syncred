"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, XCircle, Clock, Loader2, AlertTriangle, User, CreditCard } from "lucide-react";

interface PendingRequest {
  id: number;
  address: string;
  amount: string;
  type: "LOAN" | "PAYMENT";
  creditScore: number;
  kycStatus: "VERIFIED" | "PENDING" | "FAILED";
  requestedAt: string;
}

const mockPending: PendingRequest[] = [
  { id: 1, address: "0x1234...5678", amount: "1.5", type: "LOAN", creditScore: 720, kycStatus: "VERIFIED", requestedAt: "2 min ago" },
  { id: 2, address: "0xabcd...ef01", amount: "0.3", type: "PAYMENT", creditScore: 580, kycStatus: "PENDING", requestedAt: "5 min ago" },
  { id: 3, address: "0x9876...4321", amount: "3.0", type: "LOAN", creditScore: 450, kycStatus: "VERIFIED", requestedAt: "8 min ago" },
  { id: 4, address: "0xdead...beef", amount: "0.8", type: "LOAN", creditScore: 810, kycStatus: "VERIFIED", requestedAt: "12 min ago" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 700 ? "text-neon-green" : score >= 550 ? "text-yellow-400" : "text-pink-500";
  const bg = score >= 700 ? "bg-neon-green/10 border-neon-green/30" : score >= 550 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-pink-500/10 border-pink-500/30";
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${color} ${bg}`}>{score}</span>
  );
}

export default function AdminPanel() {
  const [requests, setRequests] = useState<PendingRequest[]>(mockPending);
  const [processing, setProcessing] = useState<number | null>(null);
  const [logs, setLogs] = useState<{ id: number; action: string; time: string }[]>([]);

  async function handleAction(id: number, action: "approve" | "reject") {
    setProcessing(id);
    await new Promise((r) => setTimeout(r, 1200));
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setLogs((prev) => [
      { id, action: action === "approve" ? "APPROVED" : "REJECTED", time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);
    setProcessing(null);
  }

  async function triggerAllVerification() {
    for (const req of requests) {
      await handleAction(req.id, Math.random() > 0.3 ? "approve" : "reject");
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-neon-purple" /> Admin Panel
            </h1>
            <p className="text-slate-400 mt-1">Simulate verification events and workflow management</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={triggerAllVerification}
            disabled={requests.length === 0}
            className="bg-neon-purple/20 border border-neon-purple/40 text-neon-purple font-semibold px-5 py-2.5 rounded-xl hover:bg-neon-purple/30 disabled:opacity-40 transition-all"
          >
            Auto-Verify All
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending queue */}
          <div className="lg:col-span-2">
            <div className="bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> Pending Verification Queue
                </h2>
                <span className="bg-yellow-400/10 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-400/30">
                  {requests.length} waiting
                </span>
              </div>

              <div className="divide-y divide-slate-800">
                <AnimatePresence>
                  {requests.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-12 text-center text-slate-600"
                    >
                      <CheckCircle className="w-10 h-10 mx-auto mb-3 text-neon-green/30" />
                      <p>All requests processed</p>
                    </motion.div>
                  ) : (
                    requests.map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-slate-500 font-mono text-xs">#{req.id}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${req.type === "LOAN" ? "text-neon-cyan bg-neon-cyan/10" : "text-neon-purple bg-neon-purple/10"}`}>
                                {req.type}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${req.kycStatus === "VERIFIED" ? "text-neon-green border-neon-green/30 bg-neon-green/10" : req.kycStatus === "PENDING" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" : "text-pink-500 border-pink-500/30 bg-pink-500/10"}`}>
                                KYC: {req.kycStatus}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-slate-500" />
                              <span className="text-white font-mono text-sm">{req.address}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-slate-400">
                                <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                                {req.amount} ETH
                              </span>
                              <span className="text-slate-500">Credit: <ScoreBadge score={req.creditScore} /></span>
                              <span className="text-slate-600 text-xs">{req.requestedAt}</span>
                            </div>
                            {req.creditScore < 500 && (
                              <div className="mt-2 flex items-center gap-1.5 text-yellow-500 text-xs">
                                <AlertTriangle className="w-3.5 h-3.5" /> Low credit score — review carefully
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {processing === req.id ? (
                              <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                              </div>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleAction(req.id, "approve")}
                                  className="flex items-center gap-1.5 bg-neon-green/20 border border-neon-green/40 text-neon-green text-sm font-medium px-4 py-2 rounded-lg hover:bg-neon-green/30 transition-all"
                                >
                                  <CheckCircle className="w-4 h-4" /> Approve
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleAction(req.id, "reject")}
                                  className="flex items-center gap-1.5 bg-pink-500/20 border border-pink-500/40 text-pink-400 text-sm font-medium px-4 py-2 rounded-lg hover:bg-pink-500/30 transition-all"
                                >
                                  <XCircle className="w-4 h-4" /> Reject
                                </motion.button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Activity log */}
          <div className="bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden h-fit">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold">Activity Log</h2>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-600 text-sm">No actions yet</div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {log.action === "APPROVED" ? (
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                      ) : (
                        <XCircle className="w-4 h-4 text-pink-500" />
                      )}
                      <span className="text-slate-300 text-sm font-mono">#{log.id}</span>
                      <span className={`text-xs ${log.action === "APPROVED" ? "text-neon-green" : "text-pink-500"}`}>
                        {log.action}
                      </span>
                    </div>
                    <span className="text-slate-600 text-xs font-mono">{log.time}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
