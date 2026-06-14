import { prisma } from "./prisma";

export async function databaseStress() {
  const start = Date.now();

  await prisma.requestLog.create({
    data: {
      executionTime: 0,
      cpuIterationCount: 0,
      randomValue: Math.random()
    }
  });

  await prisma.requestLog.count();

  await prisma.requestLog.findMany({
    take: 100,
    orderBy: {
      timestamp: "desc"
    }
  });

  await prisma.requestLog.findMany({
    where: {
      randomValue: {
        gt: Math.random()
      }
    }
  });

  return Date.now() - start;
}
