/*
  Warnings:

  - You are about to drop the column `cpuIterationCount` on the `RequestLog` table. All the data in the column will be lost.
  - You are about to drop the column `executionTime` on the `RequestLog` table. All the data in the column will be lost.
  - You are about to drop the column `randomValue` on the `RequestLog` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `RequestLog` table. All the data in the column will be lost.
  - Added the required column `endpoint` to the `RequestLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestLog" DROP COLUMN "cpuIterationCount",
DROP COLUMN "executionTime",
DROP COLUMN "randomValue",
DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endpoint" TEXT NOT NULL;
