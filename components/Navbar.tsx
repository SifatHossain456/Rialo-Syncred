"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, User, Shield, BarChart2, Droplets, Home, TrendingUp, TrendingDown } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useGasPrice } from "wagmi";
import { formatGwei } from "viem";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";
import { useEthPrice } from "@/hooks/useEthPrice";

const links = [
  { href: "/",          label: "Home",      icon: <Home className="w-3.5 h-3.5" /> },
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { href: "/profile",   label: "Profile",   icon: <User className="w-3.5 h-3.5" /> },
  { href: "/analytics", label: "Analytics", icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { href: "/admin",     label: "Admin",     icon: <Shield className="w-3.5 h-3.5" /> },
  { href: "/faucet",    label: "Faucet",    icon: <Droplets className="w-3.5 h-3.5" /> },
];

function EthTicker() {
  const { price, change24h } = useEthPrice();
  const { data: gasData } = useGasPrice();
  const { isConnected } = useAccount();

  const up = (change24h ?? 0) >= 0;
  const gasFmt = gasData ? Math.round(parseFloat(formatGwei(gasData))) : null;

  if (!price && !gasData) return null;

  return (
    <div className="hidden lg:flex items-center gap-1.5">
      {price && (
        <div className="flex items-center gap-2 bg-dark-800/80 border border-white/[0.06] rounded-xl px-3 py-1.5 text-xs font-mono">
          <span className="text-slate-500">ETH</span>
          <span className="text-white font-semibold">${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          {change24h !== null && (
            <span className={`flex items-center gap-0.5 font-medium ${up ? "text-emerald-400" : "text-rose-400"}`}>
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change24h).toFixed(1)}%
            </span>
          )}
        </div>
      )}
      {gasFmt !== null && isConnected && (
        <div className="flex items-center gap-1.5 bg-dark-800/80 border border-white/[0.06] rounded-xl px-3 py-1.5 text-xs font-mono">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-300 font-semibold">{gasFmt}</span>
          <span className="text-slate-500">gwei</span>
        </div>
      )}
    </div>
  );
}

function NetworkBadge() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  const isValid = !!chain;

  if (!isConnected) {
    return (
      <div className="hidden md:flex items-center gap-1.5 bg-dark-800/80 border border-white/[0.05] rounded-xl px-3 py-1.5">
        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
        <span className="text-slate-500 text-xs font-mono">Not Connected</span>
      </div>
    );
  }

  return (
    <div className={`hidden md:flex items-center gap-1.5 rounded-xl px-3 py-1.5 border text-xs font-mono transition-all ${
      isValid
        ? "bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400"
        : "bg-rose-500/[0.06] border-rose-500/20 text-rose-400"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isValid ? "bg-emerald-400" : "bg-rose-400"}`} />
      {chain?.name ?? "Wrong Network"}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20 group-hover:border-indigo-400/40 transition-all">
            <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-white text-[17px] tracking-tight">
            Sync<span className="text-indigo-400">red</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}>
                <span className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}>
                  <span className={active ? "text-indigo-400" : "text-slate-600"}>{l.icon}</span>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <EthTicker />
          <NetworkBadge />
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          />
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.05]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden overflow-hidden border-b border-white/[0.05] bg-dark-900/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-0.5">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}>
                      <span className={active ? "text-indigo-400" : "text-slate-600"}>{l.icon}</span>
                      {l.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
