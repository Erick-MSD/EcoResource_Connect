# Multi-stage Dockerfile para Frontend React

# Etapa 1: Builder
FROM node:18-alpine AS builder

# Instalar PNPM
RUN npm install -g pnpm@8

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build de producción
RUN pnpm run build

# Etapa 2: Nginx para servir archivos estáticos
FROM nginx:alpine AS production

# Copiar archivos build desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
