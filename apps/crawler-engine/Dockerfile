# apps/crawler-engine/Dockerfile
FROM node:20-alpine

# Instala dependências do SO necessárias para o Prisma e Puppeteer/Playwright futuramente
RUN apk add --no-cache openssl

WORKDIR /app

# Copia todo o monorepo para garantir a resolução dos workspaces e contratos
COPY . .

# Instala todas as dependências na raiz
RUN npm install

# Gera o client do Prisma (necessário antes do build)
RUN npx prisma generate --schema=apps/crawler-engine/prisma/schema.prisma

# Compila o NestJS
RUN npm run build --workspace=apps/crawler-engine

# Expõe a porta que definiremos para o NestJS
EXPOSE 3000

# Inicia em modo de produção
CMD ["npm", "run", "start:prod", "--workspace=apps/crawler-engine"]