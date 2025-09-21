import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

const CACHE_DURATION = {
  POKEMON_DETAILS: 24 * 60 * 60 * 1000, // 24 hours for detailed data
  POKEMON_LIST: 60 * 60 * 1000,         // 1 hour for list data
  TYPES: 7 * 24 * 60 * 60 * 1000,       // 7 days for types
  STATS: 7 * 24 * 60 * 60 * 1000        // 7 days for stats
}

export interface PokeAPIResponse {
  results: Array<{
    name: string
    url: string
  }>
  count: number
  next: string | null
  previous: string | null
}


export async function fetchFromPokeAPI<T = any>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status}`)
  }
  return response.json() as T
}

export async function seedBasicTypes() {
  const typesData = await fetchFromPokeAPI<PokeAPIResponse>(`${POKEAPI_BASE_URL}/type`)

  for (const typeRef of typesData.results) {
    const typeId = parseInt(typeRef.url.split('/').slice(-2, -1)[0])
    const typeData = await fetchFromPokeAPI<any>(typeRef.url)

    await prisma.type.upsert({
      where: { id: typeId },
      update: {
        name: typeData.name,
        generation: typeData.generation?.name ?
          parseInt(typeData.generation.name.replace('generation-', '')) : null,
        lastFetched: new Date()
      },
      create: {
        id: typeId,
        name: typeData.name,
        generation: typeData.generation?.name ?
          parseInt(typeData.generation.name.replace('generation-', '')) : null
      }
    })
  }

  console.log(`Seeded ${typesData.results.length} types`)
}

export async function seedBasicStats() {
  const statsData = await fetchFromPokeAPI<PokeAPIResponse>(`${POKEAPI_BASE_URL}/stat`)

  for (const statRef of statsData.results) {
    const statId = parseInt(statRef.url.split('/').slice(-2, -1)[0])
    const statData = await fetchFromPokeAPI<any>(statRef.url)

    await prisma.stat.upsert({
      where: { id: statId },
      update: {
        name: statData.name,
        gameIndex: statData.game_index,
        isBattleOnly: statData.is_battle_only,
        lastFetched: new Date()
      },
      create: {
        id: statId,
        name: statData.name,
        gameIndex: statData.game_index,
        isBattleOnly: statData.is_battle_only
      }
    })
  }

  console.log(`Seeded ${statsData.results.length} stats`)
}

function isCacheFresh(lastFetched: Date | null, cacheDuration: number): boolean {
  if (!lastFetched) return false
  return new Date().getTime() - lastFetched.getTime() < cacheDuration
}

export async function fetchAndStorePokemon(pokemonId: number, forceRefresh: boolean = false): Promise<unknown> {
  try {
    const existingPokemon = await prisma.pokemon.findUnique({
      where: { id: pokemonId },
      include: {
        types: { include: { type: true } },
        abilities: { include: { ability: true } },
        stats: { include: { stat: true } }
      }
    })

    if (!forceRefresh && existingPokemon && isCacheFresh(existingPokemon.lastFetched, CACHE_DURATION.POKEMON_DETAILS)) {
      return existingPokemon
    }

    const pokemonData = await fetchFromPokeAPI<any>(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`)

    const pokemon = await prisma.pokemon.upsert({
      where: { id: pokemonData.id },
      update: {
        name: pokemonData.name,
        height: pokemonData.height,
        weight: pokemonData.weight,
        baseExperience: pokemonData.base_experience,
        order: pokemonData.order,
        spriteFrontDefault: pokemonData.sprites?.front_default,
        spriteBackDefault: pokemonData.sprites?.back_default,
        spriteFrontShiny: pokemonData.sprites?.front_shiny,
        spriteBackShiny: pokemonData.sprites?.back_shiny,
        cries: pokemonData.cries ? JSON.parse(JSON.stringify(pokemonData.cries)) : null,
        lastFetched: new Date()
      },
      create: {
        id: pokemonData.id,
        name: pokemonData.name,
        height: pokemonData.height,
        weight: pokemonData.weight,
        baseExperience: pokemonData.base_experience,
        order: pokemonData.order,
        spriteFrontDefault: pokemonData.sprites?.front_default,
        spriteBackDefault: pokemonData.sprites?.back_default,
        spriteFrontShiny: pokemonData.sprites?.front_shiny,
        spriteBackShiny: pokemonData.sprites?.back_shiny,
        cries: pokemonData.cries ? JSON.parse(JSON.stringify(pokemonData.cries)) : null
      }
    })

    await prisma.pokemonType.deleteMany({
      where: { pokemonId: pokemon.id }
    })

    for (const typeData of pokemonData.types) {
      const typeId = parseInt(typeData.type.url.split('/').slice(-2, -1)[0])

      await prisma.type.upsert({
        where: { id: typeId },
        update: { lastFetched: new Date() },
        create: {
          id: typeId,
          name: typeData.type.name
        }
      })

      await prisma.pokemonType.create({
        data: {
          pokemonId: pokemon.id,
          typeId: typeId,
          slot: typeData.slot
        }
      })
    }

    await prisma.pokemonAbility.deleteMany({
      where: { pokemonId: pokemon.id }
    })

    for (const abilityData of pokemonData.abilities) {
      const abilityId = parseInt(abilityData.ability.url.split('/').slice(-2, -1)[0])

      await prisma.ability.upsert({
        where: { id: abilityId },
        update: { lastFetched: new Date() },
        create: {
          id: abilityId,
          name: abilityData.ability.name
        }
      })

      await prisma.pokemonAbility.create({
        data: {
          pokemonId: pokemon.id,
          abilityId: abilityId,
          isHidden: abilityData.is_hidden,
          slot: abilityData.slot
        }
      })
    }

    await prisma.pokemonStat.deleteMany({
      where: { pokemonId: pokemon.id }
    })

    for (const statData of pokemonData.stats) {
      const statId = parseInt(statData.stat.url.split('/').slice(-2, -1)[0])

      await prisma.stat.upsert({
        where: { id: statId },
        update: { lastFetched: new Date() },
        create: {
          id: statId,
          name: statData.stat.name
        }
      })

      await prisma.pokemonStat.create({
        data: {
          pokemonId: pokemon.id,
          statId: statId,
          baseStat: statData.base_stat,
          effort: statData.effort
        }
      })
    }

    return await prisma.pokemon.findUnique({
      where: { id: pokemon.id },
      include: {
        types: { include: { type: true } },
        abilities: { include: { ability: true } },
        stats: { include: { stat: true } }
      }
    })

  } catch (error) {
    console.error(`Failed to fetch Pokemon ${pokemonId}:`, error)
    throw error
  }
}

