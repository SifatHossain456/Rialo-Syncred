"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { formatEther } from "viem";

type WFState = 0 | 1 | 2 | 3 | 4 | 5;

interface FeedItem {
  id: string;
  workflowId: string;
  user: string;
  amount: string;
  state: WFState;
  isLoan: boolean;
  timestamp: number;
}

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

const STATE_ICON: Record<number, React.ReactNode> = {
  0: <Clock className="w-3.5 h-3.5 text-yellow-400" />,
  1: <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
  2: <CheckCircle className="w-3.5 h-3.5 text-neon-green" />,
  3: <XCircle className="w-3.5 h-3.5 text-pink-500" />,
  4: <CheckCircle className="w-3.5 h-3.5 text-neon-purple" />,
  5: <XCircle className="w-3.5 h-3.5 text-slate-500" />,
};

const STATE_MSG: Record<number, string> = {
  0: "submitted loan request",
  1: "verification started",
  2: "loan approved",
  3: "loan rejected",
  4: "funds received",
  5: "request cancelled",
};

interface Props {
  workflows: Workflow[];
}

export default function LiveFeed({ workflows }: Props) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const seenRef = useRef(new Set<string>());

  useEffect(() => {
    if (!workflows.length) return;

    const newItems: FeedItem[] = [];
    workflows.forEach((wf) => {
      const key = `${wf.id}-${wf.state}`;
      if (!seenRef.current.has(key)) {
        seenRef.current.add(key);
        newItems.push({
          id: key,
          workflowId: wf.id.toString(),
          user: wf.user,
          amount: parseFloat(formatEther(wf.amount)).toFixed(3),
          state: wf.state,
          isLoan: wf.isLoan,
          timestamp: Number(wf.updatedAt),
        });
      }
    });

    if (newItems.length) {
      setFeed((prev) => [...newItems.reverse(), ...prev].slice(0, 20));
    }
  }, [workflows]);

  function timeAgo(ts: number) {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  return (
    <div className="bg-dark-700 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          <Zap className="w-4 h-4 text-neon-cyan" />
        </div>
        <span className="text-white font-semibold text-sm">Live Activity Feed</span>
      </div>

      <div className="divide-y divide-slate-800/50 max-h-64 overflow-y-auto">
        <AnimatePresence initial={false}>
          {feed.length === 0 ? (
            <div className="p-6 text-center text-slate-600 text-sm">
              Waiting for activity...
            </div>
          ) : (
            feed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16, backgroundColor: "rgba(0,245,255,0.06)" }}
                animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                transition={{ duration: 0.4 }}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-shrink-0">{STATE_ICON[item.state]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-300 text-xs">
                    <span className="text-white font-mono">
                      {item.user.slice(0, 6)}...{item.user.slice(-4)}
                    </span>
                    {" "}<span className="text-slate-400">{STATE_MSG[item.state]}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-500 text-xs font-mono">#{item.workflowId}</span>
                    <span className={`text-xs font-mono ${item.isLoan ? "text-neon-cyan/70" : "text-neon-purple/70"}`}>
                      {item.amount} ETH
                    </span>
                  </div>
                </div>
                <div className="text-slate-600 text-xs font-mono flex-shrink-0">
                  {timeAgo(item.timestamp)}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
