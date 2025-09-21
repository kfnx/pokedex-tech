import { defineConfig, PrismaConfig } from 'prisma/config'

export default defineConfig({
  seed: 'bun run prisma/seed.ts'
} as PrismaConfig)