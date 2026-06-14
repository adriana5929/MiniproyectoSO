import { prisma } from "./prisma";
let insertFloodRunning = false;
let totalInserted = 0;
export function getInsertFloodStatus() { return { running: insertFloodRunning, totalInserted }; }
export async function startInsertFlood(batchSize = 500, durationMs = 60000) {
  insertFloodRunning = true;
  totalInserted = 0;
  const endTime = Date.now() + durationMs;
  while (insertFloodRunning && Date.now() < endTime) {
    const batchId = 'batch-' + Date.now();
    await prisma.stressInsert.createMany({ data: Array.from({ length: batchSize }, () => ({ batchId, payload: Math.random().toString(36).repeat(20), value: Math.random()*10000 })) });
    totalInserted += batchSize;
  }
  insertFloodRunning = false;
}
export function stopInsertFlood() { insertFloodRunning = false; }
