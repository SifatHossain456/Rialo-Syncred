"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, LayoutDashboard, User, Shield, BarChart2, Droplets, Home, BookOpen } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

const links = [
  { href: "/",          label: "Home",      icon: <Home className="w-4 h-4" /> },
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/profile",   label: "Profile",   icon: <User className="w-4 h-4" /> },
  { href: "/analytics", label: "Analytics", icon: <BarChart2 className="w-4 h-4" /> },
  { href: "/admin",     label: "Admin",     icon: <Shield className="w-4 h-4" /> },
  { href: "/faucet",    label: "Faucet",    icon: <Droplets className="w-4 h-4" /> },
  { href: "/deploy",    label: "Deploy",    icon: <BookOpen className="w-4 h-4" /> },
];

function NetworkBadge() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  const isValid = !!chain;

  if (!isConnected) {
    return (
      <div className="hidden md:flex items-center gap-2 bg-dark-800 border border-slate-700/60 rounded-full px-3 py-1.5">
        <span className="w-2 h-2 bg-slate-600 rounded-full" />
        <span className="text-slate-500 text-xs font-mono">Not Connected</span>
      </div>
    );
  }

  return (
    <div className={`hidden md:flex items-center gap-2 rounded-full px-3 py-1.5 border transition-all ${
      isValid
        ? "bg-emerald-400/8 border-emerald-400/25 hover:border-emerald-400/40"
        : "bg-red-500/8 border-red-500/25 hover:border-red-500/40"
    }`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${isValid ? "bg-emerald-400" : "bg-red-500"}`} />
      <span className={`text-xs font-mono ${isValid ? "text-emerald-400" : "text-red-400"}`}>
        {chain?.name ?? "Wrong Network"}
      </span>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 bg-neon-cyan/15 rounded-lg flex items-center justify-center border border-neon-cyan/25 group-hover:border-neon-cyan/50 group-hover:bg-neon-cyan/20 transition-all">
            <Zap className="w-4 h-4 text-neon-cyan" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Sync<span className="text-neon-cyan">red</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}>
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <span className={active ? "text-neon-cyan" : "text-slate-600"}>{l.icon}</span>
                  {l.label}
                </motion.span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <NetworkBadge />
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          />
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
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
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden glass-dark border-b border-slate-800/80"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}>
                      <span className={active ? "text-neon-cyan" : "text-slate-600"}>{l.icon}</span>
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
