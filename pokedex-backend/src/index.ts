import { Prisma, PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'
import Fuse from 'fuse.js'
import swaggerUi from 'swagger-ui-express'
import {
  generalLimiter,
  searchLimiter,
  suggestionsLimiter,
  seedLimiter,
  closeRedisConnection
} from './middleware/rateLimiter'
import { swaggerSpec } from './config/swagger'

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

// Apply general rate limiting to all routes
app.use(generalLimiter)

// Swagger UI setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Pokédex API Documentation'
}))

// API spec endpoint
app.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     description: Welcome message and basic API information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
app.get('/', (_req, res) => {
  res.send('Welcome to the Pokédex API with Auto-suggestions! Visit /api-docs for API documentation or /api/pokemon to get started.')
})

/**
 * @swagger
 * /api/test-suggest:
 *   get:
 *     summary: Test endpoint for suggestions feature
 *     description: Test route to verify server is running updated code
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Test response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/api/test-suggest', (_req, res) => {
  res.json({ message: 'suggest route is working!' })
})

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the API and database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthCheck'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 */
app.get('/health', async (_req, res) => {
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

app.get('/health/ready', async (_req, res) => {
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

app.get('/api/pokemon/search', searchLimiter, async (req, res) => {
  try {
    const { q, limit = '10', fuzzy = 'false' } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)))
    const useFuzzy = fuzzy === 'true'

    if (useFuzzy) {
      // Fetch all Pokemon for fuzzy search
      const allPokemon = await prisma.pokemon.findMany({
        select: {
          id: true,
          name: true,
          types: {
            include: { type: true },
            orderBy: { slot: 'asc' }
          },
          abilities: {
            include: { ability: true }
          },
          species: {
            select: {
              generation: true,
              isLegendary: true,
              isMythical: true
            }
          },
          spriteFrontDefault: true
        }
      })

      // Prepare data for fuzzy search
      const searchData = allPokemon.map(p => ({
        ...p,
        typeNames: p.types.map(t => t.type.name).join(' '),
        abilityNames: p.abilities.map(a => a.ability.name).join(' ')
      }))

      // Configure Fuse for fuzzy search
      const fuse = new Fuse(searchData, {
        keys: ['name', 'typeNames', 'abilityNames'],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2
      })

      const results = fuse.search(q, { limit: limitNum })
      const pokemon = results.map(r => {
        const { typeNames, abilityNames, ...pokemonData } = r.item
        return pokemonData
      })

      return res.json({
        query: q,
        results: pokemon,
        count: pokemon.length,
        fuzzy: true
      })
    }

    // Regular exact search
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
      count: pokemon.length,
      fuzzy: false
    })
  } catch (error) {
    res.status(500).json({ error: 'Search failed' })
  }
})

// Auto-suggestions endpoint
app.get('/api/pokemon/suggest', suggestionsLimiter, async (req, res) => {
  try {
    const { q, limit = '5' } = req.query

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' })
    }

    const limitNum = Math.min(10, Math.max(1, parseInt(limit as string)))

    // Get Pokemon names for suggestions
    const pokemonNames = await prisma.pokemon.findMany({
      where: {
        name: {
          startsWith: q.toLowerCase(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        spriteFrontDefault: true
      },
      take: limitNum,
      orderBy: { id: 'asc' }
    })

    // If no exact prefix matches, use fuzzy search
    if (pokemonNames.length < limitNum) {
      const allPokemon = await prisma.pokemon.findMany({
        select: {
          id: true,
          name: true,
          spriteFrontDefault: true
        }
      })

      const fuse = new Fuse(allPokemon, {
        keys: ['name'],
        threshold: 0.2,
        includeScore: true,
        minMatchCharLength: 2
      })

      const fuzzyResults = fuse.search(q, { limit: limitNum })
      const fuzzyPokemon = fuzzyResults
        .filter(r => !pokemonNames.find(p => p.id === r.item.id))
        .map(r => r.item)
        .slice(0, limitNum - pokemonNames.length)

      pokemonNames.push(...fuzzyPokemon)
    }

    res.json({
      query: q,
      suggestions: pokemonNames,
      count: pokemonNames.length
    })
  } catch (error) {
    console.error('Suggest error:', error)
    res.status(500).json({ error: 'Suggestion failed' })
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


app.get('/api/types', async (_req, res) => {
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

app.post('/api/seed', seedLimiter, async (req, res) => {
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

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () =>
  console.log(`🚀 Server ready at: http://localhost:${PORT}`),
)

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await closeRedisConnection()
  await prisma.$disconnect()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  await closeRedisConnection()
  await prisma.$disconnect()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
