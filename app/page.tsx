"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Zap, Shield, Clock, TrendingUp, ChevronRight,
  Wallet, CheckCircle, Activity, Layers
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEthPrice } from "@/hooks/useEthPrice";

const features = [
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Async Execution",
    desc: "Transactions pause and resume automatically based on real-world verification events.",
    accent: "indigo",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Compliance Layer",
    desc: "KYC, credit scoring, and wallet analysis run automatically before any loan is issued.",
    accent: "purple",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Auto Settlement",
    desc: "Once verified, funds are released without any manual admin interaction required.",
    accent: "emerald",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Live Analytics",
    desc: "Real-time workflow tracking with state transitions, verification logs, and charts.",
    accent: "amber",
  },
];

const accentMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  indigo:  { text: "text-indigo-400",  bg: "bg-indigo-400/8",  border: "border-indigo-400/20",  glow: "hover:border-indigo-400/35"  },
  purple:  { text: "text-purple-400",  bg: "bg-purple-400/8",  border: "border-purple-400/20",  glow: "hover:border-purple-400/35"  },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-400/8", border: "border-emerald-400/20", glow: "hover:border-emerald-400/35" },
  amber:   { text: "text-amber-400",   bg: "bg-amber-400/8",   border: "border-amber-400/20",   glow: "hover:border-amber-400/35"   },
};

const steps = [
  { num: "01", title: "Connect Wallet",    desc: "Connect MetaMask on Goerli Testnet",                              color: "#818cf8" },
  { num: "02", title: "Request Loan",      desc: "Submit an onchain loan request — contract enters PENDING state", color: "#c084fc" },
  { num: "03", title: "Auto Verification", desc: "KYC and credit scoring run automatically off-chain",             color: "#fbbf24" },
  { num: "04", title: "State Transition",  desc: "Contract resumes with APPROVED or REJECTED result",              color: "#60a5fa" },
  { num: "05", title: "Funds Released",    desc: "Settlement completes instantly — no admin interaction needed",   color: "#34d399" },
];

const highlights = [
  { label: "Async workflow states",    color: "text-indigo-400"  },
  { label: "Automated KYC & credit",  color: "text-emerald-400" },
  { label: "Non-custodial settlement", color: "text-purple-400"  },
  { label: "Onchain audit trail",      color: "text-amber-400"   },
];

export default function LandingPage() {
  const { isConnected } = useAccount();
  const { price: ethPrice, change24h } = useEthPrice();

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero */}
      <section className="relative pt-36 pb-28 px-6 text-center overflow-hidden">
        {/* Background layer */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute inset-0 radial-bg" />
          <div className="absolute inset-0 dot-grid opacity-40" />
          {/* Ambient blobs — subtle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/8 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-purple-600/6 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2.5 mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-dark-800/80 border border-white/[0.07] rounded-full px-4 py-2 shadow-lg backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-slate-300 text-xs font-mono tracking-wide">Live on Goerli Testnet</span>
            </div>
            {ethPrice && (
              <div className="inline-flex items-center gap-2 bg-dark-800/80 border border-white/[0.07] rounded-full px-4 py-2 shadow-lg backdrop-blur-sm">
                <span className="text-slate-500 text-xs font-mono">ETH</span>
                <span className="text-white text-sm font-mono font-semibold">
                  ${ethPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
                {change24h !== null && (
                  <span className={`text-xs font-mono font-medium ${change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.08] tracking-tight"
          >
            <span className="text-white">DeFi that waits for</span>
            <br />
            <span className="gradient-text-multi">the real world.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Syncred demonstrates Rialo-style async execution — a decentralised lending protocol
            that pauses for real-world verification before completing settlement.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            {isConnected ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/20"
                >
                  Open Dashboard <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ConnectButton label="Connect Wallet" />
                <p className="text-slate-600 text-xs">Goerli or Sepolia Testnet</p>
              </div>
            )}
            <Link href="/analytics">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-dark-800/80 border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-all text-sm backdrop-blur-sm"
              >
                View Analytics <ChevronRight className="w-4 h-4 text-slate-500" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Highlights bar */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-y border-white/[0.05] bg-dark-800/40 backdrop-blur-sm py-8"
      >
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.07 }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-1.5 h-1.5 rounded-full bg-current ${h.color}`} />
              <div className={`text-xs font-medium tracking-wide ${h.color}`}>{h.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-dark-800/80 border border-white/[0.06] rounded-full px-4 py-1.5 mb-5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">Protocol</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">How Syncred Works</h2>
          <p className="text-slate-500 max-w-lg mx-auto text-base">
            Transaction states that mirror real-world processes — async finance for complex workflows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const a = accentMap[f.accent];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`bg-dark-800/60 border ${a.border} ${a.glow} rounded-2xl p-6 transition-all duration-200 cursor-default inner-glow`}
              >
                <div className={`${a.text} ${a.bg} mb-5 w-10 h-10 rounded-xl flex items-center justify-center border ${a.border}`}>
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Workflow steps */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-800/25" />
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              Async Execution Flow
            </h2>
            <p className="text-slate-500 text-base">Five steps from request to settlement</p>
          </motion.div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 3 }}
                className="flex gap-4 items-center group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 border transition-all duration-200"
                  style={{
                    background: `${step.color}10`,
                    borderColor: `${step.color}30`,
                    color: step.color,
                  }}
                >
                  {step.num}
                </div>
                <div className="bg-dark-800/50 border border-white/[0.06] group-hover:border-white/[0.10] rounded-xl px-5 py-3.5 flex-1 transition-all duration-200 inner-glow">
                  <h3 className="text-white font-semibold text-sm">{step.title}</h3>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="relative bg-dark-800/60 border border-white/[0.07] rounded-3xl p-12 inner-glow overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5 rounded-3xl" />
            <div className="relative">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                Experience async finance
              </h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                Connect your wallet on Goerli Testnet and request a loan — watch the async verification
                workflow execute live onchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {isConnected ? (
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-8 py-3 rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/20"
                    >
                      Launch Dashboard <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                ) : (
                  <div className="flex justify-center">
                    <ConnectButton label="Connect Wallet" />
                  </div>
                )}
                <Link href="/analytics">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 bg-dark-900/60 border border-white/[0.07] hover:border-white/[0.13] text-slate-300 hover:text-white font-medium px-7 py-3 rounded-xl transition-all text-sm"
                  >
                    <Activity className="w-4 h-4 text-purple-400" /> Analytics
                  </motion.button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-5 mt-8 pt-6 border-t border-white/[0.05]">
                {[
                  { icon: <CheckCircle className="w-3.5 h-3.5" />, text: "No fees" },
                  { icon: <Shield className="w-3.5 h-3.5" />,      text: "Testnet only" },
                  { icon: <Zap className="w-3.5 h-3.5" />,         text: "Open source" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <span className="text-indigo-500/60">{t.icon}</span>
                    {t.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
