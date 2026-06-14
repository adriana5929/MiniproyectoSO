/**
 * Insert Flood - Estresa el I/O de disco mediante
 * escritura masiva al WAL (Write-Ahead Log) de PostgreSQL.
 */
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
let insertFloodRunning = false;
let totalInserted = 0;

export function getInsertFloodStatus() {
  return { running: insertFloodRunning, totalInserted };
}

export async function startInsertFlood(batchSize: number = 500, durationMs: number = 60000) {
  insertFloodRunning = true;
  totalInserted = 0;
  const endTime = Date.now() + durationMs;

  while (insertFloodRunning && Date.now() < endTime) {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Batch INSERT masivo - cada batch estressa el WAL
    const data = Array.from({ length: batchSize }, () => ({
      batchId,
      payload: Math.random().toString(36).repeat(20), // ~700 bytes por fila
      value: Math.random() * 10000,
    }));

    await prisma.stressInsert.createMany({ data });
    totalInserted += batchSize;

    // Limpiar periodicamente para no agotar disco
    if (totalInserted % 10000 === 0) {
      await prisma.stressInsert.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - 60000) } },
      });
    }
  }

  insertFloodRunning = false;
}

export function stopInsertFlood() {
  insertFloodRunning = false;
}
