"use client";
import { useState, useEffect, useRef } from "react";

type Metrics = {
  cpu: number;
  ram: { total: number; used: number; free: number; percent: number };
  postgres: { active: number; idle: number; lockWaits: number };
  loadAvg: number[];
};

type MechanismState = {
  running: boolean;
  concurrency: number;
  batchSize: number;
  duration: number;
};

const defaultState = (): MechanismState => ({
  running: false,
  concurrency: 50,
  batchSize: 500,
  duration: 120000,
});

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [http, setHttp] = useState(defaultState());
  const [query, setQuery] = useState({ ...defaultState(), concurrency: 20 });
  const [insert, setInsert] = useState({ ...defaultState(), batchSize: 500 });
  const [lock, setLock] = useState({ ...defaultState(), concurrency: 30 });
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLog(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/metrics");
        const data = await res.json();
        setMetrics(data);
      } catch {
        // silencioso
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const control = async (
    endpoint: string,
    action: "start" | "stop",
    params: object,
    setter: (s: MechanismState) => void,
    current: MechanismState
  ) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...params }),
    });
    const data = await res.json();
    const running = data.status === "started";
    setter({ ...current, running });
    addLog(`${endpoint.split("/").pop()} → ${data.status}`);
  };

  const MetricCard = ({ label, value, unit, color }: { label: string; value: number | string; unit?: string; color: string }) => (
    <div className={`rounded-xl p-4 border-2 ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}<span className="text-sm ml-1 opacity-60">{unit}</span></p>
    </div>
  );

  const MechanismPanel = ({
    title, icon, color, state, setState, endpoint, extraParams, extraControls,
  }: {
    title: string; icon: string; color: string; state: MechanismState;
    setState: React.Dispatch<React.SetStateAction<MechanismState>>;
    endpoint: string; extraParams?: object;
    extraControls?: React.ReactNode;
  }) => (
    <div className={`rounded-2xl border-2 p-5 ${state.running ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${state.running ? "bg-red-500 text-white animate-pulse" : "bg-gray-200 text-gray-600"}`}>
          {state.running ? "● ACTIVO" : "○ INACTIVO"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {extraControls}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Duración (seg)</span>
          <input
            type="number"
            className="border rounded-lg px-3 py-1.5 text-sm"
            value={state.duration / 1000}
            onChange={e => setState(s => ({ ...s, duration: Number(e.target.value) * 1000 }))}
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => control(endpoint, "start", { ...extraParams, duration: state.duration }, setState as unknown as (s: MechanismState) => void, state)}
          disabled={state.running}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-bold py-2 rounded-xl transition"
        >
          ▶ Iniciar
        </button>
        <button
          onClick={() => control(endpoint, "stop", {}, setState as unknown as (s: MechanismState) => void, state)}
          disabled={!state.running}
          className="flex-1 bg-gray-700 hover:bg-gray-800 disabled:opacity-40 text-white font-bold py-2 rounded-xl transition"
        >
          ■ Detener
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">🔥 Servidor de Aplicaciones Bajo Estrés</h1>
          <p className="text-gray-500 mt-1">Panel de control — Universidad del Valle · Sistemas Operativos 2026-1</p>
        </div>

        {/* Métricas en tiempo real */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="CPU" value={metrics?.cpu ?? "—"} unit="%" color="border-orange-300 bg-orange-50 text-orange-900" />
          <MetricCard label="RAM usada" value={metrics?.ram.percent ?? "—"} unit="%" color="border-blue-300 bg-blue-50 text-blue-900" />
          <MetricCard label="Conexiones activas PG" value={metrics?.postgres.active ?? "—"} color="border-green-300 bg-green-50 text-green-900" />
          <MetricCard label="Lock waits PG" value={metrics?.postgres.lockWaits ?? "—"} color="border-purple-300 bg-purple-50 text-purple-900" />
        </div>

        {/* Load average */}
        {metrics && (
          <div className="bg-white rounded-xl border p-4 mb-8 flex gap-6">
            <div><span className="text-xs text-gray-400">Load avg 1m</span><p className="text-xl font-bold">{metrics.loadAvg[0].toFixed(2)}</p></div>
            <div><span className="text-xs text-gray-400">Load avg 5m</span><p className="text-xl font-bold">{metrics.loadAvg[1].toFixed(2)}</p></div>
            <div><span className="text-xs text-gray-400">Load avg 15m</span><p className="text-xl font-bold">{metrics.loadAvg[2].toFixed(2)}</p></div>
            <div><span className="text-xs text-gray-400">RAM total</span><p className="text-xl font-bold">{metrics.ram.total} MB</p></div>
            <div><span className="text-xs text-gray-400">RAM libre</span><p className="text-xl font-bold">{metrics.ram.free} MB</p></div>
            <div><span className="text-xs text-gray-400">PG idle</span><p className="text-xl font-bold">{metrics.postgres.idle}</p></div>
          </div>
        )}

        {/* Mecanismos de estrés */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MechanismPanel
            title="HTTP Flood" icon="🌊" color="red" state={http} setState={setHttp}
            endpoint="/api/stress/http"
            extraParams={{ concurrency: http.concurrency }}
            extraControls={
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Conexiones concurrentes</span>
                <input type="number" className="border rounded-lg px-3 py-1.5 text-sm"
                  value={http.concurrency}
                  onChange={e => setHttp(s => ({ ...s, concurrency: Number(e.target.value) }))} />
              </label>
            }
          />

          <MechanismPanel
            title="Query Flood" icon="🗄️" color="blue" state={query} setState={setQuery}
            endpoint="/api/stress/query"
            extraParams={{ concurrency: query.concurrency }}
            extraControls={
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Workers concurrentes</span>
                <input type="number" className="border rounded-lg px-3 py-1.5 text-sm"
                  value={query.concurrency}
                  onChange={e => setQuery(s => ({ ...s, concurrency: Number(e.target.value) }))} />
              </label>
            }
          />

          <MechanismPanel
            title="Insert Flood" icon="💾" color="green" state={insert} setState={setInsert}
            endpoint="/api/stress/insert"
            extraParams={{ batchSize: insert.batchSize }}
            extraControls={
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Tamaño del lote (filas)</span>
                <input type="number" className="border rounded-lg px-3 py-1.5 text-sm"
                  value={insert.batchSize}
                  onChange={e => setInsert(s => ({ ...s, batchSize: Number(e.target.value) }))} />
              </label>
            }
          />

          <MechanismPanel
            title="Lock Contention" icon="🔒" color="purple" state={lock} setState={setLock}
            endpoint="/api/stress/lock"
            extraParams={{ concurrency: lock.concurrency }}
            extraControls={
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Transacciones concurrentes</span>
                <input type="number" className="border rounded-lg px-3 py-1.5 text-sm"
                  value={lock.concurrency}
                  onChange={e => setLock(s => ({ ...s, concurrency: Number(e.target.value) }))} />
              </label>
            }
          />
        </div>

        {/* Log de eventos */}
        <div className="bg-gray-900 rounded-2xl p-5">
          <h3 className="text-green-400 font-mono font-bold mb-3">▶ Log de eventos</h3>
          <div ref={logRef} className="h-40 overflow-y-auto space-y-1">
            {log.length === 0 && <p className="text-gray-500 font-mono text-sm">Sin eventos aún...</p>}
            {log.map((entry, i) => (
              <p key={i} className="text-green-300 font-mono text-sm">{entry}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
