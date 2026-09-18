CREATE TABLE "world_factions" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_factions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "world_locations" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_locations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "world_factions_worldId_name_key" ON "world_factions"("worldId", "name");
CREATE INDEX "world_factions_worldId_idx" ON "world_factions"("worldId");

CREATE UNIQUE INDEX "world_locations_worldId_name_key" ON "world_locations"("worldId", "name");
CREATE INDEX "world_locations_worldId_idx" ON "world_locations"("worldId");

ALTER TABLE "world_factions" ADD CONSTRAINT "world_factions_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "world_locations" ADD CONSTRAINT "world_locations_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "worlds"("id") ON DELETE CASCADE ON UPDATE CASCADE;