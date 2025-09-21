FROM node:22-alpine AS base

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

RUN apk add --no-cache curl

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "run", "start"]