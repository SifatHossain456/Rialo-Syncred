"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import {
  Droplets, ExternalLink, Copy, Check, AlertTriangle,
  Wallet, ChevronRight, Info, CheckCircle, Zap
} from "lucide-react";
import Link from "next/link";

const FAUCETS = [
  {
    name: "Alchemy Goerli Faucet",
    url: "https://goerlifaucet.com",
    network: "Goerli",
    chainId: 5,
    amount: "0.5 ETH/day",
    requires: "Alchemy account",
    recommended: true,
    color: "#00f5ff",
    icon: "🔵",
  },
  {
    name: "Chainlink Faucet",
    url: "https://faucets.chain.link/goerli",
    network: "Goerli",
    chainId: 5,
    amount: "0.1 ETH",
    requires: "GitHub login",
    recommended: false,
    color: "#a855f7",
    icon: "🔗",
  },
  {
    name: "QuickNode Faucet",
    url: "https://faucet.quicknode.com/ethereum/goerli",
    network: "Goerli",
    chainId: 5,
    amount: "0.1 ETH",
    requires: "QuickNode account",
    recommended: false,
    color: "#00ff87",
    icon: "⚡",
  },
  {
    name: "Sepolia Faucet (Alchemy)",
    url: "https://sepoliafaucet.com",
    network: "Sepolia",
    chainId: 11155111,
    amount: "0.5 ETH/day",
    requires: "Alchemy account",
    recommended: false,
    color: "#fbbf24",
    icon: "🟡",
  },
];

const STEPS = [
  { num: "01", title: "Install MetaMask", desc: "Download from metamask.io and create a new wallet. Save your seed phrase securely.", link: "https://metamask.io" },
  { num: "02", title: "Add Goerli Network", desc: "In MetaMask, go to Settings → Networks → Add Network and search for Goerli Testnet.", link: null },
  { num: "03", title: "Get Testnet ETH", desc: "Visit one of the faucets below and paste your wallet address to receive free testnet ETH.", link: null },
  { num: "04", title: "Connect & Use", desc: "Return to Syncred, click Connect Wallet, and start requesting loans on the dashboard.", link: "/dashboard" },
];

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<"all" | "Goerli" | "Sepolia">("all");

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const filtered = activeNetwork === "all"
    ? FAUCETS
    : FAUCETS.filter((f) => f.network === activeNetwork);

  const hasEnoughETH = balance && parseFloat(formatEther(balance.value)) >= 0.05;

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="py-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Droplets className="w-8 h-8 text-neon-cyan" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Testnet Faucet Guide</h1>
            <p className="text-slate-400 max-w-xl mx-auto">
              Get free Goerli or Sepolia ETH to interact with Syncred. Testnet ETH has no real value — it's just for testing.
            </p>
          </motion.div>
        </div>

        {/* Wallet status */}
        {isConnected ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-5 mb-8 ${hasEnoughETH ? "bg-neon-green/5 border-neon-green/20" : "bg-yellow-500/5 border-yellow-500/20"}`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {hasEnoughETH
                  ? <CheckCircle className="w-5 h-5 text-neon-green" />
                  : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                <div>
                  <div className={`font-semibold text-sm ${hasEnoughETH ? "text-neon-green" : "text-yellow-400"}`}>
                    {hasEnoughETH ? "You have enough ETH to start!" : "Low balance — visit a faucet below"}
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5 font-mono">
                    Balance: {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : "0"} {balance?.symbol}
                  </div>
                </div>
              </div>
              {hasEnoughETH && (
                <Link href="/dashboard">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 bg-neon-green text-dark-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-300 transition-all">
                    Go to Dashboard <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              )}
            </div>
            {/* Address copy */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-dark-800 border border-slate-700 rounded-xl px-3 py-2 font-mono text-xs text-slate-400 truncate">
                {address}
              </div>
              <button onClick={copyAddress}
                className="flex items-center gap-1.5 bg-dark-700 border border-slate-700 text-slate-400 hover:text-neon-cyan text-xs px-3 py-2 rounded-xl transition-all">
                {copied ? <><Check className="w-3.5 h-3.5 text-neon-green" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <p className="text-slate-600 text-xs mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" /> Paste your address into the faucet website to receive testnet ETH
            </p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-white font-semibold text-sm">Connect your wallet</div>
                <div className="text-slate-500 text-xs">to check your balance and copy your address</div>
              </div>
            </div>
            <ConnectButton />
          </motion.div>
        )}

        {/* How to get started */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-cyan" /> How to Get Started
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {STEPS.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/70 transition-all shadow-lg card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center font-mono text-neon-cyan text-sm font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm mb-1">{step.title}</div>
                    <div className="text-slate-400 text-xs leading-relaxed">{step.desc}</div>
                    {step.link && (
                      step.link.startsWith("/") ? (
                        <Link href={step.link} className="inline-flex items-center gap-1 text-neon-cyan text-xs mt-2 hover:underline">
                          Go now <ChevronRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <a href={step.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-neon-cyan text-xs mt-2 hover:underline">
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Faucets */}
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-neon-cyan" /> Available Faucets
            </h2>
            <div className="flex gap-1 bg-dark-900/80 border border-slate-700/60 rounded-xl p-1">
              {(["all", "Goerli", "Sepolia"] as const).map((n) => (
                <button key={n} onClick={() => setActiveNetwork(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeNetwork === n ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-500 hover:text-slate-300"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((faucet, i) => (
              <motion.a key={i} href={faucet.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="block bg-dark-800 border border-slate-700/50 hover:border-slate-600/70 rounded-2xl p-5 transition-all group shadow-lg"
                style={faucet.recommended ? { borderColor: `${faucet.color}33` } : {}}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{faucet.icon}</span>
                    <div>
                      <div className="text-white font-semibold text-sm group-hover:text-neon-cyan transition-all">
                        {faucet.name}
                      </div>
                      <div className="text-slate-500 text-xs">{faucet.network} Testnet</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {faucet.recommended && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                        Recommended
                      </span>
                    )}
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-neon-cyan transition-all" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Gives: <span className="text-white font-mono">{faucet.amount}</span></span>
                  </div>
                  <span className="text-slate-600">Requires: {faucet.requires}</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Bottom tip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-10 bg-dark-800 border border-slate-700/50 rounded-2xl p-5 flex items-start gap-4 shadow-lg">
          <Info className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
          <div className="text-slate-400 text-sm leading-relaxed">
            <span className="text-white font-semibold">Tip:</span> Goerli testnet ETH can sometimes be scarce. If one faucet doesn't work, try another. You only need about <span className="text-neon-cyan font-mono">0.05 ETH</span> to start testing Syncred workflows. Sepolia is an alternative if Goerli faucets are dry.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
