-- CreateTable
CREATE TABLE "public"."pokemon" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "baseExperience" INTEGER,
    "order" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "spriteUrl" TEXT,
    "spriteFrontDefault" TEXT,
    "spriteBackDefault" TEXT,
    "spriteFrontShiny" TEXT,
    "spriteBackShiny" TEXT,
    "cries" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speciesId" INTEGER,

    CONSTRAINT "pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pokemon_species" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER,
    "genderRate" INTEGER,
    "captureRate" INTEGER,
    "baseHappiness" INTEGER,
    "isBaby" BOOLEAN NOT NULL DEFAULT false,
    "isLegendary" BOOLEAN NOT NULL DEFAULT false,
    "isMythical" BOOLEAN NOT NULL DEFAULT false,
    "hatchCounter" INTEGER,
    "hasGenderDifferences" BOOLEAN NOT NULL DEFAULT false,
    "formsSwitchable" BOOLEAN NOT NULL DEFAULT false,
    "growthRate" TEXT,
    "pokedexNumbers" JSONB,
    "eggGroups" JSONB,
    "color" TEXT,
    "shape" TEXT,
    "habitat" TEXT,
    "generation" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evolutionChainId" INTEGER,

    CONSTRAINT "pokemon_species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."types" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "damageRelations" JSONB,
    "gameIndices" JSONB,
    "generation" INTEGER,
    "moveDamageClass" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."abilities" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isMainSeries" BOOLEAN NOT NULL DEFAULT true,
    "generation" INTEGER,
    "effectEntries" JSONB,
    "flavorTextEntries" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moves" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "accuracy" INTEGER,
    "effectChance" INTEGER,
    "pp" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "power" INTEGER,
    "damageClass" TEXT,
    "effectEntries" JSONB,
    "flavorTextEntries" JSONB,
    "generation" INTEGER,
    "meta" JSONB,
    "target" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stats" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "gameIndex" INTEGER,
    "isBattleOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evolution_chains" (
    "id" INTEGER NOT NULL,
    "babyTriggerItem" TEXT,
    "chain" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evolution_chains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pokemon_types" (
    "pokemonId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_types_pkey" PRIMARY KEY ("pokemonId","typeId")
);

-- CreateTable
CREATE TABLE "public"."pokemon_abilities" (
    "pokemonId" INTEGER NOT NULL,
    "abilityId" INTEGER NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_abilities_pkey" PRIMARY KEY ("pokemonId","abilityId")
);

-- CreateTable
CREATE TABLE "public"."pokemon_stats" (
    "pokemonId" INTEGER NOT NULL,
    "statId" INTEGER NOT NULL,
    "baseStat" INTEGER NOT NULL,
    "effort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pokemon_stats_pkey" PRIMARY KEY ("pokemonId","statId")
);

-- CreateTable
CREATE TABLE "public"."pokemon_moves" (
    "pokemonId" INTEGER NOT NULL,
    "moveId" INTEGER NOT NULL,
    "versionGroupDetails" JSONB,

    CONSTRAINT "pokemon_moves_pkey" PRIMARY KEY ("pokemonId","moveId")
);

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_name_key" ON "public"."pokemon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_species_name_key" ON "public"."pokemon_species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "types_name_key" ON "public"."types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "abilities_name_key" ON "public"."abilities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "moves_name_key" ON "public"."moves"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stats_name_key" ON "public"."stats"("name");

-- AddForeignKey
ALTER TABLE "public"."pokemon" ADD CONSTRAINT "pokemon_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "public"."pokemon_species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_species" ADD CONSTRAINT "pokemon_species_evolutionChainId_fkey" FOREIGN KEY ("evolutionChainId") REFERENCES "public"."evolution_chains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moves" ADD CONSTRAINT "moves_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_types" ADD CONSTRAINT "pokemon_types_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "public"."pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_types" ADD CONSTRAINT "pokemon_types_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_abilities" ADD CONSTRAINT "pokemon_abilities_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "public"."pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_abilities" ADD CONSTRAINT "pokemon_abilities_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "public"."abilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_stats" ADD CONSTRAINT "pokemon_stats_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "public"."pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_stats" ADD CONSTRAINT "pokemon_stats_statId_fkey" FOREIGN KEY ("statId") REFERENCES "public"."stats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_moves" ADD CONSTRAINT "pokemon_moves_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "public"."pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pokemon_moves" ADD CONSTRAINT "pokemon_moves_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "public"."moves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
