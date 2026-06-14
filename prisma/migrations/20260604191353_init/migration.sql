/*
  Warnings:

  - You are about to drop the column `createdAt` on the `RequestLog` table. All the data in the column will be lost.
  - You are about to drop the column `endpoint` on the `RequestLog` table. All the data in the column will be lost.
  - Added the required column `cpuIterationCount` to the `RequestLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executionTime` to the `RequestLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `randomValue` to the `RequestLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestLog" DROP COLUMN "createdAt",
DROP COLUMN "endpoint",
ADD COLUMN     "cpuIterationCount" INTEGER NOT NULL,
ADD COLUMN     "executionTime" INTEGER NOT NULL,
ADD COLUMN     "randomValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
