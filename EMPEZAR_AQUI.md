# 🚀 GUÍA RÁPIDA - Empezar Ahora

**¡Hola!** Esta guía te muestra exactamente qué hacer AHORA para poner el proyecto funcionando.

---

## 🎯 Lo que Tienes Ahora

✅ **Código completo del proyecto**:
- Backend con Express.js + MongoDB
- 27 tests unitarios (85% cobertura)
- Autenticación JWT funcional
- Docker configurado
- CI/CD listo para Google Cloud

---

## ⚡ Pasos Inmediatos (30 minutos)

### 🔥 PASO 1: MongoDB Atlas (15 min)

**¿Por qué?** Tu app necesita una base de datos. Atlas es gratis y está en la nube.

1. **Ir a**: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. **Crear cuenta** (puedes usar Google Sign-In)
3. **Build a Database** → Seleccionar **"M0 FREE"**
4. **Configurar**:
   - Provider: **Google Cloud**
   - Region: **us-central1 (Iowa)**
   - Cluster Name: `ecoresource-cluster`
5. **Create User**:
   - Username: `ecoresource_admin`
   - Password: Genera uno fuerte (guárdalo bien)
   - Privileges: "Read and write to any database"
6. **Network Access**:
   - Add IP Address → `0.0.0.0/0` (temporal para desarrollo)
7. **Connect** → "Connect your application":
   - Copiar el connection string (se ve así):
   ```
   mongodb+srv://ecoresource_admin:<password>@ecoresource-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. **Reemplazar** `<password>` con tu password real

**Documentación completa**: [docs/SETUP_MONGODB_ATLAS.md](docs/SETUP_MONGODB_ATLAS.md)

---

### 🔥 PASO 2: Configurar Backend (10 min)

```powershell
# 1. Abrir PowerShell en tu proyecto
cd d:\Documents\GitHub\EcoResource_Connect\backend

# 2. Instalar PNPM (si no lo tienes)
npm install -g pnpm

# 3. Instalar dependencias
pnpm install

# 4. Generar secrets automáticamente
node scripts/generateSecrets.js
# Esto crea el archivo .env con JWT secrets seguros

# 5. Editar .env con tu MongoDB URI
notepad .env
# Reemplaza la línea MONGODB_URI= con tu connection string de Atlas
# MONGODB_URI=mongodb+srv://ecoresource_admin:TU_PASSWORD@cluster.xxxxx.mongodb.net/ecoresource_db

# 6. Guardar y cerrar
```

**Tu archivo `.env` debe verse así**:
```env
MONGODB_URI=mongodb+srv://ecoresource_admin:TuPassword123@ecoresource-cluster.abc123.mongodb.net/ecoresource_db?retryWrites=true&w=majority

JWT_SECRET=e4f8a9b2c1d3e5f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
JWT_REFRESH_SECRET=f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### 🔥 PASO 3: Probar que Funciona (5 min)

```powershell
# En backend/
# 1. Ejecutar tests
pnpm test

# ✅ RESULTADO ESPERADO: 27 tests pasando
# Test Suites: 2 passed, 2 total
# Tests:       27 passed, 27 total

# 2. Iniciar servidor
pnpm run dev

# ✅ RESULTADO ESPERADO:
# ✅ MongoDB connected: ecoresource-cluster.xxxxx.mongodb.net
# 🚀 Server running on port 5000
```