export async function fetchPokemonList(limit: number = 151, offset: number = 0): Promise<unknown[]> {
  try {
    const pokemonInDb = await prisma.pokemon.findMany({
      where: {
        id: {
          gte: offset + 1,
          lte: offset + limit
        }
      },
      include: {
        types: {
          include: { type: true },
          orderBy: { slot: 'asc' }
        },
        species: {
          select: {
            generation: true,
            isLegendary: true,
            isMythical: true
          }
        }
      },
      orderBy: { id: 'asc' }
    })

    const missingIds = []
    const staleIds = []
    const existingMap = new Map()

    for (const pokemon of pokemonInDb) {
      existingMap.set(pokemon.id, pokemon)
      if (!isCacheFresh(pokemon.lastFetched, CACHE_DURATION.POKEMON_LIST)) {
        staleIds.push(pokemon.id)
      }
    }

    for (let id = offset + 1; id <= offset + limit; id++) {
      if (!existingMap.has(id)) {
        missingIds.push(id)
      }
    }

    const idsToFetch = [...missingIds, ...staleIds]

    if (idsToFetch.length > 0) {
      console.log(`Fetching ${idsToFetch.length} Pokemon (${missingIds.length} missing, ${staleIds.length} stale)`)

      const fetchPromises = idsToFetch.map(id =>
        fetchAndStorePokemon(id, true).catch(err => {
          console.error(`Failed to fetch Pokemon ${id}:`, err)
          return null
        })
      )

      await Promise.all(fetchPromises)

      return await prisma.pokemon.findMany({
        where: {
          id: {
            gte: offset + 1,
            lte: offset + limit
          }
        },
        include: {
          types: {
            include: { type: true },
            orderBy: { slot: 'asc' }
          },
          species: {
            select: {
              generation: true,
              isLegendary: true,
              isMythical: true
            }
          }
        },
        orderBy: { id: 'asc' }
      })
    }

    return pokemonInDb
  } catch (error) {
    console.error('Failed to fetch Pokemon list:', error)
    throw error
  }
}

export async function seedInitialPokemon(count: number = 151) {
  console.log(`Starting to seed ${count} Pokemon...`)

  await seedBasicTypes()
  await seedBasicStats()

  for (let i = 1; i <= count; i++) {
    try {
      await fetchAndStorePokemon(i)
      console.log(`Seeded Pokemon ${i}`)

      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`Failed to seed Pokemon ${i}:`, error)
    }
  }

  console.log(`Finished seeding ${count} Pokemon`)
}