"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Menu, X, User } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
  { href: "/analytics", label: "Analytics" },
  { href: "/faucet", label: "Faucet" },
];

function NetworkBadge() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  const isValid = !!chain;

  if (!isConnected) {
    return (
      <div className="hidden md:flex items-center gap-2 bg-dark-700 border border-slate-700 rounded-full px-3 py-1.5">
        <span className="w-2 h-2 bg-slate-500 rounded-full" />
        <span className="text-slate-500 text-xs font-mono">Not Connected</span>
      </div>
    );
  }

  return (
    <div className={`hidden md:flex items-center gap-2 rounded-full px-3 py-1.5 border ${isValid ? "bg-neon-green/10 border-neon-green/30" : "bg-red-500/10 border-red-500/30"}`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${isValid ? "bg-neon-green" : "bg-red-500"}`} />
      <span className={`text-xs font-mono ${isValid ? "text-neon-green" : "text-red-400"}`}>
        {chain?.name || "Wrong Network"}
      </span>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-neon-cyan/20 rounded-lg flex items-center justify-center border border-neon-cyan/30">
            <Zap className="w-4 h-4 text-neon-cyan" />
          </div>
          <span className="font-bold text-white text-lg">
            Sync<span className="text-neon-cyan">red</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  pathname === l.href
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {l.label}
              </motion.span>
            </Link>
          ))}
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
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-dark-800 border-b border-slate-800 px-6 py-4 space-y-2"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              <div className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname === l.href ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400"}`}>
                {l.label}
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
}
