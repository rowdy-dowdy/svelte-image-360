/*
  Warnings:

  - You are about to drop the column `rotation` on the `InfoHotspots` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `InfoHotspots` table. All the data in the column will be lost.
  - You are about to drop the column `rotation` on the `LinkHotspots` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `LinkHotspots` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InfoHotspots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yaw" REAL NOT NULL,
    "pitch" REAL NOT NULL,
    "direction" TEXT,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "type" TEXT,
    "sceneId" TEXT NOT NULL,
    CONSTRAINT "InfoHotspots_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InfoHotspots" ("description", "direction", "id", "image", "pitch", "sceneId", "title", "type", "yaw") SELECT "description", "direction", "id", "image", "pitch", "sceneId", "title", "type", "yaw" FROM "InfoHotspots";
DROP TABLE "InfoHotspots";
ALTER TABLE "new_InfoHotspots" RENAME TO "InfoHotspots";
CREATE TABLE "new_LinkHotspots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yaw" REAL NOT NULL,
    "pitch" REAL NOT NULL,
    "direction" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    CONSTRAINT "LinkHotspots_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LinkHotspots" ("direction", "id", "pitch", "sceneId", "yaw") SELECT "direction", "id", "pitch", "sceneId", "yaw" FROM "LinkHotspots";
DROP TABLE "LinkHotspots";
ALTER TABLE "new_LinkHotspots" RENAME TO "LinkHotspots";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
