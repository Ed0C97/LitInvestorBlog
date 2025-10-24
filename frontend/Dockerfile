# Multi-stage build per frontend React
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Installa pnpm e dipendenze
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copia il resto dei file e builda
COPY . .
RUN pnpm run build

# Stage 2: Nginx per servire i file statici
FROM nginx:alpine

# Copia i file buildati
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configurazione Nginx personalizzata (opzionale)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
