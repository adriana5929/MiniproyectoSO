/**
 * HTTP Flood - Satura el event loop de Node.js
 * lanzando peticiones HTTP concurrentes al propio servidor.
 */

let httpFloodRunning = false;
let httpFloodConnections = 0;

export function getHttpFloodStatus() {
  return { running: httpFloodRunning, connections: httpFloodConnections };
}

export async function startHttpFlood(concurrency: number = 50, durationMs: number = 60000) {
  httpFloodRunning = true;
  const endTime = Date.now() + durationMs;

  const worker = async () => {
    while (httpFloodRunning && Date.now() < endTime) {
      httpFloodConnections++;
      try {
        await fetch("http://localhost:3000/api/ping", { signal: AbortSignal.timeout(5000) });
      } catch {
        // ignorar errores de conexion - el flood continua
      } finally {
        httpFloodConnections--;
      }
    }
  };

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  httpFloodRunning = false;
}

export function stopHttpFlood() {
  httpFloodRunning = false;
}
