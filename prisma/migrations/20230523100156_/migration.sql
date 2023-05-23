/*
  Warnings:

  - Made the column `direction` on table `LinkHotspots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `target` on table `LinkHotspots` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InfoHotspots" ADD COLUMN "type" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LinkHotspots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yaw" REAL NOT NULL,
    "pitch" REAL NOT NULL,
    "rotation" REAL,
    "target" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    CONSTRAINT "LinkHotspots_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LinkHotspots" ("direction", "id", "pitch", "rotation", "sceneId", "target", "yaw") SELECT "direction", "id", "pitch", "rotation", "sceneId", "target", "yaw" FROM "LinkHotspots";
DROP TABLE "LinkHotspots";
ALTER TABLE "new_LinkHotspots" RENAME TO "LinkHotspots";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
