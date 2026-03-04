# 📦 Guía de Instalación - EcoResource Connect

Esta guía detalla el proceso completo de instalación y configuración del proyecto EcoResource Connect.

---

## 📋 Tabla de Contenidos

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación Local](#instalación-local)
3. [Configuración con Docker](#configuración-con-docker)
4. [Variables de Entorno](#variables-de-entorno)
5. [Base de Datos](#base-de-datos)
6. [Troubleshooting](#troubleshooting)

---

## ⚙️ Requisitos del Sistema

### Requisitos Mínimos

- **Sistema Operativo**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **RAM**: 8 GB
- **Espacio en disco**: 2 GB disponibles
- **Procesador**: Intel Core i5 / AMD Ryzen 5 o superior

### Software Requerido

#### Opción 1: Instalación Local

- **Node.js** v18.x o superior
  - Descargar: https://nodejs.org/
  - Verificar: `node --version`

- **PNPM** v8.x
  ```bash
  npm install -g pnpm
  pnpm --version
  ```

- **MongoDB** 6.0+
  - Local: https://www.mongodb.com/try/download/community
  - Cloud: https://www.mongodb.com/cloud/atlas (recomendado)

- **Git**
  ```bash
  git --version
  ```

#### Opción 2: Con Docker

- **Docker Desktop** 24.0+
  - Windows/Mac: https://www.docker.com/products/docker-desktop
  - Linux: `sudo apt install docker.io docker-compose`
  - Verificar: `docker --version`

---

## 🚀 Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/YOUR_ORG/ecoresource-connect.git
cd ecoresource-connect
```

### 2. Instalar MongoDB (si no usas Atlas)

#### Windows
```powershell
# Descargar desde https://www.mongodb.com/try/download/community
# Instalar como servicio
# Iniciar servicio
net start MongoDB
```

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

#### Linux (Ubuntu)
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias con PNPM
pnpm install

# Si encuentras errores, limpia caché
pnpm store prune
pnpm install --force
```

### 4. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tu editor preferido
# Windows
notepad .env

# macOS/Linux
nano .env
```

**Configuración mínima requerida**:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecoresource_connect
JWT_SECRET=cambiar-por-secreto-seguro-minimo-32-caracteres
JWT_EXPIRE=15m
CORS_ORIGIN=http://localhost:3000
```

**Generar JWT_SECRET seguro**:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# OpenSSL
openssl rand -hex 32
```

### 5. Iniciar Backend

```bash
# Modo desarrollo (con hot-reload)
pnpm run dev

# Modo producción
pnpm start
```

**Salida esperada**:
```
✅ MongoDB conectado exitosamente: localhost
🚀 Servidor corriendo en modo development en puerto 5000
📡 API disponible en http://localhost:5000/api/v1
```

**Verificar funcionamiento**:
```bash
curl http://localhost:5000/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2026-03-03T10:30:00.000Z",
  "environment": "development"
}
```

### 6. Configurar Frontend

En una **nueva terminal**:

```bash
cd ../frontend

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev
```

**Salida esperada**:
```
VITE v5.0.7  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Abrir navegador en: http://localhost:3000

---

## 🐳 Configuración con Docker

### 1. Verificar Docker

```bash
docker --version
docker-compose --version
```

### 2. Variables de Entorno

```bash
# En el directorio raíz del proyecto
cp backend/.env.example backend/.env

# Editar las credenciales de MongoDB en docker-compose.yml
# Las variables ya están preconfiguradas
```

### 3. Iniciar todos los servicios

```bash
# Construir e iniciar
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### 4. Verificar contenedores

```bash
docker-compose ps
```

**Salida esperada**:
```
NAME                      STATUS    PORTS
ecoresource-mongodb       Up        0.0.0.0:27017->27017/tcp
ecoresource-backend       Up        0.0.0.0:5000->5000/tcp
ecoresource-frontend      Up        0.0.0.0:3000->3000/tcp
```

### 5. Servicios adicionales (desarrollo)

```bash
# Iniciar con SonarQube
docker-compose --profile dev up -d

# Iniciar escaneo de seguridad con OWASP ZAP
docker-compose --profile security up zap
```

### 6. Detener servicios

```bash
# Detener todos los contenedores
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra la BD)
docker-compose down -v
```

---

## 🔧 Variables de Entorno

### Backend (.env)

| Variable | Descripción | Valor por defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `NODE_ENV` | Entorno de ejecución | `development` | ❌ |
| `PORT` | Puerto del servidor | `5000` | ❌ |
| `MONGODB_URI` | URL de conexión MongoDB | - | ✅ |
| `JWT_SECRET` | Clave secreta para JWT | - | ✅ |
| `JWT_EXPIRE` | Tiempo de expiración access token | `15m` | ❌ |
| `JWT_REFRESH_EXPIRE` | Tiempo expiración refresh token | `7d` | ❌ |
| `BCRYPT_ROUNDS` | Rounds de hash bcrypt | `12` | ❌ |
| `MAX_LOGIN_ATTEMPTS` | Intentos de login antes de bloqueo | `5` | ❌ |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Peticiones máximas por ventana | `100` | ❌ |

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=EcoResource Connect
```

---

## 💾 Base de Datos

### MongoDB Atlas (Cloud - Recomendado)

1. **Crear cuenta gratuita**: https://www.mongodb.com/cloud/atlas/register

2. **Crear cluster**:
   - Seleccionar "Free Tier" (M0)
   - Región: más cercana a tu ubicación
   - Nombre: `ecoresource-cluster`

3. **Configurar acceso**:
   - Database Access → Add New User
     - Username: `ecoresource_admin`
     - Password: generar automática
   - Network Access → Add IP Address
     - Allow access from anywhere: `0.0.0.0/0` (solo desarrollo)

4. **Obtener Connection String**:
   - Cluster → Connect → Connect your application
   - Copiar URI:
     ```
     mongodb+srv://ecoresource_admin:<password>@ecoresource-cluster.xxxxx.mongodb.net/ecoresource_connect?retryWrites=true&w=majority
     ```
   - Reemplazar `<password>` con tu contraseña
   - Actualizar en `.env`:
     ```env
     MONGODB_URI=mongodb+srv://ecoresource_admin:TU_PASSWORD@ecoresource-cluster.xxxxx.mongodb.net/ecoresource_connect?retryWrites=true&w=majority
     ```

### MongoDB Local

#### Verificar conexión

```bash
# Windows
mongosh

# macOS/Linux
mongosh
```

**Comandos útiles**:
```javascript
// Mostrar bases de datos
show dbs

// Seleccionar base de datos
use ecoresource_connect

// Mostrar colecciones
show collections

// Ver usuarios
db.users.find().pretty()
```

#### Crear índices manualmente (si es necesario)

```javascript
use ecoresource_connect

// Índice geoespacial para donaciones
db.donations.createIndex({ "pickupLocation.coordinates": "2dsphere" })

// Índice para usuarios
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
```

---

## 🧪 Ejecutar Tests

```bash
cd backend

# Instalar dependencias de desarrollo
pnpm install

# Ejecutar todos los tests
pnpm test

# Con cobertura
pnpm test -- --coverage

# Modo watch (útil durante desarrollo)
pnpm test:watch

# Tests específicos
pnpm test -- auth.test.js
```

**Resultado esperado**:
```
PASS  tests/auth.test.js (12.345 s)
PASS  tests/models.test.js (8.234 s)

Test Suites: 2 passed, 2 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        21.234 s
Coverage:    85.23%
```

---

## 🔍 Troubleshooting

### Error: "Cannot connect to MongoDB"

**Síntoma**:
```
❌ Error fatal conectando a MongoDB: MongooseServerSelectionError
```

**Soluciones**:

1. **Verificar que MongoDB esté corriendo**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mongod
   ```

2. **Verificar URI de conexión** en `.env`:
   - Local: `mongodb://localhost:27017/ecoresource_connect`
   - Atlas: incluir contraseña correcta

3. **Firewall/Antivirus**:
   - Permitir conexiones en puerto 27017
   - Desactivar temporalmente para probar

### Error: "EADDRINUSE: Port 5000 already in use"

**Síntoma**:
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Soluciones**:

1. **Cambiar puerto** en `.env`:
   ```env
   PORT=5001
   ```

2. **Matar proceso en el puerto**:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### Error: "pnpm: command not found"

**Solución**:
```bash
npm install -g pnpm

# Verificar instalación
pnpm --version
```

Si persiste:
```bash
# Usar NPM temporalmente
npm install
npm run dev
```

### Tests fallan con "Timeout"

**Síntoma**:
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solución**:

1. Aumentar timeout en `jest.config.js`:
   ```javascript
   export default {
     testTimeout: 30000  // 30 segundos
   }
   ```

2. Verificar memoria:
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 pnpm test
   ```

### Frontend no conecta con Backend

**Verificar**:

1. Backend corriendo en `http://localhost:5000`
2. Frontend configurado correctamente en `vite.config.js`:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true
       }
     }
   }
   ```

3. CORS configurado en backend (ya está en `server.js`)

### Docker: "Error response from daemon"

**Windows**: Verificar que Docker Desktop esté corriendo

**Linux**: Verificar permisos
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📚 Recursos Adicionales

- [Documentación MongoDB](https://docs.mongodb.com/)
- [Guía Express.js](https://expressjs.com/es/)
- [React Docs](https://react.dev/)
- [PNPM Docs](https://pnpm.io/)
- [Docker Docs](https://docs.docker.com/)

---

## ✅ Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] PNPM instalado globalmente
- [ ] MongoDB corriendo (local o Atlas)
- [ ] Repositorio clonado
- [ ] Backend:
  - [ ] Dependencias instaladas
  - [ ] `.env` configurado
  - [ ] Servidor corriendo en puerto 5000
  - [ ] Health check responde correctamente
- [ ] Frontend:
  - [ ] Dependencias instaladas
  - [ ] Servidor corriendo en puerto 3000
  - [ ] Página carga correctamente
- [ ] Tests pasan correctamente

**¡Instalación completada! 🎉**

Para reportar problemas: [crear issue](https://github.com/YOUR_ORG/ecoresource-connect/issues)
