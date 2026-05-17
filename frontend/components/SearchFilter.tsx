"use client";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export type FilterState = "all" | "0" | "1" | "2" | "3" | "4" | "5";
export type FilterType = "all" | "loan" | "payment";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filterState: FilterState;
  onFilterState: (v: FilterState) => void;
  filterType: FilterType;
  onFilterType: (v: FilterType) => void;
  total: number;
  filtered: number;
}

const STATE_OPTIONS: { value: FilterState; label: string; color: string }[] = [
  { value: "all", label: "All States", color: "text-slate-400" },
  { value: "0", label: "Pending", color: "text-yellow-400" },
  { value: "1", label: "Verifying", color: "text-blue-400" },
  { value: "4", label: "Completed", color: "text-neon-purple" },
  { value: "3", label: "Rejected", color: "text-pink-500" },
  { value: "5", label: "Cancelled", color: "text-slate-500" },
];

export default function SearchFilter({
  search, onSearch, filterState, onFilterState, filterType, onFilterType, total, filtered
}: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const hasFilter = filterState !== "all" || filterType !== "all" || search !== "";

  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by address or ID..."
            className="w-full bg-dark-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-neon-cyan/40 transition-all font-mono"
          />
          {search && (
            <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || hasFilter
              ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan"
              : "bg-dark-800 border-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasFilter && <span className="w-2 h-2 bg-neon-cyan rounded-full" />}
        </motion.button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-dark-800 border border-slate-700 rounded-xl p-4 space-y-3">
              {/* Type filter */}
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">Type</div>
                <div className="flex gap-2">
                  {(["all", "loan", "payment"] as FilterType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => onFilterType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        filterType === t
                          ? t === "loan" ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                            : t === "payment" ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                            : "bg-slate-700 text-white"
                          : "bg-dark-700 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* State filter */}
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">Status</div>
                <div className="flex flex-wrap gap-2">
                  {STATE_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => onFilterState(s.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filterState === s.value
                          ? `${s.color} bg-slate-700`
                          : "text-slate-500 bg-dark-700 hover:text-slate-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasFilter && (
                <button
                  onClick={() => { onSearch(""); onFilterState("all"); onFilterType("all"); }}
                  className="text-xs text-neon-cyan/70 hover:text-neon-cyan flex items-center gap-1 transition-all"
                >
                  <X className="w-3 h-3" /> Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count */}
      {hasFilter && (
        <div className="text-xs text-slate-500 font-mono">
          Showing <span className="text-neon-cyan">{filtered}</span> of {total} workflows
        </div>
      )}
    </div>
  );
}
