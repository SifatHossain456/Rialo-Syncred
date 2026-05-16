"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle, XCircle, Clock, Loader2,
  AlertTriangle, Wallet, RefreshCw, DollarSign, Lock
} from "lucide-react";
import {
  useAccount, useReadContract, useWriteContract,
  useWaitForTransactionReceipt, useChainId
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";
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

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = SUPPORTED_CHAINS.some((c) => c.id === chainId);

  const [rejectId, setRejectId] = useState<bigint | null>(null);
  const [rejectReason, setRejectReason] = useState("Low credit score");
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [actionTxHash, setActionTxHash] = useState<`0x${string}` | undefined>();
  const [logs, setLogs] = useState<{ id: string; action: string; time: string }[]>([]);

  // Contract owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "owner",
    query: { enabled: isConnected && isCorrectNetwork },
  });

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  // All workflows
  const { data: allWorkflows, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllWorkflows",
    query: { enabled: isConnected && isCorrectNetwork },
  });

  // Contract balance
  const { data: poolBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getContractBalance",
    query: { enabled: isConnected && isCorrectNetwork },
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: actionTxHash });

  useEffect(() => {
    if (txConfirmed) {
      refetch();
      refetchBalance();
      setActionTxHash(undefined);
    }
  }, [txConfirmed, refetch, refetchBalance]);

  const workflows = (allWorkflows as Workflow[] | undefined) ?? [];
  const pendingWfs = workflows.filter((w) => w.state === 0 || w.state === 1);

  async function approve(id: bigint) {
    const toastId = toast.loading(`Approving #${id}...`);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "approveWorkflow",
        args: [id],
      });
      setActionTxHash(hash);
      setLogs((p) => [{ id: id.toString(), action: "APPROVED", time: new Date().toLocaleTimeString() }, ...p.slice(0, 19)]);
      toast.success(`Approved #${id}!`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.shortMessage || "Approve failed", { id: toastId });
    }
  }

  async function reject(id: bigint) {
    const toastId = toast.loading(`Rejecting #${id}...`);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "rejectWorkflow",
        args: [id, rejectReason],
      });
      setActionTxHash(hash);
      setLogs((p) => [{ id: id.toString(), action: "REJECTED", time: new Date().toLocaleTimeString() }, ...p.slice(0, 19)]);
      toast.success(`Rejected #${id}`, { id: toastId });
      setRejectId(null);
    } catch (err: any) {
      toast.error(err?.shortMessage || "Reject failed", { id: toastId });
    }
  }

  async function startVerify(id: bigint) {
    const toastId = toast.loading(`Starting verification #${id}...`);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "startVerification",
        args: [id],
      });
      setActionTxHash(hash);
      toast.success(`Verification started for #${id}`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.shortMessage || "Failed", { id: toastId });
    }
  }

  async function depositFunds() {
    const toastId = toast.loading("Depositing funds...");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "depositFunds",
        value: parseEther(depositAmount),
      });
      setActionTxHash(hash);
      toast.success(`Deposited ${depositAmount} ETH to pool!`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.shortMessage || "Deposit failed", { id: toastId });
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-dark-700 border border-slate-800 rounded-3xl max-w-sm">
          <Lock className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connect to access Admin</h2>
          <p className="text-slate-400 mb-6 text-sm">Only the contract owner can manage workflows.</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Wrong Network</h2>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (isOwner === false) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-dark-700 border border-red-500/20 rounded-3xl max-w-sm">
          <Lock className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-1">This panel is restricted to the contract owner.</p>
          <p className="text-slate-600 text-xs font-mono">{owner?.slice(0, 12)}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-neon-purple" /> Admin Panel
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Contract owner controls</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => { refetch(); refetchBalance(); }}
            className="flex items-center gap-2 bg-dark-700 border border-slate-700 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </motion.button>
        </div>

        {/* Pool balance + deposit */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-neon-green/10 rounded-2xl flex items-center justify-center border border-neon-green/20">
              <DollarSign className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <div className="text-slate-500 text-sm">Loan Pool Balance</div>
              <div className="text-2xl font-bold font-mono text-white">
                {poolBalance ? parseFloat(formatEther(poolBalance as bigint)).toFixed(4) : "—"} ETH
              </div>
            </div>
          </div>

          <div className="bg-dark-700 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400 text-sm mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Deposit to Pool
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                step="0.01"
                min="0.001"
                className="flex-1 bg-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-neon-green/50"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={depositFunds}
                disabled={isPending}
                className="bg-neon-green/20 border border-neon-green/40 text-neon-green font-medium px-4 py-2 rounded-xl hover:bg-neon-green/30 disabled:opacity-50 text-sm transition-all"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deposit"}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending queue */}
          <div className="lg:col-span-2 bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" /> Pending Queue
              </h2>
              <span className="bg-yellow-400/10 text-yellow-400 text-xs px-2.5 py-1 rounded-full border border-yellow-400/30">
                {pendingWfs.length} waiting
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              <AnimatePresence>
                {pendingWfs.length === 0 ? (
                  <div className="p-12 text-center text-slate-600">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-neon-green" />
                    <p>No pending workflows</p>
                  </div>
                ) : (
                  pendingWfs.map((wf) => (
                    <motion.div
                      key={wf.id.toString()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: 60 }}
                      className="p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-slate-500 text-xs font-mono">#{wf.id.toString()}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${wf.isLoan ? "text-neon-cyan bg-neon-cyan/10" : "text-neon-purple bg-neon-purple/10"}`}>
                              {wf.isLoan ? "LOAN" : "PAYMENT"}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${wf.state === 0 ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" : "text-blue-400 border-blue-400/30 bg-blue-400/10"}`}>
                              {STATE_MAP[wf.state]}
                            </span>
                          </div>
                          <div className="text-white font-mono text-sm mb-1">
                            {wf.user.slice(0, 10)}...{wf.user.slice(-6)}
                          </div>
                          <div className="text-neon-cyan font-mono font-semibold">
                            {parseFloat(formatEther(wf.amount)).toFixed(4)} ETH
                          </div>

                          {/* Reject reason input for this specific WF */}
                          {rejectId === wf.id && (
                            <div className="mt-3 flex gap-2">
                              <input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="flex-1 bg-dark-800 border border-pink-500/30 rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:outline-none"
                                placeholder="Rejection reason..."
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {wf.state === 0 && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => startVerify(wf.id)}
                              disabled={isPending}
                              className="text-xs bg-blue-500/20 border border-blue-500/40 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 transition-all"
                            >
                              <Loader2 className="w-3.5 h-3.5 inline mr-1" />Start Verify
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => approve(wf.id)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 bg-neon-green/20 border border-neon-green/40 text-neon-green text-xs font-medium px-3 py-2 rounded-lg hover:bg-neon-green/30 disabled:opacity-50 transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </motion.button>
                          {rejectId === wf.id ? (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => reject(wf.id)}
                              disabled={isPending}
                              className="flex items-center gap-1.5 bg-pink-500/30 border border-pink-500/50 text-pink-300 text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Confirm Reject
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setRejectId(wf.id)}
                              className="flex items-center gap-1.5 bg-pink-500/20 border border-pink-500/40 text-pink-400 text-xs font-medium px-3 py-2 rounded-lg hover:bg-pink-500/30 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action log */}
          <div className="bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden h-fit">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold">Action Log</h2>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-600 text-sm">No actions yet</div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {log.action === "APPROVED"
                        ? <CheckCircle className="w-4 h-4 text-neon-green" />
                        : <XCircle className="w-4 h-4 text-pink-500" />}
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
