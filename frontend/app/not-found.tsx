"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 grid-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Glitchy 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mb-8 relative"
        >
          <div className="text-[10rem] font-bold font-mono leading-none select-none">
            <span className="text-neon-cyan/20">4</span>
            <span className="text-neon-cyan text-glow-cyan">0</span>
            <span className="text-neon-purple/20">4</span>
          </div>
          {/* Glitch layers */}
          <motion.div
            animate={{ x: [0, -4, 4, 0], opacity: [0, 0.4, 0.4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 text-[10rem] font-bold font-mono leading-none text-pink-500 pointer-events-none"
            style={{ clipPath: "inset(30% 0 50% 0)" }}
          >
            404
          </motion.div>
          <motion.div
            animate={{ x: [0, 4, -4, 0], opacity: [0, 0.3, 0.3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, delay: 0.1 }}
            className="absolute inset-0 text-[10rem] font-bold font-mono leading-none text-neon-cyan pointer-events-none"
            style={{ clipPath: "inset(60% 0 10% 0)" }}
          >
            404
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-neon-cyan/10 rounded-lg flex items-center justify-center border border-neon-cyan/20">
              <Zap className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="font-bold text-white text-lg">Sync<span className="text-neon-cyan">red</span></span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Workflow Not Found</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            This page doesn't exist. The async execution couldn't locate this route.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-neon-cyan text-dark-900 font-bold px-6 py-3 rounded-xl hover:bg-cyan-300 transition-all">
                <Home className="w-4 h-4" /> Go Home
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-dark-700 border border-slate-700 text-white font-semibold px-6 py-3 rounded-xl hover:border-neon-purple/40 transition-all">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
