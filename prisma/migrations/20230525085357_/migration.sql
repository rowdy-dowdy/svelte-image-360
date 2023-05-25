/*
  Warnings:

  - You are about to drop the column `auido` on the `Scene` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levels" TEXT NOT NULL,
    "faceSize" INTEGER NOT NULL,
    "initialViewParameters" TEXT NOT NULL,
    "audio" TEXT,
    "description" TEXT
);
INSERT INTO "new_Scene" ("description", "faceSize", "id", "initialViewParameters", "levels", "name", "url") SELECT "description", "faceSize", "id", "initialViewParameters", "levels", "name", "url" FROM "Scene";
DROP TABLE "Scene";
ALTER TABLE "new_Scene" RENAME TO "Scene";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
