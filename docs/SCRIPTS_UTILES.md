# 🚀 Scripts de Inicio Rápido - EcoResource Connect

Este archivo contiene scripts útiles para desarrollo, testing y despliegue.

---

## 📋 Comandos Rápidos

### Instalación Inicial

```bash
# Windows PowerShell
cd backend; pnpm install; cd ../frontend; pnpm install; cd ..

# Linux/macOS
cd backend && pnpm install && cd ../frontend && pnpm install && cd ..
```

### Desarrollo Local

```bash
# Opción 1: Dos terminales separadas
# Terminal 1 - Backend
cd backend
pnpm run dev

# Terminal 2 - Frontend
cd frontend
pnpm run dev
```

```bash
# Opción 2: Script combinado (requiere concurrently)
pnpm install -g concurrently
concurrently "cd backend && pnpm run dev" "cd frontend && pnpm run dev"
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Todos los tests
pnpm test

# Con cobertura detallada
pnpm test -- --coverage --verbose

# Solo tests de autenticación
pnpm test -- auth.test.js

# Modo watch (útil durante desarrollo)
pnpm test:watch

# Ver reporte de cobertura en navegador
# Windows
start coverage/lcov-report/index.html

# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

---

## 🐳 Docker

### Comandos Básicos

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra la BD)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ver estado de contenedores
docker-compose ps
```

### Servicios con Perfiles

```bash
# Iniciar con SonarQube (análisis de código)
docker-compose --profile dev up -d

# Solo iniciar servicio de seguridad (OWASP ZAP)
docker-compose --profile security up zap

# Ver reporte ZAP
# Windows
start security-reports/zap_report.html
```

### Debugging Docker

```bash
# Entrar a un contenedor
docker exec -it ecoresource-backend sh

# Ver logs de MongoDB
docker-compose logs mongodb

# Limpiar todo Docker
docker system prune -a
docker volume prune
```

---

## 💾 MongoDB

### Comandos Útiles

```bash
# Conectar a MongoDB local
mongosh

# Conectar a MongoDB en Docker
docker exec -it ecoresource-mongodb mongosh

# Conectar a MongoDB Atlas
mongosh "mongodb+srv://cluster.xxxxx.mongodb.net/ecoresource_connect" --apiVersion 1 --username ecoresource_admin
```

### Scripts MongoDB

```javascript
// Dentro de mongosh

// Usar base de datos
use ecoresource_connect

// Ver colecciones
show collections

// Ver usuarios
db.users.find().pretty()

// Contar documentos
db.users.countDocuments()
db.donations.countDocuments()

// Buscar usuario por email
db.users.findOne({ email: "test@example.com" })

// Ver índices
db.users.getIndexes()
db.donations.getIndexes()

// Estadísticas de la colección
db.users.stats()

// Buscar donaciones cercanas (ejemplo)
db.donations.find({
  "pickupLocation.coordinates": {
    $nearSphere: {
      $geometry: {
        type: "Point",
        coordinates: [-99.1332, 19.4326]
      },
      $maxDistance: 10000
    }
  }
})

// Eliminar todos los documentos de prueba
db.users.deleteMany({ email: { $regex: "test" } })
db.donations.deleteMany({})

// Backup de colección
mongoexport --db=ecoresource_connect --collection=users --out=users_backup.json

// Restaurar colección
mongoimport --db=ecoresource_connect --collection=users --file=users_backup.json

// Crear índices manualmente
db.donations.createIndex({ "pickupLocation.coordinates": "2dsphere" })
db.users.createIndex({ email: 1 }, { unique: true })
```

---

## 🔧 Herramientas de Desarrollo

### Linting

```bash
cd backend

# Ejecutar ESLint
pnpm run lint

# Auto-fix de errores
pnpm run lint -- --fix
```

### Formateo de Código

```bash
# Instalar Prettier (si no está)
pnpm add -D prettier

# Formatear todo el código
npx prettier --write "src/**/*.js"
```

### Análisis de Código

```bash
# SonarQube local
docker-compose --profile dev up sonarqube -d

# Abrir SonarQube
# Windows
start http://localhost:9000

# Ejecutar análisis
pnpm run sonar
```

---

## 🔒 Seguridad

### OWASP ZAP

```bash
# Escaneo rápido
docker-compose --profile security up zap

# Ver reporte
start security-reports/zap_report.html
```

### Auditoría de Dependencias

```bash
cd backend

# Auditoría PNPM
pnpm audit

# Auditoría con reporte detallado
pnpm audit --json > audit-report.json

# Auto-fix de vulnerabilidades
pnpm audit --fix
```

