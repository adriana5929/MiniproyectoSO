import { prisma } from "./prisma";
let lockRunning = false;
let lockWaits = 0;
export function getLockStatus() { return { running: lockRunning, lockWaits }; }
async function seedLockRows() {
  const count = await prisma.lockTest.count();
  if (count >= 10) return;
  await Promise.all(Array.from({ length: 10 }, (_, i) => prisma.lockTest.upsert({ where: { token: `lock-token-${i}` }, update: {}, create: { token: `lock-token-${i}`, counter: 0 } })));
}
export async function startLockContention(concurrency = 30, durationMs = 60000) {
  lockRunning = true; lockWaits = 0;
  await seedLockRows();
  const endTime = Date.now() + durationMs;
  const worker = async () => {
    while (lockRunning && Date.now() < endTime) {
      const t = `lock-token-${Math.floor(Math.random()*10)}`;
      try {
        await prisma.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT * FROM "LockTest" WHERE token = ${t} FOR UPDATE`;
          await new Promise(r => setTimeout(r, 100 + Math.random()*200));
          await tx.lockTest.update({ where: { token: t }, data: { counter: { increment: 1 } } });
        });
      } catch { lockWaits++; }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  lockRunning = false;
}
export function stopLockContention() { lockRunning = false; }
