import { useState, useCallback, useEffect, useRef } from "react";

// Graph data matching the SQL DML
const NODES = [
  { id: 1, nombre: "A - Almacén Central", lat: 40.7128, lng: -74.006 },
  { id: 2, nombre: "B - Centro Distribución", lat: 40.7135, lng: -74.007 },
  { id: 3, nombre: "C - Plaza Principal", lat: 40.714, lng: -74.005 },
  { id: 4, nombre: "D - Zona Industrial", lat: 40.715, lng: -74.008 },
  { id: 5, nombre: "E - Terminal Norte", lat: 40.716, lng: -74.003 },
];

const EDGES = [
  { from: 1, to: 2, dist: 100, time: 20 },
  { from: 1, to: 3, dist: 150, time: 30 },
  { from: 2, to: 3, dist: 80, time: 16 },
  { from: 2, to: 4, dist: 200, time: 40 },
  { from: 3, to: 4, dist: 120, time: 24 },
  { from: 3, to: 5, dist: 250, time: 50 },
  { from: 4, to: 5, dist: 180, time: 36 },
];

// Build adjacency list
function buildAdj() {
  const adj = {};
  NODES.forEach((n) => (adj[n.id] = []));
  EDGES.forEach((e) => {
    adj[e.from].push({ to: e.to, dist: e.dist, time: e.time });
    adj[e.to].push({ to: e.from, dist: e.dist, time: e.time });
  });
  return adj;
}

// Haversine heuristic
function haversine(n1, n2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dlat = toRad(n2.lat - n1.lat);
  const dlon = toRad(n2.lng - n1.lng);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(toRad(n1.lat)) * Math.cos(toRad(n2.lat)) * Math.sin(dlon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Dijkstra
function dijkstra(adj, src, dst, criterion) {
  const dist = {},
    prev = {},
    visited = new Set(),
    steps = [];
  NODES.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  });
  dist[src] = 0;
  const pq = [{ id: src, cost: 0 }];
  let nodesExplored = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { id: u } = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    nodesExplored++;
    steps.push({ node: u, dist: { ...dist }, type: "explore" });
    if (u === dst) break;
    for (const edge of adj[u]) {
      const w = criterion === "distancia" ? edge.dist : edge.time;
      const alt = dist[u] + w;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
        pq.push({ id: edge.to, cost: alt });
        steps.push({ node: edge.to, dist: { ...dist }, type: "update" });
      }
    }
  }

  const path = [];
  let cur = dst;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev[cur];
  }
  if (path[0] !== src) return { path: [], totalDist: Infinity, totalTime: Infinity, steps, nodesExplored };

  let totalDist = 0,
    totalTime = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const e = adj[path[i]].find((x) => x.to === path[i + 1]);
    totalDist += e.dist;
    totalTime += e.time;
  }
  return { path, totalDist, totalTime, steps, nodesExplored };
}

// A*
function astar(adj, src, dst, criterion) {
  const nodeMap = {};
  NODES.forEach((n) => (nodeMap[n.id] = n));
  const g = {},
    f = {},
    prev = {},
    visited = new Set(),
    steps = [];
  NODES.forEach((n) => {
    g[n.id] = Infinity;
    f[n.id] = Infinity;
    prev[n.id] = null;
  });
  g[src] = 0;
  f[src] = haversine(nodeMap[src], nodeMap[dst]);
  const pq = [{ id: src, cost: f[src] }];
  let nodesExplored = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { id: u } = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    nodesExplored++;
    steps.push({ node: u, dist: { ...g }, type: "explore" });
    if (u === dst) break;
    for (const edge of adj[u]) {
      const w = criterion === "distancia" ? edge.dist : edge.time;
      const tentG = g[u] + w;
      if (tentG < g[edge.to]) {
        prev[edge.to] = u;
        g[edge.to] = tentG;
        f[edge.to] = tentG + haversine(nodeMap[edge.to], nodeMap[dst]);
        pq.push({ id: edge.to, cost: f[edge.to] });
        steps.push({ node: edge.to, dist: { ...g }, type: "update" });
      }
    }
  }

  const path = [];
  let cur = dst;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev[cur];
  }
  if (path[0] !== src) return { path: [], totalDist: Infinity, totalTime: Infinity, steps, nodesExplored };

  let totalDist = 0,
    totalTime = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const e = adj[path[i]].find((x) => x.to === path[i + 1]);
    totalDist += e.dist;
    totalTime += e.time;
  }
  return { path, totalDist, totalTime, steps, nodesExplored };
}

