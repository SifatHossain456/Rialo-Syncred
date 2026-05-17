"use client";
import Link from "next/link";
import { useChainId, useAccount } from "wagmi";
import { Zap, ExternalLink, Github, Twitter, Droplets, LayoutDashboard, User, Shield, BarChart2, Home } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { isDemoMode } from "@/lib/mockData";

const IS_DEMO = isDemoMode();

const NAV = [
  { label: "Home",      href: "/",          icon: <Home className="w-3.5 h-3.5" /> },
  { label: "Dashboard", href: "/dashboard",  icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { label: "Profile",   href: "/profile",    icon: <User className="w-3.5 h-3.5" /> },
  { label: "Analytics", href: "/analytics",  icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { label: "Admin",     href: "/admin",      icon: <Shield className="w-3.5 h-3.5" /> },
  { label: "Faucet",    href: "/faucet",     icon: <Droplets className="w-3.5 h-3.5" /> },
];

const STACK = ["Solidity 0.8.20", "Next.js 14", "wagmi v2", "viem", "Recharts", "Framer Motion"];

export default function Footer() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  const explorerBase = chainId === 11155111
    ? "https://sepolia.etherscan.io"
    : "https://goerli.etherscan.io";

  const isPlaceholder =
    !CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  return (
    <footer className="border-t border-slate-800/80 bg-dark-800/50 glass-dark mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neon-cyan/15 rounded-lg flex items-center justify-center border border-neon-cyan/25">
                <Zap className="w-4 h-4 text-neon-cyan" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                Sync<span className="text-neon-cyan">red</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Async credit and payment verification protocol. Demonstrating real-world financial workflows on blockchain.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/SifatHossain456/Rialo-Syncred"
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center bg-dark-900 border border-slate-700/60 rounded-lg text-slate-500 hover:text-white hover:border-slate-600 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center bg-dark-900 border border-slate-700/60 rounded-lg text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-white font-semibold mb-5 text-xs uppercase tracking-widest text-slate-400">Navigation</div>
            <div className="space-y-2.5">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}
                  className="flex items-center gap-2 text-slate-500 hover:text-neon-cyan text-sm transition-all group">
                  <span className="text-slate-700 group-hover:text-neon-cyan/70 transition-colors">{n.icon}</span>
                  {n.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contract info */}
          <div>
            <div className="text-slate-400 font-semibold mb-5 text-xs uppercase tracking-widest">Contract</div>
            <div className="space-y-4">
              <div>
                <div className="text-slate-600 text-xs mb-1.5">Network</div>
                <div className="flex items-center gap-2">
                  {IS_DEMO ? (
                    <>
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                      <span className="text-violet-400 text-sm font-mono">Demo Mode</span>
                    </>
                  ) : isConnected ? (
                    <>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-slate-300 text-sm font-mono">{chain?.name ?? "Unknown"}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-slate-600 rounded-full" />
                      <span className="text-slate-500 text-sm">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="text-slate-600 text-xs mb-1.5">Contract Address</div>
                {isPlaceholder ? (
                  <span className="text-slate-600 text-xs font-mono bg-dark-900 px-2 py-1 rounded-lg border border-slate-800">Not deployed</span>
                ) : (
                  <a
                    href={`${explorerBase}/address/${CONTRACT_ADDRESS}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-neon-cyan/70 hover:text-neon-cyan text-xs font-mono transition-all group"
                  >
                    {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                )}
              </div>
              <div>
                <div className="text-slate-600 text-xs mb-1.5">Explorer</div>
                <a href={explorerBase} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-all group">
                  {chainId === 11155111 ? "Sepolia" : "Goerli"} Etherscan
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-all" />
                </a>
              </div>
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <div className="text-slate-400 font-semibold mb-5 text-xs uppercase tracking-widest">Tech Stack</div>
            <div className="flex flex-wrap gap-2">
              {STACK.map((s) => (
                <span key={s}
                  className="text-xs text-slate-500 bg-dark-900 border border-slate-800 rounded-lg px-2.5 py-1 font-mono hover:border-slate-700 hover:text-slate-400 transition-all cursor-default"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-slate-600 text-xs font-mono">
            © 2026 Syncred · Built on Rialo Testnet · Async by design
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-neon-cyan/50 rounded-full animate-pulse" />
            <span className="text-neon-cyan/40 text-xs font-mono">
              {IS_DEMO ? "demo mode" : "live onchain"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
