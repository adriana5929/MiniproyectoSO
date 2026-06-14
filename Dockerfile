FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

RUN pnpm add dotenv @prisma/client-runtime-utils

COPY . .

RUN pnpm prisma generate

EXPOSE 3000

ENV NEXT_DISABLE_TURBOPACK=1

CMD ["pnpm", "dev"]