### Generar JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# OpenSSL (Git Bash en Windows, Terminal en Mac/Linux)
openssl rand -hex 32
```

---

## 📊 Monitoreo

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Con headers bonitos
curl -i http://localhost:5000/health

# Formato JSON legible
curl http://localhost:5000/health | json_pp
```

### Logs

```bash
# Backend logs (desarrollo)
cd backend
pnpm run dev

# Ver logs de Docker
docker-compose logs -f backend

# Filtrar logs por palabra
docker-compose logs backend | grep "ERROR"

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

---

## 🚀 Despliegue

### Build de producción

```bash
# Backend (verifica antes de desplegar)
cd backend
NODE_ENV=production pnpm start

# Frontend
cd frontend
pnpm run build

# Previsualizar build
pnpm run preview
```

### Docker Build Manual

```bash
# Backend
cd backend
docker build -t ecoresource-backend:latest .

# Frontend
cd frontend
docker build -t ecoresource-frontend:latest .

# Ejecutar imagen
docker run -p 5000:5000 ecoresource-backend:latest
```

---

## 🛠️ Mantenimiento

### Limpiar Archivos

```bash
# Backend
cd backend
rm -rf node_modules coverage

# Reinstalar desde cero
pnpm install

# Limpiar caché PNPM
pnpm store prune
```

### Actualizar Dependencias

```bash
cd backend

# Ver dependencias desactualizadas
pnpm outdated

# Actualizar todas las dependencias
pnpm update

# Actualizar dependencia específica
pnpm update express

# Actualizar a últimas versiones (cuidado)
pnpm update --latest
```

---

## 📝 Git Workflow

### Commits Semánticos

```bash
# Feature nueva
git commit -m "feat: agregar endpoint de donaciones"

# Fix de bug
git commit -m "fix: corregir validación de email"

# Documentación
git commit -m "docs: actualizar README con instrucciones Docker"

# Tests
git commit -m "test: agregar pruebas para módulo de donaciones"

# Refactorización
git commit -m "refactor: simplificar lógica de autenticación"

# Chore (mantenimiento)
git commit -m "chore: actualizar dependencias"
```

### Branches

```bash
# Crear rama de feature
git checkout -b feature/donations-module

# Crear rama de fix
git checkout -b fix/login-validation

# Merge a main
git checkout main
git merge feature/donations-module

# Borrar rama local
git branch -d feature/donations-module

# Borrar rama remota
git push origin --delete feature/donations-module
```

---

## 🔍 Debugging

### Backend Debug

```bash
# Node.js inspector
node --inspect src/server.js

# VSCode launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/server.js",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```

### Ver Variables de Entorno

```bash
# Backend
cd backend && node -e "require('dotenv').config(); console.log(process.env)"

# Docker
docker exec ecoresource-backend env
```

---

## 📦 Scripts Útiles

### Setup Completo (Primera Vez)

```bash
#!/bin/bash
# setup.sh

echo "🚀 Configurando EcoResource Connect..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Por favor instalar desde https://nodejs.org/"
    exit 1
fi

# Verificar PNPM
if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando PNPM..."
    npm install -g pnpm
fi

# Instalar dependencias
echo "📚 Instalando dependencias del backend..."
cd backend && pnpm install

echo "📚 Instalando dependencias del frontend..."
cd ../frontend && pnpm install

# Copiar .env
if [ ! -f backend/.env ]; then
    echo "⚙️  Creando archivo .env..."
    cp backend/.env.example backend/.env
    echo "⚠️  Por favor editar backend/.env con tus credenciales"
fi

echo "✅ Setup completado!"
echo "📖 Ver docs/INSTALACION.md para los siguientes pasos"
```

### Script de Desarrollo

```bash
#!/bin/bash
# dev.sh

# Verificar MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo "🗄️  Iniciando MongoDB..."
    # macOS
    brew services start mongodb-community@6.0
    # Linux
    # sudo systemctl start mongod
fi

# Iniciar backend y frontend
echo "🚀 Iniciando servidores de desarrollo..."
concurrently \
    "cd backend && pnpm run dev" \
    "cd frontend && pnpm run dev"
```

---

## 🎯 Tips y Trucos

### Acelerar Tests

```bash
# Ejecutar solo tests modificados
pnpm test -- --onlyChanged

# Ejecutar tests en paralelo
pnpm test -- --maxWorkers=4
```

### Ver tamaño del Bundle

```bash
cd frontend
pnpm run build
du -sh dist/*
```

### Verificar Ports en Uso

```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :5000
lsof -i :3000
```

---

## 📚 Referencias Rápidas

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:5000/health
- **MongoDB**: mongodb://localhost:27017
- **SonarQube**: http://localhost:9000 (admin/admin)

---

**¿Problemas?** Ver [docs/INSTALACION.md](INSTALACION.md#troubleshooting) para troubleshooting
