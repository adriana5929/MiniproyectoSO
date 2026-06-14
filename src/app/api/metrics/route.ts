export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import os from "os";

function getCpuUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  }
  return Math.round((1 - totalIdle / totalTick) * 100);
}

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const active = await prisma.$queryRaw<{count:bigint}[]>`SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'active'`;
  const idle = await prisma.$queryRaw<{count:bigint}[]>`SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'idle'`;
  const locks = await prisma.$queryRaw<{count:bigint}[]>`SELECT COUNT(*) as count FROM pg_stat_activity WHERE wait_event_type = 'Lock'`;
  return NextResponse.json({
    cpu: getCpuUsage(),
    ram: {
      total: Math.round(totalMem / 1024 / 1024),
      used: Math.round(usedMem / 1024 / 1024),
      free: Math.round(freeMem / 1024 / 1024),
      percent: Math.round((usedMem / totalMem) * 100),
    },
    postgres: {
      active: Number(active[0]?.count ?? 0),
      idle: Number(idle[0]?.count ?? 0),
      lockWaits: Number(locks[0]?.count ?? 0),
    },
    loadAvg: os.loadavg(),
    uptime: os.uptime(),
  });
}
