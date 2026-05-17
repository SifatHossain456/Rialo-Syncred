"use client";
import { motion } from "framer-motion";

function Shimmer({ className }: { className: string }) {
  return (
    <motion.div
      className={`bg-slate-800 rounded-lg overflow-hidden relative ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </motion.div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5">
      <Shimmer className="w-10 h-10 rounded-xl mb-3" />
      <Shimmer className="w-20 h-6 mb-2" />
      <Shimmer className="w-16 h-4" />
    </div>
  );
}

export function SkeletonWorkflowRow() {
  return (
    <div className="p-4 flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Shimmer className="w-8 h-4" />
          <Shimmer className="w-12 h-4" />
        </div>
        <Shimmer className="w-32 h-4" />
        <Shimmer className="w-16 h-3" />
      </div>
      <div className="text-right space-y-2">
        <Shimmer className="w-20 h-5" />
        <Shimmer className="w-20 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRequestForm() {
  return (
    <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 space-y-4">
      <Shimmer className="w-32 h-6 mb-5" />
      <Shimmer className="w-full h-10 rounded-xl" />
      <Shimmer className="w-full h-28 rounded-xl" />
      <Shimmer className="w-full h-12 rounded-xl" />
    </div>
  );
}
