-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levels" TEXT NOT NULL,
    "faceSize" INTEGER NOT NULL,
    "initialViewParameters" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InfoHotspots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yaw" REAL NOT NULL,
    "pitch" REAL NOT NULL,
    "rotation" REAL,
    "target" TEXT,
    "direction" TEXT,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "sceneId" TEXT NOT NULL,
    CONSTRAINT "InfoHotspots_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LinkHotspots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yaw" REAL NOT NULL,
    "pitch" REAL NOT NULL,
    "rotation" REAL,
    "target" TEXT,
    "direction" TEXT,
    "sceneId" TEXT NOT NULL,
    CONSTRAINT "LinkHotspots_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
