import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pokédex API',
      version: '1.0.0',
      description: 'A comprehensive Pokédex API with caching, rate limiting, and search capabilities',
      contact: {
        name: 'API Support',
        email: 'support@pokedex.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Docker server'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              description: 'Health status'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of health check'
            },
            database: {
              type: 'string',
              enum: ['connected', 'disconnected'],
              description: 'Database connection status'
            }
          }
        },
        Type: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Type ID'
            },
            name: {
              type: 'string',
              description: 'Type name'
            }
          }
        },
        PokemonType: {
          type: 'object',
          properties: {
            pokemonId: {
              type: 'integer'
            },
            typeId: {
              type: 'integer'
            },
            slot: {
              type: 'integer',
              description: 'Slot position (1 or 2)'
            },
            type: {
              $ref: '#/components/schemas/Type'
            }
          }
        },
        Species: {
          type: 'object',
          properties: {
            generation: {
              type: 'integer',
              nullable: true
            },
            isLegendary: {
              type: 'boolean'
            },
            isMythical: {
              type: 'boolean'
            }
          }
        },
        PokemonSummary: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Pokemon ID'
            },
            name: {
              type: 'string',
              description: 'Pokemon name'
            },
            height: {
              type: 'integer',
              description: 'Height in decimeters'
            },
            weight: {
              type: 'integer',
              description: 'Weight in hectograms'
            },
            baseExperience: {
              type: 'integer',
              nullable: true
            },
            spriteFrontDefault: {
              type: 'string',
              nullable: true,
              description: 'URL to front sprite'
            },
            types: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PokemonType'
              }
            },
            species: {
              $ref: '#/components/schemas/Species'
            }
          }
        },
        Stat: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            }
          }
        },
        PokemonStat: {
          type: 'object',
          properties: {
            baseStat: {
              type: 'integer'
            },
            effort: {
              type: 'integer'
            },
            stat: {
              $ref: '#/components/schemas/Stat'
            }
          }
        },
        Ability: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            }
          }
        },
        PokemonAbility: {
          type: 'object',
          properties: {
            slot: {
              type: 'integer'
            },
            isHidden: {
              type: 'boolean'
            },
            ability: {
              $ref: '#/components/schemas/Ability'
            }
          }
        },
        PokemonDetail: {
          allOf: [
            { $ref: '#/components/schemas/PokemonSummary' },
            {
              type: 'object',
              properties: {
                stats: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/PokemonStat'
                  }
                },
                abilities: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/PokemonAbility'
                  }
                }
              }
            }
          ]
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number'
            },
            limit: {
              type: 'integer',
              description: 'Items per page'
            },
            total: {
              type: 'integer',
              description: 'Total number of items'
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages'
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page'
            }
          }
        },
        PokemonListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PokemonSummary'
              }
            },
            meta: {
              $ref: '#/components/schemas/PaginationMeta'
            }
          }
        },
        SearchResponse: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            results: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PokemonSummary'
              }
            },
            count: {
              type: 'integer',
              description: 'Number of results'
            },
            fuzzy: {
              type: 'boolean',
              description: 'Whether fuzzy search was used'
            }
          }
        },
        SuggestionItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            },
            spriteFrontDefault: {
              type: 'string',
              nullable: true
            }
          }
        },
        SuggestionsResponse: {
          type: 'object',
          properties: {
            query: {
              type: 'string'
            },
            suggestions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SuggestionItem'
              }
            },
            count: {
              type: 'integer'
            }
          }
        },
        CompareResponse: {
          type: 'object',
          properties: {
            pokemon: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PokemonDetail'
              }
            },
            comparison: {
              type: 'object',
              properties: {
                requested: {
                  type: 'array',
                  items: {
                    type: 'integer'
                  }
                },
                found: {
                  type: 'array',
                  items: {
                    type: 'integer'
                  }
                },
                missing: {
                  type: 'array',
                  items: {
                    type: 'integer'
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        RateLimitExceeded: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          },
          headers: {
            'RateLimit-Limit': {
              description: 'The number of allowed requests in the current period',
              schema: {
                type: 'integer'
              }
            },
            'RateLimit-Remaining': {
              description: 'The number of remaining requests in the current period',
              schema: {
                type: 'integer'
              }
            },
            'RateLimit-Reset': {
              description: 'The time at which the current period resets',
              schema: {
                type: 'integer'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/index.ts', './src/docs/*.ts']
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);