/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: API health and status endpoints
 *   - name: General
 *     description: General API endpoints
 *   - name: Pokemon
 *     description: Pokemon data endpoints
 *   - name: Search
 *     description: Search and suggestions endpoints
 *   - name: Compare
 *     description: Pokemon comparison endpoints
 *   - name: Types
 *     description: Pokemon type endpoints
 *   - name: Abilities
 *     description: Pokemon ability endpoints
 *   - name: Seed
 *     description: Data seeding endpoints
 */

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Check if the API is ready to serve requests (database seeded)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthCheck'
 *                 - type: object
 *                   properties:
 *                     ready:
 *                       type: boolean
 *                     types:
 *                       type: integer
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthCheck'
 *                 - type: object
 *                   properties:
 *                     ready:
 *                       type: boolean
 *                     message:
 *                       type: string
 */

/**
 * @swagger
 * /api/pokemon/list:
 *   get:
 *     summary: Get Pokemon list from PokeAPI
 *     description: Fetch Pokemon list directly from PokeAPI (bypasses local database)
 *     tags: [Pokemon]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 151
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of Pokemon to fetch
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of Pokemon to skip
 *     responses:
 *       200:
 *         description: Pokemon list with metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     count:
 *                       type: integer
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/pokemon:
 *   get:
 *     summary: Get paginated Pokemon list
 *     description: Retrieve a paginated list of Pokemon with filtering and sorting options
 *     tags: [Pokemon]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of Pokemon per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search Pokemon by name (case insensitive)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by Pokemon type
 *       - in: query
 *         name: generation
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 9
 *         description: Filter by generation number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [id, name, height, weight]
 *           default: id
 *         description: Sort Pokemon by field
 *     responses:
 *       200:
 *         description: Paginated Pokemon list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PokemonListResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/pokemon/search:
 *   get:
 *     summary: Search Pokemon
 *     description: Search Pokemon by name, type, or ability with optional fuzzy matching
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Maximum number of results
 *       - in: query
 *         name: fuzzy
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Enable fuzzy search
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *         headers:
 *           RateLimit-Limit:
 *             description: Search rate limit
 *             schema:
 *               type: integer
 *           RateLimit-Remaining:
 *             description: Remaining requests
 *             schema:
 *               type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/pokemon/suggest:
 *   get:
 *     summary: Get Pokemon suggestions
 *     description: Get Pokemon name suggestions with fuzzy matching for autocomplete
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 10
 *         description: Maximum number of suggestions
 *     responses:
 *       200:
 *         description: Pokemon suggestions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuggestionsResponse'
 *         headers:
 *           RateLimit-Limit:
 *             description: Suggestions rate limit
 *             schema:
 *               type: integer
 *           RateLimit-Remaining:
 *             description: Remaining requests
 *             schema:
 *               type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/pokemon/compare:
 *   get:
 *     summary: Compare Pokemon
 *     description: Compare up to 6 Pokemon side by side with detailed information
 *     tags: [Compare]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated Pokemon IDs (1-6 Pokemon)
 *         example: "1,25,150"
 *     responses:
 *       200:
 *         description: Pokemon comparison data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompareResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/pokemon/{id}:
 *   get:
 *     summary: Get Pokemon by ID
 *     description: Retrieve detailed information for a specific Pokemon
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Pokemon ID
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force refresh from PokeAPI
 *     responses:
 *       200:
 *         description: Pokemon details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PokemonDetail'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/types:
 *   get:
 *     summary: Get all Pokemon types
 *     description: Retrieve list of all Pokemon types
 *     tags: [Types]
 *     responses:
 *       200:
 *         description: List of Pokemon types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Type'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/abilities:
 *   get:
 *     summary: Get Pokemon abilities
 *     description: Retrieve list of Pokemon abilities
 *     tags: [Abilities]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of abilities to return
 *     responses:
 *       200:
 *         description: List of Pokemon abilities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ability'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/pokemon/{id}/fetch:
 *   get:
 *     summary: Fetch Pokemon from PokeAPI
 *     description: Fetch and store Pokemon data from PokeAPI
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Pokemon ID to fetch
 *     responses:
 *       200:
 *         description: Pokemon fetched and stored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pokemon:
 *                   $ref: '#/components/schemas/PokemonDetail'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/seed:
 *   post:
 *     summary: Seed Pokemon data
 *     description: Seed the database with Pokemon data from PokeAPI
 *     tags: [Seed]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 default: 151
 *                 minimum: 1
 *                 maximum: 1000
 *                 description: Number of Pokemon to seed
 *     responses:
 *       200:
 *         description: Seeding started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         headers:
 *           RateLimit-Limit:
 *             description: Seed rate limit (very restrictive)
 *             schema:
 *               type: integer
 *           RateLimit-Remaining:
 *             description: Remaining requests
 *             schema:
 *               type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */