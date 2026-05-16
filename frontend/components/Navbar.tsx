"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
  { href: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neon-cyan/20 rounded-lg flex items-center justify-center border border-neon-cyan/30">
            <Zap className="w-4 h-4 text-neon-cyan" />
          </div>
          <span className="font-bold text-white text-lg">
            Sync<span className="text-neon-cyan">red</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
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

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 bg-dark-700 border border-slate-700 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          <span className="text-neon-green text-xs font-mono">Rialo Testnet</span>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-dark-800 border-b border-slate-800 px-6 py-4 space-y-2"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  pathname === l.href ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400"
                }`}
              >
                {l.label}
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
}
