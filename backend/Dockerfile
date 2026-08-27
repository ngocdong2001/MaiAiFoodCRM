FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
ARG DATABASE_URL_MASTER=mysql://placeholder:placeholder@localhost:3306/maiai_master
ARG DATABASE_URL_TENANT=mysql://placeholder:placeholder@localhost:3306/maiai_crm_1
ENV DATABASE_URL_MASTER=$DATABASE_URL_MASTER
ENV DATABASE_URL_TENANT=$DATABASE_URL_TENANT
ENV DATABASE_URL=$DATABASE_URL_MASTER
COPY . .
RUN npx prisma generate --schema ./prisma/schema.master.prisma --config ./prisma.config.ts
RUN npx prisma generate --schema ./prisma/schema.tenant.prisma --config ./prisma.config.tenant.ts
RUN npm run build

FROM base AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./dist/generated
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/prisma.config.tenant.ts ./
COPY --from=build /app/seed.ts ./
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy --schema ./prisma/schema.master.prisma --config ./prisma.config.ts || echo 'Master migration skipped (tables may already exist)'; npx prisma migrate deploy --schema ./prisma/schema.tenant.prisma --config ./prisma.config.tenant.ts || echo 'Tenant migration skipped (tables may already exist)'; npx tsx seed.ts || echo 'Master seed skipped'; npx tsx prisma/seed.ts || echo 'Tenant seed skipped'; node dist/server.js"]
