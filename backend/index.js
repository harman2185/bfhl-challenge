const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── Identity (replace with your actual details) ──────────────────────────────
const USER_ID = "harmandeepkaurthind_15072004";       // e.g. "johndoe_17091999"
const EMAIL_ID = "harman0428.be23@chitkara.edu.in";
const ROLL_NUMBER = "2310990428";
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if entry is a valid X->Y (single uppercase letters, no self-loop) */
function isValid(entry) {
  return /^[A-Z]->[A-Z]$/.test(entry);
}

/** Detect cycle in a directed graph using DFS */
function hasCycle(nodes, adjList) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};
  nodes.forEach((n) => (color[n] = WHITE));

  function dfs(u) {
    color[u] = GRAY;
    for (const v of adjList[u] || []) {
      if (color[v] === GRAY) return true;   // back-edge → cycle
      if (color[v] === WHITE && dfs(v)) return true;
    }
    color[u] = BLACK;
    return false;
  }

  return nodes.some((n) => color[n] === WHITE && dfs(n));
}

/** Build nested tree object recursively */
function buildTree(node, adjList) {
  const children = {};
  for (const child of adjList[node] || []) {
    children[child] = buildTree(child, adjList);
  }
  return children;
}

/** Depth = longest root-to-leaf node count */
function calcDepth(node, adjList) {
  const kids = adjList[node] || [];
  if (!kids.length) return 1;
  return 1 + Math.max(...kids.map((k) => calcDepth(k, adjList)));
}

app.post("/bfhl", (req, res) => {
  const data = req.body.data || [];

  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();

  // childParent maps child → first parent (for multi-parent resolution)
  const childParent = {};
  // adjList maps parent → [children] (ordered, deduped, single-parent-wins)
  const adjList = {};
  const allNodes = new Set();

  for (const raw of data) {
    const entry = typeof raw === "string" ? raw.trim() : String(raw).trim();

    // Validate
    if (!isValid(entry)) {
      invalid_entries.push(entry);
      continue;
    }

    const [parent, child] = entry.split("->");

    // Duplicate check
    if (seenEdges.has(entry)) {
      if (!duplicate_edges.includes(entry)) duplicate_edges.push(entry);
      continue;
    }
    seenEdges.add(entry);

    // Multi-parent: first-seen parent wins, silently discard extras
    if (childParent[child] !== undefined && childParent[child] !== parent) continue;
    childParent[child] = parent;

    if (!adjList[parent]) adjList[parent] = [];
    adjList[parent].push(child);
    allNodes.add(parent);
    allNodes.add(child);
  }

  // ── Group nodes into connected components (undirected) ─────────────────────
  const visited = new Set();

  function collectComponent(start) {
    const stack = [start];
    const comp = new Set();
    while (stack.length) {
      const n = stack.pop();
      if (comp.has(n)) continue;
      comp.add(n);
      (adjList[n] || []).forEach((c) => stack.push(c));
      // traverse parents too (undirected component)
      allNodes.forEach((node) => {
        if ((adjList[node] || []).includes(n) && !comp.has(node)) stack.push(node);
      });
    }
    return comp;
  }

  const components = [];
  for (const node of allNodes) {
    if (!visited.has(node)) {
      const comp = collectComponent(node);
      comp.forEach((n) => visited.add(n));
      components.push([...comp]);
    }
  }

  // ── Build hierarchies ───────────────────────────────────────────────────────
  const hierarchies = [];

  for (const comp of components) {
    // Nodes that never appear as a child within this component
    const childSet = new Set(
      comp.flatMap((n) => (adjList[n] || []).filter((c) => comp.includes(c)))
    );
    const roots = comp.filter((n) => !childSet.has(n)).sort();

    // Build local adjList for this component
    const localAdj = {};
    comp.forEach((n) => {
      localAdj[n] = (adjList[n] || []).filter((c) => comp.includes(c));
    });

    if (hasCycle(comp, localAdj)) {
      // Pure cycle: use lex-smallest node as root
      const root = [...comp].sort()[0];
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      // Could be a forest (multiple roots in one component is edge-case; treat each root separately)
      const rootList = roots.length ? roots : [comp.sort()[0]];
      for (const root of rootList) {
        const tree = { [root]: buildTree(root, localAdj) };
        const depth = calcDepth(root, localAdj);
        hierarchies.push({ root, tree, depth });
      }
    }
  }

  // Sort hierarchies: non-cyclic first by root, then cyclic (mirrors example ordering)
  hierarchies.sort((a, b) => {
    if (a.has_cycle && !b.has_cycle) return 1;
    if (!a.has_cycle && b.has_cycle) return -1;
    return a.root < b.root ? -1 : 1;
  });

  // ── Summary ─────────────────────────────────────────────────────────────────
  const trees = hierarchies.filter((h) => !h.has_cycle);
  const total_trees = trees.length;
  const total_cycles = hierarchies.filter((h) => h.has_cycle).length;

  let largest_tree_root = "";
  if (trees.length) {
    const best = trees.reduce((acc, h) => {
      if (h.depth > acc.depth) return h;
      if (h.depth === acc.depth && h.root < acc.root) return h;
      return acc;
    });
    largest_tree_root = best.root;
  }

  res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: ROLL_NUMBER,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: { total_trees, total_cycles, largest_tree_root },
  });
});

// Health check
app.get("/", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BFHL API running on port ${PORT}`));
