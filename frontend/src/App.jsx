import React, { useState } from "react";
import HierarchyCard from "./components/HierarchyCard.jsx";

// ⚠️  Replace with your hosted backend URL before deploying
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://bfhl-challenge-17a7.onrender.com";

const SAMPLE = `A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->H, G->I, hello, 1->2, A->`;

function Spinner() {
  return (
    <svg className="spinner w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function StatCard({ label, value, accent }) {
  const colors = {
    purple: "from-purple-500/20 to-purple-600/10 border-purple-400/30 text-purple-300",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-400/30 text-blue-300",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-400/30 text-emerald-300",
    red: "from-red-500/20 to-red-600/10 border-red-400/30 text-red-300",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[accent]} border rounded-xl p-4 text-center`}>
      <p className={`text-3xl font-bold mono ${colors[accent].split(" ").pop()}`}>{value}</p>
      <p className="text-white/60 text-xs mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const raw = input.trim();
    if (!raw) return;

    // Accept comma-separated or newline-separated or space-separated
    const data = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/bfhl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError(err.message || "Failed to reach the API. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/60 text-xs mono">
          POST /bfhl • Hierarchy Explorer
        </div>
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          Node{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Hierarchy
          </span>{" "}
          Analyzer
        </h1>
        <p className="text-white/50 text-lg">
          Enter edge pairs like <span className="mono text-purple-300">A-&gt;B</span> to explore tree structures, cycles, and depths.
        </p>
      </header>

      {/* ── Input Panel ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto glass p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-white/70 text-sm font-medium">Node Edges</label>
          <button
            onClick={() => setInput(SAMPLE)}
            className="text-purple-400 text-xs hover:text-purple-300 transition-colors mono"
          >
            Load sample →
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"A->B, A->C, B->D\n\nSeparate by comma, space, or newline."}
          rows={5}
          className="w-full bg-black/30 text-white mono text-sm rounded-xl border border-white/20 p-4 resize-none outline-none focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 transition-all placeholder-white/20"
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            {loading ? <Spinner /> : <span>▶</span>}
            {loading ? "Analyzing…" : "Analyze"}
          </button>
          {result && (
            <button
              onClick={() => { setResult(null); setInput(""); }}
              className="px-4 py-3 text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6 glass bg-red-500/10 border-red-400/30 px-5 py-4 text-red-300 flex items-start gap-3">
          <span className="text-xl">⚠</span>
          <div>
            <p className="font-semibold">Request Failed</p>
            <p className="text-sm text-red-300/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────── */}
      {result && (
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Identity strip */}
          <div className="glass px-5 py-3 flex flex-wrap gap-4 text-sm">
            {[["user_id", result.user_id], ["email", result.email_id], ["roll", result.college_roll_number]].map(([k, v]) => (
              <span key={k} className="text-white/50">
                <span className="text-white/30 mr-1">{k}:</span>
                <span className="mono text-white/80">{v}</span>
              </span>
            ))}
          </div>

          {/* Summary stats */}
          <div>
            <h2 className="text-white/60 uppercase text-xs tracking-widest mb-3 font-semibold">Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Valid Trees" value={result.summary.total_trees} accent="emerald" />
              <StatCard label="Cycles" value={result.summary.total_cycles} accent="red" />
              <StatCard label="Largest Root" value={result.summary.largest_tree_root || "—"} accent="purple" />
              <StatCard label="Hierarchies" value={result.hierarchies.length} accent="blue" />
            </div>
          </div>

          {/* Badges: invalid + duplicates */}
          {(result.invalid_entries.length > 0 || result.duplicate_edges.length > 0) && (
            <div className="glass px-5 py-4 space-y-3">
              {result.invalid_entries.length > 0 && (
                <div>
                  <span className="text-white/40 text-xs uppercase tracking-wider font-semibold block mb-2">
                    Invalid Entries ({result.invalid_entries.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.invalid_entries.map((e, i) => (
                      <span key={i} className="badge bg-red-500/15 text-red-300 border border-red-400/25">
                        {e || '""'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.duplicate_edges.length > 0 && (
                <div>
                  <span className="text-white/40 text-xs uppercase tracking-wider font-semibold block mb-2">
                    Duplicate Edges ({result.duplicate_edges.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.duplicate_edges.map((e, i) => (
                      <span key={i} className="badge bg-amber-500/15 text-amber-300 border border-amber-400/25">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hierarchy cards */}
          <div>
            <h2 className="text-white/60 uppercase text-xs tracking-widest mb-3 font-semibold">
              Hierarchies ({result.hierarchies.length})
            </h2>
            <div className="space-y-3">
              {result.hierarchies.map((h, i) => (
                <HierarchyCard key={h.root + i} h={h} index={i} />
              ))}
            </div>
          </div>

          {/* Raw JSON toggle */}
          <details className="glass px-5 py-3 cursor-pointer group">
            <summary className="text-white/40 text-sm select-none group-open:text-white/60">
              Raw JSON response
            </summary>
            <pre className="mt-3 text-xs mono text-green-300/80 overflow-auto max-h-80">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <footer className="max-w-4xl mx-auto mt-12 text-center text-white/20 text-xs mono">
        BFHL — Chitkara Full Stack Engineering Challenge
      </footer>
    </div>
  );
}
