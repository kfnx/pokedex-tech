FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

COPY package.json bun.lock* ./

RUN npm install -g bun && bun install

COPY . .

RUN touch .env

RUN npx expo export --platform web

RUN npm install -g serve

EXPOSE 8081

ENV NODE_ENV=production

CMD ["serve", "-s", "dist", "-l", "8081"]