**Abrir en navegador**: http://localhost:5000/health

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-03-04T...",
  "environment": "development"
}
```

**🎉 SI VES ESO, ¡TODO FUNCIONA!**

---

## 🧪 Probar tu API

Con el servidor corriendo, abre **otra terminal PowerShell**:

```powershell
# Registrar un usuario nuevo
$body = @{
  email = "test@example.com"
  password = "Test1234!"
  role = "donor"
  profile = @{
    name = "Test User"
    phone = "+525512345678"
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**✅ Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "user": {
      "email": "test@example.com",
      "role": "donor",
      ...
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

## ✅ Checklist de Éxito

Marca cada uno cuando funcione:

- [ ] Cuenta en MongoDB Atlas creada
- [ ] Cluster M0 Free configurado (Google Cloud, us-central1)
- [ ] Usuario de base de datos creado
- [ ] Connection string copiado y funcional
- [ ] PNPM instalado (`pnpm --version` muestra >= 8.0.0)
- [ ] Dependencias instaladas (`pnpm install` exitoso)
- [ ] Archivo `.env` creado con `node scripts/generateSecrets.js`
- [ ] `MONGODB_URI` actualizado en `.env`
- [ ] Tests pasando (`pnpm test` → 27/27 ✅)
- [ ] Servidor corriendo (`pnpm run dev`)
- [ ] Health check responde (http://localhost:5000/health)
- [ ] Registro de usuario funciona (comando PowerShell arriba)

---

## 🚨 ¿Problemas?

### ❌ Error: "MongoNetworkError: connection timed out"

**Causa**: Tu IP no está en la whitelist de Atlas

**Solución**:
1. Ir a MongoDB Atlas → Network Access
2. Add IP Address → `0.0.0.0/0` (permite todas las IPs)

---

### ❌ Error: "Authentication failed"

**Causa**: Password incorrecto en el connection string

**Solución**:
1. Verificar que reemplazaste `<password>` en el connection string
2. Si tu password tiene caracteres especiales (`@`, `:`, `/`), codifícalos:
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`
   - `!` → `%21`

Ejemplo:
```
Password: MyPass@123!
En URI: MyPass%40123%21
```

---

### ❌ Tests fallan: "Cannot find module"

**Causa**: Dependencias no instaladas correctamente

**Solución**:
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
pnpm install
pnpm test
```

---

### ❌ "pnpm: command not found"

**Causa**: PNPM no está instalado globalmente

**Solución**:
```powershell
npm install -g pnpm
# Reiniciar PowerShell
pnpm --version  # Debe mostrar 8.x.x o superior
```

---

## 🌥️ Próximo Paso: Google Cloud (Opcional)

Una vez que todo funcione localmente, puedes desplegar a producción:

**📚 Ver guía completa**: [docs/SETUP_GOOGLE_CLOUD.md](docs/SETUP_GOOGLE_CLOUD.md)

**Resumen rápido**:
1. Crear proyecto en GCP (gratis, solo necesitas tarjeta para verificar - no cobran)
2. Instalar `gcloud` CLI
3. Build imagen Docker
4. Deploy a Cloud Run (serverless, paga solo por uso)

**Costos estimados**:
- MongoDB Atlas: **$0/mes** (M0 Free)
- Google Cloud Run: **$0-15/mes** (free tier cubre ~2M requests/mes)

---

## 📚 Documentación Completa

Una vez que tu backend funcione, explora:

- **[CHECKLIST_CONFIGURACION.md](CHECKLIST_CONFIGURACION.md)** - Guía paso a paso completa
- **[docs/SETUP_MONGODB_ATLAS.md](docs/SETUP_MONGODB_ATLAS.md)** - MongoDB Atlas en detalle
- **[docs/SETUP_GOOGLE_CLOUD.md](docs/SETUP_GOOGLE_CLOUD.md)** - Deploy a producción
- **[docs/INSTALACION.md](docs/INSTALACION.md)** - Instalación completa
- **[docs/SCRIPTS_UTILES.md](docs/SCRIPTS_UTILES.md)** - Comandos útiles
- **[README.md](README.md)** - Documentación principal

---

## 💬 ¿Qué Sigue?

Una vez que tu backend esté funcionando:

### Desarrollo
1. **Implementar endpoints de donaciones**
   - Los modelos ya existen (`backend/src/models/Donation.js`)
   - Crear controllers, routes y tests

2. **Frontend**
   - Ya está configurado en `/frontend`
   - Usar React + Vite + TailwindCSS

3. **Features adicionales**
   - OAuth 2.0 (Google/Apple login)
   - Notificaciones push
   - Mapas con Leaflet

### Producción
1. **Deploy a Google Cloud Run**
   - Ver [SETUP_GOOGLE_CLOUD.md](docs/SETUP_GOOGLE_CLOUD.md)
   - CI/CD automático con GitHub Actions

2. **Monitoreo**
   - Logs en GCP Console
   - Métricas de performance
   - Alertas de errores

3. **Escalabilidad**
   - Cloud Run escala automáticamente (0 a N instancias)
   - MongoDB Atlas puede upgrade a M10 si necesitas más storage

---

## 🎯 Resumen de lo que tienes

```
✅ Backend completo con Express.js
✅ MongoDB con índices geoespaciales
✅ JWT authentication (access + refresh tokens)
✅ 27 tests unitarios (85% cobertura)
✅ Sistema de roles (Donantes, ONGs, Conductores, Admin)
✅ Middleware de seguridad (Helmet, rate limiting, NoSQL sanitization)
✅ Docker y docker-compose funcionales
✅ CI/CD configurado para Google Cloud
✅ Documentación exhaustiva (9 archivos markdown)

⚙️ Por configurar:
⚠️ MongoDB Atlas (15 min) ← EMPIEZA AQUÍ
⚠️ Variables de entorno .env (5 min)
⚠️ Google Cloud (opcional, 1 hora)
```

---

## 📞 Ayuda

Si te atoras en algún paso:

1. **Revisar documentación detallada** en `/docs`
2. **Buscar el error específico** en Google
3. **Verificar los logs** del servidor (`pnpm run dev` muestra errores)
4. **Tests son tu amigo**: Si `pnpm test` pasa, el código funciona

---

**Última actualización**: 4 de marzo de 2026  
**Tiempo estimado para configurar**: 30 minutos  
**Costo**: $0 (todo en free tier)

<p align="center">
  <b>🚀 ¡Ahora sí, empieza con MongoDB Atlas! 🚀</b>
</p>
