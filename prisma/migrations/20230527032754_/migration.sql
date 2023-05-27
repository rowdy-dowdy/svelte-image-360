-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LinkHotspots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yaw" REAL NOT NULL,
    "pitch" REAL NOT NULL,
    "direction" TEXT,
    "target" TEXT NOT NULL,
    "type" TEXT,
    "sceneId" TEXT NOT NULL,
    CONSTRAINT "LinkHotspots_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LinkHotspots" ("direction", "id", "pitch", "sceneId", "target", "type", "yaw") SELECT "direction", "id", "pitch", "sceneId", "target", "type", "yaw" FROM "LinkHotspots";
DROP TABLE "LinkHotspots";
ALTER TABLE "new_LinkHotspots" RENAME TO "LinkHotspots";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
