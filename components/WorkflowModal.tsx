"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Clock, CheckCircle, XCircle, Loader2, Ban, Copy, Check, User } from "lucide-react";
import { formatEther } from "viem";
import { useState } from "react";

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

interface Props {
  workflow: Workflow | null;
  onClose: () => void;
  chainId?: number;
}

const STATE_STEPS = [
  { state: 0, label: "Request Created", sublabel: "Workflow entered PENDING state", icon: <Clock className="w-4 h-4" />, color: "#fbbf24" },
  { state: 1, label: "Verification Started", sublabel: "KYC + credit check running", icon: <Loader2 className="w-4 h-4" />, color: "#60a5fa" },
  { state: 2, label: "Approved", sublabel: "All checks passed", icon: <CheckCircle className="w-4 h-4" />, color: "#00ff87" },
  { state: 4, label: "Completed", sublabel: "Funds disbursed to wallet", icon: <CheckCircle className="w-4 h-4" />, color: "#a855f7" },
];

const REJECT_STEP = { state: 3, label: "Rejected", sublabel: "Verification failed", icon: <XCircle className="w-4 h-4" />, color: "#ff006e" };
const CANCEL_STEP = { state: 5, label: "Cancelled", sublabel: "User cancelled request", icon: <Ban className="w-4 h-4" />, color: "#64748b" };

const STATE_LABELS: Record<number, string> = {
  0: "PENDING", 1: "VERIFYING", 2: "APPROVED",
  3: "REJECTED", 4: "COMPLETED", 5: "CANCELLED",
};

const STATE_COLORS: Record<number, string> = {
  0: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  1: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  2: "text-neon-green bg-neon-green/10 border-neon-green/30",
  3: "text-pink-500 bg-pink-500/10 border-pink-500/30",
  4: "text-neon-purple bg-neon-purple/10 border-neon-purple/30",
  5: "text-slate-500 bg-slate-700/30 border-slate-600/30",
};

function formatTs(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleString();
}

function getExplorerUrl(chainId: number | undefined, addr: string, type: "address" | "tx" = "address") {
  return `https://sepolia.etherscan.io/${type}/${addr}`;
}

export default function WorkflowModal({ workflow, onClose, chainId }: Props) {
  const [copiedAddr, setCopiedAddr] = useState(false);

  if (!workflow) return null;

  function copyAddress() {
    navigator.clipboard.writeText(workflow!.user);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 1500);
  }

  // Build timeline based on current state
  const isRejected = workflow.state === 3;
  const isCancelled = workflow.state === 5;
  const completedUpTo = isRejected ? 1 : isCancelled ? 0 : workflow.state;

  const timeline = isRejected
    ? [...STATE_STEPS.slice(0, 2), REJECT_STEP]
    : isCancelled
    ? [STATE_STEPS[0], CANCEL_STEP]
    : STATE_STEPS;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Workflow #${workflow.id.toString()} details`}
          onClick={(e) => e.stopPropagation()}
          className="bg-dark-800 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-500 font-mono text-sm">#{workflow.id.toString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${workflow.isLoan ? "text-neon-cyan bg-neon-cyan/10" : "text-neon-purple bg-neon-purple/10"}`}>
                  {workflow.isLoan ? "LOAN" : "PAYMENT"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATE_COLORS[workflow.state]}`}>
                  {STATE_LABELS[workflow.state]}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {parseFloat(formatEther(workflow.amount)).toFixed(4)} ETH
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-xl bg-dark-700 text-slate-400 hover:text-white hover:bg-dark-600 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* User info */}
            <div className="bg-dark-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2 font-medium uppercase tracking-wide">
                <User className="w-3.5 h-3.5" /> Requester
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-mono text-sm">{workflow.user.slice(0, 14)}...{workflow.user.slice(-8)}</span>
                <div className="flex items-center gap-2">
                  <button onClick={copyAddress} className="p-1.5 rounded-lg bg-dark-800 text-slate-400 hover:text-neon-cyan transition-all">
                    {copiedAddr ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={getExplorerUrl(chainId, workflow.user)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-dark-800 text-slate-400 hover:text-neon-cyan transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-4">Execution Timeline</div>
              <div className="space-y-0">
                {timeline.map((step, i) => {
                  const isActive = (isRejected || isCancelled)
                    ? i === timeline.length - 1
                    : step.state === workflow.state;
                  const isDone = !isActive && (
                    (isRejected && i < timeline.length - 1) ||
                    (isCancelled && i < timeline.length - 1) ||
                    (!isRejected && !isCancelled && step.state < workflow.state)
                  );
                  const isPending = !isActive && !isDone;

                  return (
                    <div key={i} className="flex gap-4">
                      {/* Line */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all"
                          style={{
                            borderColor: isDone || isActive ? step.color : "#334155",
                            background: isDone ? `${step.color}22` : isActive ? `${step.color}33` : "transparent",
                            color: isDone || isActive ? step.color : "#475569",
                          }}
                        >
                          {step.icon}
                        </motion.div>
                        {i < timeline.length - 1 && (
                          <div
                            className="w-0.5 flex-1 my-1 rounded-full min-h-[24px]"
                            style={{ background: isDone ? `${step.color}66` : "#1e293b" }}
                          />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-5 flex-1">
                        <div className={`font-medium text-sm ${isDone || isActive ? "text-white" : "text-slate-600"}`}>
                          {step.label}
                          {isActive && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: `${step.color}22`, color: step.color }}>
                              Current
                            </span>
                          )}
                        </div>
                        <div className={`text-xs mt-0.5 ${isDone || isActive ? "text-slate-400" : "text-slate-700"}`}>
                          {step.sublabel}
                        </div>
                        {isActive && workflow.rejectReason && (
                          <div className="text-xs text-pink-400 mt-1 bg-pink-500/10 rounded-lg px-2 py-1">
                            Reason: {workflow.rejectReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-dark-700 rounded-2xl p-4 space-y-2">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">Timestamps</div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-300 font-mono text-xs">{formatTs(workflow.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-slate-300 font-mono text-xs">{formatTs(workflow.updatedAt)}</span>
              </div>
              {workflow.updatedAt > workflow.createdAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Processing Time</span>
                  <span className="text-neon-cyan font-mono text-xs">
                    {(Number(workflow.updatedAt - workflow.createdAt))}s
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <a
              href={getExplorerUrl(chainId, workflow.user)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-dark-700 border border-slate-700 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/30 font-medium py-3 rounded-xl transition-all text-sm"
            >
              <ExternalLink className="w-4 h-4" /> View on Etherscan
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
