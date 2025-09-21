import { PrismaClient } from '@prisma/client';
import { seedBasicTypes, fetchPokemonList } from '../src/services/pokeapi';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed basic types first
    console.log('🏷️  Seeding Pokemon types...');
    await seedBasicTypes();
    console.log('✅ Types seeded');

    // Fetch Pokemon list directly from PokeAPI service
    console.log('🔍 Fetching Pokemon from PokeAPI...');
    const pokemonList = await fetchPokemonList(151, 0); // First 151 Pokemon
    console.log(`✅ Fetched ${pokemonList.length} Pokemon from PokeAPI`);

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