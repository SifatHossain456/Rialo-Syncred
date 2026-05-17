"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Zap, Shield, Clock, TrendingUp, ChevronRight,
  Wallet, CheckCircle, Activity, FlaskConical
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { isDemoMode } from "@/lib/mockData";

const IS_DEMO = isDemoMode();

const features = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Async Execution",
    desc: "Transactions pause and resume automatically based on real-world verification events.",
    color: "text-neon-cyan",
    border: "hover:border-neon-cyan/30",
    bg: "hover:bg-neon-cyan/5",
    glow: "#00f5ff",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Compliance Layer",
    desc: "KYC, credit scoring, and wallet analysis run automatically before any loan is issued.",
    color: "text-violet-400",
    border: "hover:border-violet-400/30",
    bg: "hover:bg-violet-400/5",
    glow: "#a855f7",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Auto Settlement",
    desc: "Once verified, funds are released without any manual admin interaction required.",
    color: "text-emerald-400",
    border: "hover:border-emerald-400/30",
    bg: "hover:bg-emerald-400/5",
    glow: "#00ff87",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Live Analytics",
    desc: "Real-time workflow tracking with state transitions, verification logs, and charts.",
    color: "text-amber-400",
    border: "hover:border-amber-400/30",
    bg: "hover:bg-amber-400/5",
    glow: "#fbbf24",
  },
];

const steps = [
  { num: "01", title: "Connect Wallet", desc: "Connect MetaMask on Goerli Testnet", color: "#00f5ff" },
  { num: "02", title: "Request Loan", desc: "Submit onchain loan request — enters PENDING state", color: "#a855f7" },
  { num: "03", title: "Auto Verification", desc: "KYC + credit scoring runs automatically off-chain", color: "#fbbf24" },
  { num: "04", title: "State Transition", desc: "Contract resumes with APPROVED or REJECTED result", color: "#60a5fa" },
  { num: "05", title: "Funds Released", desc: "Settlement completes instantly. No admin needed.", color: "#00ff87" },
];

const stats = [
  { label: "Total Workflows", value: "1,247", color: "text-neon-cyan" },
  { label: "Approval Rate",   value: "84.3%", color: "text-emerald-400" },
  { label: "Avg Settlement",  value: "2.4s",  color: "text-violet-400" },
  { label: "Total Volume",    value: "127 ETH", color: "text-amber-400" },
];

export default function LandingPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-dark-900 radial-bg">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-16 left-1/3 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[120px]" />
          <div className="absolute top-32 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-emerald-500/4 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 bg-dark-800 border border-neon-cyan/25 rounded-full px-5 py-2 mb-10 shadow-lg"
          >
            <span className="relative flex">
              <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
            </span>
            <span className="text-neon-cyan text-sm font-mono tracking-wide">
              {IS_DEMO ? "Demo Mode Active — Try it now" : "Live on Goerli Testnet"}
            </span>
            {IS_DEMO && <FlaskConical className="w-3.5 h-3.5 text-violet-400" />}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
          >
            <span className="text-white">Most chains process</span>
            <br />
            <span className="text-white">transactions </span>
            <span className="gradient-text-cyan">instantly.</span>
            <br />
            <span className="text-white">We process </span>
            <span className="gradient-text-purple">workflows.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Syncred demonstrates Rialo-style async execution through a decentralized lending
            protocol that waits for real-world verification before completing settlement.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {IS_DEMO ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 bg-neon-cyan text-dark-900 font-bold px-8 py-4 rounded-2xl glow-cyan hover:bg-cyan-300 transition-all text-base shadow-lg"
                >
                  <FlaskConical className="w-5 h-5" />
                  Try Demo Dashboard
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            ) : isConnected ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 bg-neon-cyan text-dark-900 font-bold px-8 py-4 rounded-2xl glow-cyan hover:bg-cyan-300 transition-all text-base shadow-lg"
                >
                  Open Dashboard <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ConnectButton label="Connect & Get Started" />
                <p className="text-slate-600 text-xs">Goerli or Sepolia Testnet</p>
              </div>
            )}
            <Link href="/analytics">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-dark-800 glass border border-slate-700/60 text-white font-semibold px-8 py-4 rounded-2xl hover:border-violet-400/40 transition-all text-base"
              >
                View Analytics <ChevronRight className="w-5 h-5 text-slate-400" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-y border-slate-800/80 bg-dark-800/60 glass-dark py-10"
      >
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.07 }}
            >
              <div className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-sm mt-1.5">{s.label}</div>
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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-dark-800 border border-slate-700/50 rounded-full px-4 py-1.5 mb-5">
            <Activity className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">Protocol Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">How Syncred Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            A new paradigm for onchain finance — transaction states that mirror real-world processes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-dark-800 border border-slate-700/50 ${f.border} ${f.bg} rounded-2xl p-6 transition-all duration-200 cursor-default shadow-lg`}
            >
              <div className={`${f.color} mb-4 w-12 h-12 rounded-xl bg-dark-900/60 flex items-center justify-center border border-slate-700/50`}>
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-800/30" />
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Async Execution Flow
            </h2>
            <p className="text-slate-400 text-lg">Five steps from request to settlement</p>
          </motion.div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex gap-5 items-center group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 border transition-all duration-200"
                  style={{
                    background: `${step.color}12`,
                    borderColor: `${step.color}40`,
                    color: step.color,
                    boxShadow: `0 0 0 0 ${step.color}20`,
                  }}
                >
                  {step.num}
                </div>
                <div className="glass bg-dark-800/60 border border-slate-700/50 group-hover:border-slate-600/70 rounded-2xl px-6 py-4 flex-1 transition-all duration-200">
                  <h3 className="text-white font-semibold">{step.title}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto relative overflow-hidden"
        >
          {/* Glow bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/8 via-transparent to-violet-500/8 rounded-3xl" />
          <div className="relative bg-dark-800 border border-neon-cyan/20 rounded-3xl p-12 shadow-2xl glow-cyan">
            <div className="w-16 h-16 bg-neon-cyan/10 border border-neon-cyan/25 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-neon-cyan" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to experience<br />async finance?
            </h2>
            <p className="text-slate-400 mb-8 text-base leading-relaxed">
              {IS_DEMO
                ? "Try the full experience in demo mode — no wallet needed. See real-time workflow state transitions and analytics."
                : "Connect your wallet on Goerli Testnet and request a loan — watch the verification workflow execute live onchain."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {IS_DEMO ? (
                <>
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 bg-neon-cyan text-dark-900 font-bold px-8 py-3.5 rounded-xl glow-cyan hover:bg-cyan-300 transition-all"
                    >
                      <FlaskConical className="w-5 h-5" /> Try Demo
                    </motion.button>
                  </Link>
                  <Link href="/analytics">
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 bg-dark-900 border border-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl hover:border-violet-400/40 transition-all"
                    >
                      <TrendingUp className="w-5 h-5 text-violet-400" /> Analytics
                    </motion.button>
                  </Link>
                </>
              ) : isConnected ? (
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 bg-neon-cyan text-dark-900 font-bold px-10 py-3.5 rounded-xl glow-cyan hover:bg-cyan-300 transition-all"
                  >
                    Launch Dashboard <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              ) : (
                <div className="flex justify-center">
                  <ConnectButton label="Connect Wallet to Start" />
                </div>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-slate-800">
              {[
                { icon: <CheckCircle className="w-4 h-4" />, text: "No fees" },
                { icon: <Shield className="w-4 h-4" />, text: "Testnet only" },
                { icon: <Zap className="w-4 h-4" />, text: "Open source" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <span className="text-neon-cyan/60">{t.icon}</span>
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
