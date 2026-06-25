# apps/web-dashboard/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

# Compila o NextJS
RUN npm run build --workspace=apps/web-dashboard

# Expõe a porta do Frontend
EXPOSE 3001

# Inicia o servidor NextJS passando a porta customizada
ENV PORT=3001
CMD ["npm", "run", "start", "--workspace=apps/web-dashboard"]