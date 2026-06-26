# ==========================================
# STAGE 1: BUILDER (Ambiente de Compilação)
# ==========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Otimização de Cache: Copia APENAS os package.json (Ignoramos o lockfile do Host)
COPY package.json ./
COPY apps/crawler-engine/package.json ./apps/crawler-engine/
COPY apps/web-dashboard/package.json ./apps/web-dashboard/
COPY packages/contracts/package.json ./packages/contracts/

# Força o NPM a gerar uma árvore limpa e baixar os binários nativos do Linux (GNU)
RUN npm install

# Copia o restante do código fonte
COPY . .

# Desativa a telemetria do Next.js para acelerar o build e economizar banda
ENV NEXT_TELEMETRY_DISABLED=1

# 1º: Compila os contratos (o NextJS precisa das tipagens e interfaces para compilar)
RUN npm run build --workspace=@football/contracts

# 2º: Compila o frontend NextJS
RUN npm run build --workspace=apps/web-dashboard

# ==========================================
# STAGE 2: RUNNER (Ambiente de Produção Leve)
# ==========================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Força o ambiente de produção e desativa a telemetria em runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

# Copia os manifestos da raiz
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Copia a árvore de dependências (o NextJS precisa do node_modules raiz em monorepos padrão)
COPY --from=builder /app/node_modules ./node_modules

# Copia os arquivos fundamentais do NextJS (O build e a pasta public)
COPY --from=builder /app/apps/web-dashboard/package.json ./apps/web-dashboard/
COPY --from=builder /app/apps/web-dashboard/.next ./apps/web-dashboard/.next
COPY --from=builder /app/apps/web-dashboard/public ./apps/web-dashboard/public

# Copia os contratos transpilados (para garantir as referências de importação no runtime)
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist

# AppSec: Cria usuário restrito e garante permissão na pasta .next (que gera cache em tempo real)
RUN chown -R node:node /app/apps/web-dashboard/.next
USER node

EXPOSE 3001

# Inicia o servidor padrão do NextJS mapeado no workspace correto
CMD ["npm", "run", "start", "--workspace=apps/web-dashboard"]