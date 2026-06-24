import React, { useState } from "react";
import TreeView from "./TreeView.jsx";

export default function HierarchyCard({ h, index }) {
  const [open, setOpen] = useState(true);
  const isCycle = h.has_cycle === true;

  return (
    <div className={`glass-dark overflow-hidden transition-all duration-200`}>
      {/* Card header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm mono">#{String(index + 1).padStart(2, "0")}</span>
          <span className="mono font-bold text-lg text-white">Root: {h.root}</span>
          {isCycle ? (
            <span className="badge bg-red-500/20 text-red-300 border border-red-400/30">
              ⟳ Cycle
            </span>
          ) : (
            <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              ✓ Tree
            </span>
          )}
          {!isCycle && (
            <span className="badge bg-blue-500/20 text-blue-300 border border-blue-400/30">
              depth: {h.depth}
            </span>
          )}
        </div>
        <span className="text-white/40 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {/* Card body */}
      {open && (
        <div className="px-5 pb-5">
          <div className="h-px bg-white/10 mb-4" />
          {isCycle ? (
            <div className="flex items-center gap-3 py-3">
              <span className="text-4xl">⟳</span>
              <div>
                <p className="text-red-300 font-semibold">Cycle Detected</p>
                <p className="text-white/50 text-sm">
                  All nodes in this group form a cycle. No tree structure can be built.
                </p>
              </div>
            </div>
          ) : (
            <TreeView root={h.root} treeObj={h.tree} />
          )}
        </div>
      )}
    </div>
  );
}
