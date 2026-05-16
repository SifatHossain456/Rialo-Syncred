"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Clock, TrendingUp, ChevronRight, Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const features = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Async Execution",
    desc: "Transactions pause and resume automatically based on real-world verification events.",
    color: "text-neon-cyan", glow: "glow-cyan",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Compliance Layer",
    desc: "KYC, credit scoring, and wallet analysis run automatically before any loan is issued.",
    color: "text-neon-purple", glow: "glow-purple",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Auto Settlement",
    desc: "Once verified, funds are released without any manual admin interaction required.",
    color: "text-neon-green", glow: "glow-green",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Real-time Dashboard",
    desc: "Live workflow tracking with state transitions, verification logs, and analytics.",
    color: "text-yellow-400", glow: "",
  },
];

const steps = [
  { num: "01", title: "Connect Wallet", desc: "Connect MetaMask on Goerli Testnet", color: "#00f5ff" },
  { num: "02", title: "Request Loan", desc: "Submit onchain loan request — enters PENDING", color: "#a855f7" },
  { num: "03", title: "Auto Verification", desc: "KYC + credit check runs automatically", color: "#fbbf24" },
  { num: "04", title: "Auto Resume", desc: "Contract executes after verification passes", color: "#00ff87" },
  { num: "05", title: "Funds Released", desc: "Settlement completes. No admin needed.", color: "#ff006e" },
];

export default function LandingPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-dark-900 grid-bg">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
            <span className="text-neon-cyan text-sm font-mono">Rialo Testnet — Live on Goerli</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Most chains process</span>
            <br />
            <span className="text-white">transactions</span>{" "}
            <span className="text-glow-cyan text-neon-cyan">instantly.</span>
            <br />
            <span className="text-white">We process</span>{" "}
            <span className="text-glow-purple text-neon-purple">workflows.</span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Syncred demonstrates Rialo-style async execution through a decentralized lending
            protocol that waits for real-world verification before completing settlement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isConnected ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-neon-cyan text-dark-900 font-bold px-8 py-4 rounded-xl glow-cyan hover:bg-cyan-300 transition-all"
                >
                  Open Dashboard <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ConnectButton label="Connect & Get Started" />
                <p className="text-slate-600 text-xs">Goerli or Sepolia Testnet</p>
              </div>
            )}
            <Link href="/analytics">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-dark-700 border border-slate-700 text-white font-semibold px-8 py-4 rounded-xl hover:border-neon-purple/50 transition-all"
              >
                View Analytics <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border-y border-slate-800 bg-dark-800/50 py-8"
      >
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Total Workflows", value: "1,247", color: "text-neon-cyan" },
            { label: "Approval Rate", value: "84.3%", color: "text-neon-green" },
            { label: "Avg. Settlement", value: "2.4s", color: "text-neon-purple" },
            { label: "Total Volume", value: "127 ETH", color: "text-yellow-400" },
          ].map((s, i) => (
            <div key={i}>
              <div className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">How Syncred Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A new paradigm for onchain finance — transaction states that mirror real-world processes.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`bg-dark-700 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all ${f.glow}`}
            >
              <div className={`${f.color} mb-4`}>{f.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-24 px-6 bg-dark-800/30">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white text-center mb-16"
          >
            Async Execution Flow
          </motion.h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex gap-5 items-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 border"
                  style={{ background: `${step.color}15`, borderColor: `${step.color}44`, color: step.color }}
                >
                  {step.num}
                </div>
                <div className="bg-dark-700 border border-slate-800 rounded-2xl p-5 flex-1">
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-gradient-to-br from-dark-700 to-dark-800 border border-neon-cyan/20 rounded-3xl p-12 glow-cyan"
        >
          <Wallet className="w-10 h-10 text-neon-cyan mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to experience async finance?</h2>
          <p className="text-slate-400 mb-8">
            Connect your wallet on Goerli Testnet and request a loan — watch the verification workflow execute live.
          </p>
          {isConnected ? (
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-neon-cyan text-dark-900 font-bold px-10 py-4 rounded-xl glow-cyan hover:bg-cyan-300 transition-all"
              >
                Launch Dashboard
              </motion.button>
            </Link>
          ) : (
            <div className="flex justify-center">
              <ConnectButton label="Connect Wallet to Start" />
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-600 text-sm">
        <span className="font-mono">Syncred</span> — Built on Rialo Testnet · Async Credit Protocol
      </footer>
    </div>
  );
}
