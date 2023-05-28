/*
  Warnings:

  - Made the column `slug` on table `Scene` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levels" TEXT NOT NULL,
    "faceSize" INTEGER NOT NULL,
    "initialViewParameters" TEXT NOT NULL,
    "audio" TEXT,
    "description" TEXT,
    "sort" INTEGER
);
INSERT INTO "new_Scene" ("audio", "description", "faceSize", "id", "initialViewParameters", "levels", "name", "slug", "sort", "url") SELECT "audio", "description", "faceSize", "id", "initialViewParameters", "levels", "name", "slug", "sort", "url" FROM "Scene";
DROP TABLE "Scene";
ALTER TABLE "new_Scene" RENAME TO "Scene";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