// SVG Map component
function GraphMap({ result, origin, destination }) {
  const nodeMap = {};
  NODES.forEach((n) => (nodeMap[n.id] = n));

  // Scale lat/lng to SVG coordinates
  const minLat = 40.7125, maxLat = 40.7165, minLng = -74.009, maxLng = -74.002;
  const scale = (node) => ({
    x: 40 + ((node.lng - minLng) / (maxLng - minLng)) * 520,
    y: 40 + ((maxLat - node.lat) / (maxLat - minLat)) * 320,
  });

  const pathSet = new Set();
  if (result?.path) {
    for (let i = 0; i < result.path.length - 1; i++) {
      pathSet.add(`${result.path[i]}-${result.path[i + 1]}`);
      pathSet.add(`${result.path[i + 1]}-${result.path[i]}`);
    }
  }

  const exploredNodes = new Set(result?.steps?.filter((s) => s.type === "explore").map((s) => s.node) || []);

  return (
    <svg viewBox="0 0 600 400" className="w-full rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>
      {/* Grid */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`gv${i}`} x1={40 + i * 130} y1={30} x2={40 + i * 130} y2={370} stroke="#e2e8f0" strokeWidth="0.5" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`gh${i}`} x1={30} y1={40 + i * 106} x2={570} y2={40 + i * 106} stroke="#e2e8f0" strokeWidth="0.5" />
      ))}

      {/* Edges */}
      {EDGES.map((e) => {
        const p1 = scale(nodeMap[e.from]);
        const p2 = scale(nodeMap[e.to]);
        const isOnPath = pathSet.has(`${e.from}-${e.to}`);
        return (
          <g key={`e${e.from}-${e.to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={isOnPath ? "#ef4444" : "#cbd5e1"} strokeWidth={isOnPath ? 4 : 2} strokeLinecap="round" filter={isOnPath ? "url(#glow)" : undefined} />
            <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 8} textAnchor="middle" fontSize="10" fill={isOnPath ? "#dc2626" : "#94a3b8"} fontWeight={isOnPath ? "bold" : "normal"}>
              {e.dist}m / {e.time}s
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {NODES.map((n) => {
        const pos = scale(n);
        const isOrigin = n.id === origin;
        const isDestination = n.id === destination;
        const isOnPath = result?.path?.includes(n.id);
        const wasExplored = exploredNodes.has(n.id);
        let fill = "#64748b";
        let r = 16;
        if (isOrigin) { fill = "#22c55e"; r = 20; }
        else if (isDestination) { fill = "#ef4444"; r = 20; }
        else if (isOnPath) { fill = "#f59e0b"; r = 18; }
        else if (wasExplored) { fill = "#a78bfa"; r = 16; }

        return (
          <g key={`n${n.id}`}>
            <circle cx={pos.x} cy={pos.y} r={r + 3} fill="white" opacity="0.8" />
            <circle cx={pos.x} cy={pos.y} r={r} fill={fill} stroke="white" strokeWidth="3" filter="url(#glow)" />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="white" fontWeight="bold">
              {n.nombre.charAt(0)}
            </text>
            <text x={pos.x} y={pos.y + r + 16} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600">
              {n.nombre.split(" - ")[1] || n.nombre}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(420, 340)">
        <circle cx={0} cy={0} r={6} fill="#22c55e" />
        <text x={10} y={4} fontSize="10" fill="#64748b">Origen</text>
        <circle cx={70} cy={0} r={6} fill="#ef4444" />
        <text x={80} y={4} fontSize="10" fill="#64748b">Destino</text>
        <circle cx={145} cy={0} r={6} fill="#a78bfa" />
        <text x={155} y={4} fontSize="10" fill="#64748b">Explorado</text>
      </g>
    </svg>
  );
}

export default function App() {
  const adj = useRef(buildAdj()).current;
  const [origin, setOrigin] = useState(1);
  const [destination, setDestination] = useState(5);
  const [strategy, setStrategy] = useState("dijkstra");
  const [criterion, setCriterion] = useState("distancia");
  const [result, setResult] = useState(null);
  const [compResult, setCompResult] = useState(null);

  const calculate = useCallback(() => {
    const fn = strategy === "dijkstra" ? dijkstra : astar;
    const res = fn(adj, origin, destination, criterion);
    setResult(res);

    // Also run the other for comparison
    const otherFn = strategy === "dijkstra" ? astar : dijkstra;
    const otherRes = otherFn(adj, origin, destination, criterion);
    setCompResult(otherRes);
  }, [adj, origin, destination, strategy, criterion]);

  useEffect(() => {
    calculate();
  }, []);

  const nodeLabel = (id) => NODES.find((n) => n.id === id)?.nombre || id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Optimizador de Rutas para Reparto
          </h1>
          <p className="text-slate-400 text-sm">Patrón Strategy — Dijkstra vs A*</p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Origen</label>
              <select value={origin} onChange={(e) => setOrigin(+e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-red-400 focus:outline-none">
                {NODES.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Destino</label>
              <select value={destination} onChange={(e) => setDestination(+e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-red-400 focus:outline-none">
                {NODES.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Estrategia</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-red-400 focus:outline-none">
                <option value="dijkstra">Dijkstra</option>
                <option value="astar">A* (heurística)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Criterio</label>
              <select value={criterion} onChange={(e) => setCriterion(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-red-400 focus:outline-none">
                <option value="distancia">Distancia (m)</option>
                <option value="tiempo">Tiempo (s)</option>
              </select>
            </div>
          </div>
          <button onClick={calculate} className="mt-3 w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2.5 rounded-lg transition-all text-sm shadow-lg shadow-red-500/20">
            Calcular Ruta
          </button>
        </div>

        {/* Map */}
        <GraphMap result={result} origin={origin} destination={destination} />

        {/* Results */}
        {result && result.path.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Primary result */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${strategy === "dijkstra" ? "bg-blue-400" : "bg-green-400"}`} />
                <span className="font-bold text-sm">{strategy === "dijkstra" ? "Dijkstra" : "A*"} (seleccionado)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-red-400">{result.totalDist}</div>
                  <div className="text-xs text-slate-400">metros</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-orange-400">{result.totalTime}</div>
                  <div className="text-xs text-slate-400">segundos</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-purple-400">{result.nodesExplored}</div>
                  <div className="text-xs text-slate-400">nodos explorados</div>
                </div>
              </div>
              <div className="text-xs text-slate-300">
                <span className="text-slate-400">Ruta: </span>
                {result.path.map((id, i) => (
                  <span key={id}>
                    {i > 0 && <span className="text-red-400 mx-1">→</span>}
                    <span className="font-medium">{NODES.find((n) => n.id === id)?.nombre.charAt(0)}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Comparison */}
            {compResult && compResult.path.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${strategy !== "dijkstra" ? "bg-blue-400" : "bg-green-400"}`} />
                  <span className="font-bold text-sm">{strategy !== "dijkstra" ? "Dijkstra" : "A*"} (comparación)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-xl font-bold text-red-400">{compResult.totalDist}</div>
                    <div className="text-xs text-slate-400">metros</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-xl font-bold text-orange-400">{compResult.totalTime}</div>
                    <div className="text-xs text-slate-400">segundos</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-xl font-bold text-purple-400">{compResult.nodesExplored}</div>
                    <div className="text-xs text-slate-400">nodos explorados</div>
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-slate-400">Ruta: </span>
                  {compResult.path.map((id, i) => (
                    <span key={id}>
                      {i > 0 && <span className="text-slate-500 mx-1">→</span>}
                      <span className="font-medium">{NODES.find((n) => n.id === id)?.nombre.charAt(0)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result && result.path.length === 0 && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center text-red-300">
            No se encontró ruta entre los puntos seleccionados
          </div>
        )}

        {/* Algorithm steps */}
        {result && result.steps && (
          <details className="bg-slate-800/50 rounded-xl border border-slate-700">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-slate-300 hover:text-white">
              Ver pasos del algoritmo ({result.steps.filter((s) => s.type === "explore").length} nodos explorados)
            </summary>
            <div className="px-4 pb-3 space-y-1 max-h-48 overflow-y-auto">
              {result.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <span className={`w-16 px-1.5 py-0.5 rounded text-center ${step.type === "explore" ? "bg-purple-500/20 text-purple-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                    {step.type === "explore" ? "VISITA" : "ACTUALIZA"}
                  </span>
                  <span className="text-slate-400">Nodo</span>
                  <span className="font-bold text-white">{NODES.find((n) => n.id === step.node)?.nombre.charAt(0)}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="text-center text-xs text-slate-500 pb-2">
          Patrón Strategy: interfaz EstrategiaRuta → implementaciones Dijkstra y A* intercambiables en tiempo de ejecución
        </div>
      </div>
    </div>
  );
}
