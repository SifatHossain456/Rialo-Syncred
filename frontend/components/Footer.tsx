"use client";
import Link from "next/link";
import { useChainId, useAccount } from "wagmi";
import { Zap, ExternalLink, Github, Twitter, Droplets } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "Admin", href: "/admin" },
  { label: "Analytics", href: "/analytics" },
  { label: "Faucet", href: "/faucet" },
];

export default function Footer() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  const explorerBase = chainId === 11155111
    ? "https://sepolia.etherscan.io"
    : "https://goerli.etherscan.io";

  const isPlaceholder = CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  return (
    <footer className="border-t border-slate-800 bg-dark-800/40 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neon-cyan/20 rounded-lg flex items-center justify-center border border-neon-cyan/30">
                <Zap className="w-4 h-4 text-neon-cyan" />
              </div>
              <span className="font-bold text-white text-lg">
                Sync<span className="text-neon-cyan">red</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Async credit and payment verification protocol built on Rialo Testnet. Demonstrating real-world financial workflows on blockchain.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://github.com/SifatHossain456/Rialo-Syncred" target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-neon-cyan transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Navigation</div>
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}
                  className="text-slate-500 hover:text-neon-cyan text-sm transition-all flex items-center gap-1.5">
                  {n.label === "Faucet" && <Droplets className="w-3.5 h-3.5" />}
                  {n.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contract info */}
          <div>
            <div className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contract</div>
            <div className="space-y-3">
              <div>
                <div className="text-slate-600 text-xs mb-1">Network</div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
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
                <div className="text-slate-600 text-xs mb-1">Contract Address</div>
                {isPlaceholder ? (
                  <span className="text-slate-600 text-xs font-mono">Not deployed yet</span>
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
                <div className="text-slate-600 text-xs mb-1">Explorer</div>
                <a href={explorerBase} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-all">
                  {chainId === 11155111 ? "Sepolia" : "Goerli"} Etherscan
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-slate-600 text-xs font-mono">
            © 2026 Syncred · Built on Rialo Testnet
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>Solidity 0.8.20</span>
            <span>·</span>
            <span>Next.js 14</span>
            <span>·</span>
            <span>wagmi v2</span>
            <span>·</span>
            <span className="text-neon-cyan/50">Async by design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
