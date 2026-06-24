import React, { useState } from "react";

function TreeNode({ label, children, depth = 0 }) {
  const [open, setOpen] = useState(true);
  const hasKids = children && Object.keys(children).length > 0;
  const indent = depth * 20;

  return (
    <div className="tree-node" style={{ marginLeft: depth > 0 ? indent : 0 }}>
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${depth === 0 ? "mb-1" : ""}`}
        onClick={() => hasKids && setOpen((o) => !o)}
      >
        {/* connector line for non-root */}
        {depth > 0 && (
          <span className="text-purple-400/50 select-none">└─</span>
        )}
        {/* toggle arrow */}
        {hasKids ? (
          <span className="text-purple-300 text-xs select-none w-3">{open ? "▼" : "▶"}</span>
        ) : (
          <span className="w-3 inline-block" />
        )}
        <span
          className={`mono font-semibold px-2 py-0.5 rounded-md text-sm ${
            depth === 0
              ? "bg-purple-500/30 text-purple-200 border border-purple-400/40"
              : hasKids
              ? "bg-blue-500/20 text-blue-200"
              : "bg-white/10 text-gray-300"
          }`}
        >
          {label}
        </span>
        {!hasKids && depth > 0 && (
          <span className="text-gray-500 text-xs">leaf</span>
        )}
      </div>

      {hasKids && open && (
        <div className="ml-2 border-l border-white/10 pl-2">
          {Object.entries(children).map(([child, grandkids]) => (
            <TreeNode key={child} label={child} children={grandkids} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ root, treeObj }) {
  // treeObj is { "A": { "B": {}, "C": {} } }
  const rootChildren = treeObj[root] || {};
  return (
    <div className="p-2">
      <TreeNode label={root} children={rootChildren} depth={0} />
    </div>
  );
}
