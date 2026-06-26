# ==========================================
# STAGE 1: BUILDER (Ambiente de Compilação)
# ==========================================
FROM node:20-bookworm-slim AS builder

# O openssl é obrigatório para o engine do Prisma compilar os binários nativos
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Otimização de Cache Nível 1: Copia apenas os manifestos primeiro
COPY package.json package-lock.json ./
COPY apps/crawler-engine/package.json ./apps/crawler-engine/
COPY apps/web-dashboard/package.json ./apps/web-dashboard/
COPY packages/contracts/package.json ./packages/contracts/

# Instala todas as dependências (as devDependencies são necessárias para o build)
RUN npm install

# Otimização de Cache Nível 2: Copia o restante do código fonte
COPY . .

# Gera o Prisma Client com os binários linkados corretamente para o Debian
RUN npx prisma generate --schema=apps/crawler-engine/prisma/schema.prisma

# Compila os contratos (Fundamental para gerar o dist/ que o NestJS vai importar)
RUN npm run build --workspace=@football/contracts

# Compila o servidor NestJS
RUN npm run build --workspace=apps/crawler-engine

# ==========================================
# STAGE 2: RUNNER (Ambiente de Produção Leve)
# ==========================================
FROM node:20-bookworm-slim AS runner

# Instala o openssl para o runtime do Prisma e limpa o cache do apt para economizar megabytes
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Força o ecossistema Node a rodar com performance otimizada
ENV NODE_ENV=production

# Copia os manifestos da raiz
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Copia a árvore de dependências instalada e os binários gerados pelo Prisma
COPY --from=builder /app/node_modules ./node_modules

# Copia apenas o backend compilado e o schema do banco
COPY --from=builder /app/apps/crawler-engine/package.json ./apps/crawler-engine/
COPY --from=builder /app/apps/crawler-engine/dist ./apps/crawler-engine/dist
COPY --from=builder /app/apps/crawler-engine/prisma ./apps/crawler-engine/prisma

# Copia apenas os contratos compilados (O Node enxerga isso via symlink no monorepo)
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist

# Cria a pasta de storage e ajusta permissões para não rodarmos como root (AppSec)
RUN mkdir -p /app/storage && chown -R node:node /app/storage

# Isola a execução: O contêiner vai rodar com o usuário 'node' padrão e sem privilégios administrativos
USER node

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/crawler-engine/prisma/schema.prisma && npm run start:prod --workspace=apps/crawler-engine"]