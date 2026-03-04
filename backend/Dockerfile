# Multi-stage Dockerfile para Backend
# Optimizado para producción con imagen Alpine

# Etapa 1: Builder - Instalar dependencias
FROM node:18-alpine AS builder

# Instalar PNPM
RUN npm install -g pnpm@8

# Crear directorio de aplicación
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias (solo producción)
RUN pnpm install --frozen-lockfile --prod

# Etapa 2: Imagen de producción
FROM node:18-alpine AS production

# Metadata
LABEL maintainer="EcoResource Connect Team"
LABEL description="Backend API for EcoResource Connect"
LABEL version="1.0.0"

# Instalar PNPM
RUN npm install -g pnpm@8

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Crear directorio de aplicación
WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "src/server.js"]
