import { Prisma, PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'

const prisma = new PrismaClient()

const app = express()

app.use(cors({
  origin: [
    "http://localhost:8081", // (Expo web)
    "http://localhost:19006", // (Expo DevTools)
    "http://localhost:19000", // (Expo Metro bundler
  ],
  credentials: true
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Welcome to the Pokedex API. Visit /api/pokemon to get started.')
})

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    })
  }
})

app.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    const typeCount = await prisma.type.count()

    if (typeCount === 0) {
      return res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
        ready: false,
        message: 'Database not seeded'
      })
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
      ready: true,
      types: typeCount
    })
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      ready: false,
      error: 'Database connection failed'
    })
  }
})

app.get('/api/pokemon/list', async (req, res) => {
  try {
    const { limit = '151', offset = '0' } = req.query
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit as string)))
    const offsetNum = Math.max(0, parseInt(offset as string))

    const { fetchPokemonList } = await import('./services/pokeapi')
    const pokemon = await fetchPokemonList(limitNum, offsetNum)

    res.json({
      data: pokemon,
      meta: {
        limit: limitNum,
        offset: offsetNum,
        count: pokemon.length
      }
    })
  } catch (error) {
    console.error('Failed to fetch Pokemon list:', error)
    res.status(500).json({ error: 'Failed to fetch Pokemon list' })
  }
})

app.get('/api/pokemon', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      type,
      generation,
      sort = 'id'
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)))
    const skip = (pageNum - 1) * limitNum

    const where: Prisma.PokemonWhereInput = {}

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' }
    }

    if (type) {
      where.types = {
        some: {
          type: {
            name: { equals: type as string, mode: 'insensitive' }
          }
        }
      }
    }

    if (generation) {
      where.species = {
        generation: parseInt(generation as string)
      }
    }

    const orderBy: Prisma.PokemonOrderByWithRelationInput = {}
    switch (sort) {
      case 'name':
        orderBy.name = 'asc'
        break
      case 'height':
        orderBy.height = 'desc'
        break
      case 'weight':
        orderBy.weight = 'desc'
        break
      default:
        orderBy.id = 'asc'
    }

    const [pokemon, total] = await Promise.all([
      prisma.pokemon.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
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
        }
      }),
      prisma.pokemon.count({ where })
    ])

    const totalPages = Math.ceil(total / limitNum)

    res.json({
      data: pokemon,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Pokemon' })
  }
})

app.get('/api/pokemon/search', async (req, res) => {
  try {
    const { q, limit = '10' } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)))

    const pokemon = await prisma.pokemon.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          {
            types: {
              some: {
                type: {
                  name: { contains: q, mode: 'insensitive' }
                }
              }
            }
          },
          {
            abilities: {
              some: {
                ability: {
                  name: { contains: q, mode: 'insensitive' }
                }
              }
            }
          }
        ]
      },
      take: limitNum,
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

    res.json({
      query: q,
      results: pokemon,
      count: pokemon.length
    })
  } catch (error) {
    res.status(500).json({ error: 'Search failed' })
  }
})

const MAX_COMPARE = 3
app.get('/api/pokemon/compare', async (req, res) => {
  console.log("called compare endpoint");
  try {
    const { ids } = req.query
    console.log("compare ids", ids);
    if (!ids || typeof ids !== 'string') {
      return res.status(400).json({ error: 'Pokemon IDs are required' })
    }

    const pokemonIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

    if (pokemonIds.length === 0 || pokemonIds.length > MAX_COMPARE) {
      return res.status(400).json({ error: `Provide 1-${MAX_COMPARE} valid Pokemon IDs` })
    }

    const pokemon = await prisma.pokemon.findMany({
      where: {
        id: { in: pokemonIds }
      },
      include: {
        types: {
          include: { type: true },
          orderBy: { slot: 'asc' }
        },
        abilities: {
          include: { ability: true },
          orderBy: { slot: 'asc' }
        },
        stats: {
          include: { stat: true }
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

    if (pokemon.length === 0) {
      return res.status(404).json({ error: 'No Pokemon found with provided IDs' })
    }

    const missingIds = pokemonIds.filter(id => !pokemon.find(p => p.id === id))

    res.json({
      pokemon,
      comparison: {
        requested: pokemonIds,
        found: pokemon.map(p => p.id),
        missing: missingIds
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Comparison failed' })
  }
})

app.get('/api/pokemon/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { refresh } = req.query
    const pokemonId = parseInt(id)

    if (isNaN(pokemonId)) {
      return res.status(400).json({ error: 'Invalid Pokemon ID' })
    }

    const forceRefresh = refresh === 'true'

    const { fetchAndStorePokemon } = await import('./services/pokeapi')
    const pokemon = await fetchAndStorePokemon(pokemonId, forceRefresh)

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokemon not found' })
    }

    res.json(pokemon)
  } catch (error) {
    console.error('Failed to fetch Pokemon details:', error)
    res.status(500).json({ error: 'Failed to fetch Pokemon details' })
  }
})


app.get('/api/types', async (req, res) => {
  try {
    const types = await prisma.type.findMany({
      orderBy: { id: 'asc' }
    })

    res.json(types)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch types' })
  }
})

app.get('/api/abilities', async (req, res) => {
  try {
    const { limit = '50' } = req.query
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)))

    const abilities = await prisma.ability.findMany({
      take: limitNum,
      orderBy: { id: 'asc' }
    })

    res.json(abilities)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch abilities' })
  }
})

app.get('/api/pokemon/:id/fetch', async (req, res) => {
  try {
    const { id } = req.params
    const pokemonId = parseInt(id)

    if (isNaN(pokemonId)) {
      return res.status(400).json({ error: 'Invalid Pokemon ID' })
    }

    const { fetchAndStorePokemon } = await import('./services/pokeapi')
    const pokemon = await fetchAndStorePokemon(pokemonId)

    res.json({
      message: `Pokemon ${pokemonId} fetched and stored`,
      pokemon
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Pokemon from PokeAPI' })
  }
})

app.post('/api/seed', async (req, res) => {
  try {
    const { count = 151 } = req.body

    if (count > 1000) {
      return res.status(400).json({ error: 'Cannot seed more than 1000 Pokemon at once' })
    }

    const { seedInitialPokemon } = await import('./services/pokeapi')

    res.json({ message: `Starting to seed ${count} Pokemon. Check server logs for progress.` })

    seedInitialPokemon(count).catch(console.error)
  } catch (error) {
    res.status(500).json({ error: 'Failed to start seeding process' })
  }
})

const server = app.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`),
)
