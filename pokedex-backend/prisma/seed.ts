import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

interface TypeData {
  id: number;
  name: string;
}

interface PokemonTypeData {
  pokemonId: number;
  typeId: number;
  slot: number;
  type: TypeData;
}

interface PokemonData {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience?: number;
  order?: number;
  isDefault: boolean;
  spriteUrl?: string;
  spriteFrontDefault?: string;
  spriteBackDefault?: string;
  spriteFrontShiny?: string;
  spriteBackShiny?: string;
  cries?: any;
  types: PokemonTypeData[];
  species?: any;
}

interface PokemonListResponse {
  data: PokemonData[];
  meta: {
    limit: number;
    offset: number;
    count: number;
  };
}

async function fetchAllPokemon() {
  console.log('🔍 Fetching all Pokemon from API...');
  const allPokemon: PokemonData[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore && allPokemon.length < 151) { // Limit to first 151 Pokemon (Gen 1) for initial seed
    try {
      const response = await axios.get<PokemonListResponse>(
        `${API_BASE_URL}/api/pokemon/list`,
        {
          params: {
            limit,
            offset,
          },
        }
      );

      allPokemon.push(...response.data.data);

      console.log(
        `📦 Fetched batch: offset=${offset}, got ${response.data.data.length} Pokemon (total: ${allPokemon.length})`
      );

      hasMore = response.data.data.length === limit;
      offset += limit;
    } catch (error) {
      console.error('❌ Error fetching Pokemon list:', error);
      throw error;
    }
  }

  return allPokemon;
}

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.pokemonType.deleteMany();
    await prisma.type.deleteMany();
    await prisma.pokemon.deleteMany();

    // Fetch all Pokemon from API
    const pokemonList = await fetchAllPokemon();
    console.log(`✅ Fetched ${pokemonList.length} Pokemon from API`);

    // Collect all unique types from the fetched data
    const uniqueTypes = new Map<number, string>();
    pokemonList.forEach((pokemon) => {
      pokemon.types.forEach((typeData) => {
        uniqueTypes.set(typeData.type.id, typeData.type.name);
      });
    });

    console.log(`🏷️  Creating ${uniqueTypes.size} unique types...`);

    // Create or update all types
    for (const [typeId, typeName] of uniqueTypes) {
      await prisma.type.upsert({
        where: { id: typeId },
        update: { name: typeName },
        create: {
          id: typeId,
          name: typeName,
        },
      });
    }

    console.log('✅ Types created');

    // Create Pokemon records with their type relationships
    console.log('🎮 Creating Pokemon records...');
    let createdCount = 0;

    for (const pokemon of pokemonList) {
      // First check if Pokemon exists
      const existingPokemon = await prisma.pokemon.findUnique({
        where: { id: pokemon.id },
        include: { types: true }
      });

      if (existingPokemon) {
        // Delete existing type relationships
        await prisma.pokemonType.deleteMany({
          where: { pokemonId: pokemon.id }
        });

        // Update Pokemon and recreate type relationships
        await prisma.pokemon.update({
          where: { id: pokemon.id },
          data: {
            name: pokemon.name,
            height: pokemon.height,
            weight: pokemon.weight,
            baseExperience: pokemon.baseExperience,
            order: pokemon.order,
            isDefault: pokemon.isDefault,
            spriteUrl: pokemon.spriteUrl,
            spriteFrontDefault: pokemon.spriteFrontDefault,
            spriteBackDefault: pokemon.spriteBackDefault,
            spriteFrontShiny: pokemon.spriteFrontShiny,
            spriteBackShiny: pokemon.spriteBackShiny,
            cries: pokemon.cries,
            types: {
              create: pokemon.types.map((typeData) => ({
                typeId: typeData.type.id,
                slot: typeData.slot,
              })),
            },
          },
        });
      } else {
        // Create new Pokemon with type relationships
        await prisma.pokemon.create({
          data: {
            id: pokemon.id,
            name: pokemon.name,
            height: pokemon.height,
            weight: pokemon.weight,
            baseExperience: pokemon.baseExperience,
            order: pokemon.order,
            isDefault: pokemon.isDefault,
            spriteUrl: pokemon.spriteUrl,
            spriteFrontDefault: pokemon.spriteFrontDefault,
            spriteBackDefault: pokemon.spriteBackDefault,
            spriteFrontShiny: pokemon.spriteFrontShiny,
            spriteBackShiny: pokemon.spriteBackShiny,
            cries: pokemon.cries,
            types: {
              create: pokemon.types.map((typeData) => ({
                typeId: typeData.type.id,
                slot: typeData.slot,
              })),
            },
          },
        });
      }

      createdCount++;
      if (createdCount % 25 === 0) {
        console.log(`  📊 Progress: ${createdCount}/${pokemonList.length} Pokemon processed`);
      }
    }

    console.log(`✅ Successfully seeded ${createdCount} Pokemon`);

    // Verify the seed
    const totalPokemon = await prisma.pokemon.count();
    const totalTypes = await prisma.type.count();
    const totalRelations = await prisma.pokemonType.count();

    console.log('\n📈 Seed Summary:');
    console.log(`  • Pokemon: ${totalPokemon}`);
    console.log(`  • Types: ${totalTypes}`);
    console.log(`  • Type Relations: ${totalRelations}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedDatabase()
  .then(() => {
    console.log('✨ Database seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error during seed:', error);
    process.exit(1);
  });