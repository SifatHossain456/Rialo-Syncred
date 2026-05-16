"use client";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { PRIMARY_CHAIN_ID, SUPPORTED_CHAINS } from "@/lib/wagmi";

export default function NetworkGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && !SUPPORTED_CHAINS.find((c) => c.id === chainId);

  return (
    <AnimatePresence>
      {isWrongNetwork && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          className="fixed top-16 left-0 right-0 z-40 bg-yellow-500/10 border-b border-yellow-500/30 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <span className="text-yellow-400 font-semibold text-sm">Wrong Network</span>
                <span className="text-yellow-400/70 text-sm ml-2">
                  Please switch to Goerli or Sepolia Testnet to use Syncred.
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => switchChain({ chainId: PRIMARY_CHAIN_ID })}
              disabled={isPending}
              className="flex items-center gap-2 bg-yellow-500 text-dark-900 font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-60 transition-all flex-shrink-0"
            >
              {isPending ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Switching...</>
              ) : (
                <><RefreshCw className="w-4 h-4" /> Switch to Goerli</>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
