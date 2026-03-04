# ✅ CHECKLIST DE CONFIGURACIÓN - EcoResource Connect

Esta lista te guía paso a paso para completar la configuración del proyecto con **Google Cloud Platform** y **MongoDB Atlas**.

---

## 📋 Estado Actual del Proyecto

**Lo que YA está funcionando** ✅:
- ✅ Backend completo con Express.js y Mongoose
- ✅ 27 tests unitarios pasando (85% cobertura)
- ✅ Autenticación JWT con refresh tokens
- ✅ Middleware de seguridad (Helmet, sanitización NoSQL)
- ✅ Documentación completa (9 archivos markdown)
- ✅ Docker y docker-compose funcionales
- ✅ CI/CD configurado para GitHub Actions

**Lo que NECESITAS configurar** ⚙️:
- ⚠️ Base de datos MongoDB Atlas
- ⚠️ Variables de entorno (.env)
- ⚠️ Google Cloud Platform (deploy)
- ⚠️ GitHub Secrets (CI/CD)

---

## 🎯 FASE 1: Configuración Local (30 minutos)

### ✅ Paso 1.1: MongoDB Atlas (REQUERIDO)

**Documentación**: [SETUP_MONGODB_ATLAS.md](SETUP_MONGODB_ATLAS.md)

- [ ] **1.1.1** Crear cuenta en [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
- [ ] **1.1.2** Crear cluster M0 Free (Google Cloud, región us-central1)
- [ ] **1.1.3** Crear usuario de base de datos:
  ```
  Username: ecoresource_admin
  Password: [Tu password fuerte]
  Privilegios: Read and write to any database
  ```
- [ ] **1.1.4** Configurar Network Access:
  ```
  IP Address: 0.0.0.0/0
  Comment: Development (temporal)
  ```
- [ ] **1.1.5** Obtener connection string:
  ```
  Formato: mongodb+srv://ecoresource_admin:PASSWORD@cluster.mongodb.net/ecoresource_db
  ```
- [ ] **1.1.6** Guardar connection string en un lugar seguro

**Comando de prueba**:
```powershell
# Reemplaza TU_CONNECTION_STRING con tu string real
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect('TU_CONNECTION_STRING').then(() => { console.log('✅ MongoDB funciona!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

---

### ✅ Paso 1.2: Variables de Entorno (REQUERIDO)

- [ ] **1.2.1** Crear archivo `backend/.env`:
  ```powershell
  cd backend
  Copy-Item .env.example .env
  ```

- [ ] **1.2.2** Editar `backend/.env` con tus valores:
  ```env
  # MongoDB Atlas
  MONGODB_URI=mongodb+srv://ecoresource_admin:TU_PASSWORD@cluster.xxxxx.mongodb.net/ecoresource_db?retryWrites=true&w=majority

  # JWT Secrets (genera tus propios valores)
  JWT_SECRET=tu_jwt_secret_super_seguro_min_32_caracteres_2026
  JWT_REFRESH_SECRET=tu_jwt_refresh_secret_diferente_min_32_caracteres_2026
  JWT_EXPIRE=15m
  JWT_REFRESH_EXPIRE=7d

  # Server
  NODE_ENV=development
  PORT=5000

  # CORS
  CORS_ORIGIN=http://localhost:3000

  # Rate Limit
  RATE_LIMIT_WINDOW_MS=900000
  RATE_LIMIT_MAX_REQUESTS=100
  ```

- [ ] **1.2.3** Generar secrets seguros (opcional pero recomendado):
  ```powershell
  # Genera JWT_SECRET
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

  # Genera JWT_REFRESH_SECRET (usa el resultado para JWT_REFRESH_SECRET)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

**⚠️ NUNCA SUBAS `.env` A GIT** - Ya está en `.gitignore`

---

### ✅ Paso 1.3: Instalar Dependencias (REQUERIDO)

- [ ] **1.3.1** Instalar PNPM globalmente (si no lo tienes):
  ```powershell
  npm install -g pnpm
  
  # Verificar versión
  pnpm --version  # Debe ser >= 8.0.0
  ```

- [ ] **1.3.2** Instalar dependencias del backend:
  ```powershell
  cd backend
  pnpm install
  ```

- [ ] **1.3.3** Instalar dependencias del frontend (opcional por ahora):
  ```powershell
  cd frontend
  pnpm install
  ```

**Tiempo estimado**: 3-5 minutos

---

### ✅ Paso 1.4: Probar Backend Localmente (REQUERIDO)

- [ ] **1.4.1** Ejecutar tests:
  ```powershell
  cd backend
  pnpm test
  ```
  **Resultado esperado**: 27 tests pasando ✅

- [ ] **1.4.2** Iniciar servidor de desarrollo:
  ```powershell
  cd backend
  pnpm run dev
  ```
  **Resultado esperado**: 
  ```
  ✅ MongoDB connected: cluster.xxxxx.mongodb.net
  🚀 Server running on port 5000
  ```

- [ ] **1.4.3** Probar health check (en nueva terminal):
  ```powershell
  curl http://localhost:5000/health
  ```
  **Resultado esperado**: `{"status":"ok","timestamp":"...","environment":"development"}`

- [ ] **1.4.4** Probar endpoint de registro:
  ```powershell
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

**Si todo funciona, ✅ FASE 1 COMPLETA!**

---

## 🌥️ FASE 2: Configuración de Google Cloud (1 hora)

**Documentación**: [SETUP_GOOGLE_CLOUD.md](SETUP_GOOGLE_CLOUD.md)

### ✅ Paso 2.1: Crear Proyecto GCP

- [ ] **2.1.1** Ir a [https://console.cloud.google.com/](https://console.cloud.google.com/)
- [ ] **2.1.2** Crear nuevo proyecto:
  ```
  Project name: ecoresource-connect
  Project ID: ecoresource-connect-2026
  Location: No organization
  ```
- [ ] **2.1.3** Habilitar APIs necesarias:
  - [ ] Cloud Run API
  - [ ] Cloud Build API
  - [ ] Container Registry API
  - [ ] Secret Manager API

---

### ✅ Paso 2.2: Instalar Google Cloud CLI

- [ ] **2.2.1** Descargar e instalar gcloud CLI:
  - Windows: [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
  - O con Chocolatey: `choco install gcloudsdk`

- [ ] **2.2.2** Inicializar gcloud:
  ```powershell
  gcloud init
  ```
  - Login con tu cuenta de Google
  - Selecciona proyecto: ecoresource-connect-2026
  - Región: us-central1

- [ ] **2.2.3** Autenticar Docker con GCR:
  ```powershell
  gcloud auth configure-docker
  ```

---

### ✅ Paso 2.3: Crear Secrets en Google Cloud

- [ ] **2.3.1** Crear JWT_SECRET:
  ```powershell
  echo -n "tu_jwt_secret_super_seguro_aqui_min_32_caracteres_2026" | gcloud secrets create JWT_SECRET --data-file=-
  ```

- [ ] **2.3.2** Crear JWT_REFRESH_SECRET:
  ```powershell
  echo -n "tu_jwt_refresh_secret_diferente_min_32_caracteres_2026" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-
  ```

- [ ] **2.3.3** Crear MONGODB_URI:
  ```powershell
  echo -n "mongodb+srv://ecoresource_admin:PASSWORD@cluster.mongodb.net/ecoresource_db" | gcloud secrets create MONGODB_URI --data-file=-
  ```

- [ ] **2.3.4** Dar permisos al service account:
  ```powershell
  $PROJECT_ID = "ecoresource-connect-2026"
  $PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
  $SERVICE_ACCOUNT = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
  
  gcloud secrets add-iam-policy-binding JWT_SECRET --member="serviceAccount:${SERVICE_ACCOUNT}" --role="roles/secretmanager.secretAccessor"
  
  gcloud secrets add-iam-policy-binding JWT_REFRESH_SECRET --member="serviceAccount:${SERVICE_ACCOUNT}" --role="roles/secretmanager.secretAccessor"
  
  gcloud secrets add-iam-policy-binding MONGODB_URI --member="serviceAccount:${SERVICE_ACCOUNT}" --role="roles/secretmanager.secretAccessor"
  ```

---

### ✅ Paso 2.4: Build y Deploy (Primer Despliegue)

- [ ] **2.4.1** Build de imagen Docker:
  ```powershell
  cd backend
  
  $PROJECT_ID = "ecoresource-connect-2026"
  $IMAGE_NAME = "gcr.io/$PROJECT_ID/ecoresource-backend"
  
  docker build -t ${IMAGE_NAME}:latest .
  ```

- [ ] **2.4.2** Push a Google Container Registry:
  ```powershell
  docker push ${IMAGE_NAME}:latest
  ```

- [ ] **2.4.3** Deploy a Cloud Run:
  ```powershell
  $SERVICE_NAME = "ecoresource-backend"
  $REGION = "us-central1"
  
  gcloud run deploy $SERVICE_NAME `
    --image=${IMAGE_NAME}:latest `
    --platform=managed `
    --region=$REGION `
    --allow-unauthenticated `
    --port=5000 `
    --memory=512Mi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=10 `
    --timeout=60 `
    --set-env-vars="NODE_ENV=production,PORT=5000" `
    --set-secrets="JWT_SECRET=JWT_SECRET:latest,JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest,MONGODB_URI=MONGODB_URI:latest"
  ```

- [ ] **2.4.4** Obtener URL del servicio:
  ```powershell
  $SERVICE_URL = (gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
  Write-Host "✅ Servicio desplegado en: $SERVICE_URL"
  ```

- [ ] **2.4.5** Probar health check:
  ```powershell
  curl "${SERVICE_URL}/health"
  ```

**Si funciona, ✅ FASE 2 COMPLETA!**

---

## 🔄 FASE 3: Configuración CI/CD (30 minutos)

### ✅ Paso 3.1: Crear Service Account para GitHub

- [ ] **3.1.1** Crear service account:
  ```powershell
  $PROJECT_ID = "ecoresource-connect-2026"
  
  gcloud iam service-accounts create github-actions --display-name="GitHub Actions"
  ```

- [ ] **3.1.2** Dar permisos necesarios:
  ```powershell
  $SA_EMAIL = "github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
  
  gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/run.admin"
  
  gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/storage.admin"
  
  gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/iam.serviceAccountUser"
  ```

- [ ] **3.1.3** Crear key JSON:
  ```powershell
  gcloud iam service-accounts keys create github-actions-key.json --iam-account=$SA_EMAIL
  ```

- [ ] **3.1.4** Copiar contenido del archivo `github-actions-key.json` (lo necesitarás en el siguiente paso)

---

### ✅ Paso 3.2: Configurar GitHub Secrets

- [ ] **3.2.1** Ir a tu repositorio en GitHub
- [ ] **3.2.2** Settings → Secrets and variables → Actions → New repository secret

**Crear los siguientes secrets**:

- [ ] **3.2.3** `GCP_PROJECT_ID`:
  ```
  Valor: ecoresource-connect-2026
  ```

- [ ] **3.2.4** `GCP_SA_KEY`:
  ```
  Valor: [Pega todo el contenido de github-actions-key.json]
  ```

- [ ] **3.2.5** `GCP_REGION`:
  ```
  Valor: us-central1
  ```

- [ ] **3.2.6** `GCP_SERVICE`:
  ```
  Valor: ecoresource-backend
  ```

- [ ] **3.2.7** `MONGODB_URI`:
  ```
  Valor: mongodb+srv://ecoresource_admin:PASSWORD@cluster.mongodb.net/ecoresource_db
  ```

- [ ] **3.2.8** `JWT_SECRET`:
  ```
  Valor: [Tu JWT secret del .env]
  ```

- [ ] **3.2.9** `JWT_REFRESH_SECRET`:
  ```
  Valor: [Tu JWT refresh secret del .env]
  ```

- [ ] **3.2.10** `FRONTEND_URL` (si ya tienes frontend desplegado):
  ```
  Valor: https://tu-dominio-frontend.com
  O: https://ecoresource-connect.web.app (si usas Firebase)
  ```

---

### ✅ Paso 3.3: Probar Pipeline CI/CD

- [ ] **3.3.1** Hacer commit y push del workflow:
  ```powershell
  git add .github/workflows/ci-cd-gcp.yml
  git commit -m "ci: add Google Cloud Platform CI/CD pipeline"
  git push origin main
  ```

- [ ] **3.3.2** Ver ejecución en GitHub:
  - Ir a tu repositorio → Actions
  - Ver el workflow "CI/CD Pipeline - Google Cloud Platform"

- [ ] **3.3.3** Verificar que todos los jobs pasen:
  - [ ] ✅ Tests & Quality Checks
  - [ ] ✅ SonarQube Code Analysis (si configuraste SONAR_TOKEN)
  - [ ] ✅ OWASP ZAP Security Scan
  - [ ] ✅ Build & Push to GCR
  - [ ] ✅ Deploy to Cloud Run

**Si todo pasa, ✅ FASE 3 COMPLETA!**

---

## 🎯 FASE 4: Configuración Post-Deploy (15 minutos)

### ✅ Paso 4.1: Actualizar MongoDB Atlas Network Access

- [ ] **4.1.1** Obtener IPs de salida de Cloud Run (o dejar 0.0.0.0/0 para desarrollo)

- [ ] **4.1.2** Opcional: Configurar Cloud NAT con IP estática para producción
  ```powershell
  # Ver SETUP_GOOGLE_CLOUD.md paso 9.2
  ```

---

### ✅ Paso 4.2: Configurar Monitoreo

- [ ] **4.2.1** Ir a GCP Console → Cloud Run → Tu servicio
- [ ] **4.2.2** Revisar métricas:
  - Request count
  - Request latency
  - Container instances

- [ ] **4.2.3** Opcional: Configurar alertas de alto uso

---

### ✅ Paso 4.3: Probar Ambiente de Producción

- [ ] **4.3.1** Obtener URL de producción:
  ```powershell
  $SERVICE_URL = (gcloud run services describe ecoresource-backend --region=us-central1 --format="value(status.url)")
  Write-Host "URL: $SERVICE_URL"
  ```

- [ ] **4.3.2** Probar endpoints:
  ```powershell
  # Health check
  curl "${SERVICE_URL}/health"
  
  # Registro
  $body = @{
    email = "production@example.com"
    password = "Prod1234!"
    role = "donor"
    profile = @{ name = "Prod User"; phone = "+525512345678" }
  } | ConvertTo-Json
  
  Invoke-RestMethod -Uri "${SERVICE_URL}/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
  ```

**Si funciona, ✅ FASE 4 COMPLETA!**

---

## 📊 Resumen de Configuración Completada

### Servicios Configurados

```yaml
✅ MongoDB Atlas:
  - Cluster: M0 Free (Google Cloud)
  - Base de datos: ecoresource_db
  - Usuario: ecoresource_admin
  - Costo: $0/mes

✅ Google Cloud Platform:
  - Proyecto: ecoresource-connect-2026
  - Cloud Run: ecoresource-backend
  - Memory: 512Mi
  - Min instances: 0 (escala a cero = gratis sin tráfico)
  - Costo estimado: $0-15/mes
  
✅ CI/CD:
  - GitHub Actions automatizado
  - Tests + Security + Deploy en cada push
  
✅ Seguridad:
  - Secrets en Google Secret Manager
  - HTTPS automático
  - OWASP ZAP scans
  - Rate limiting activo
```

---

## 🐛 Solución de Problemas Rápida

### ❌ Tests fallan localmente

```powershell
# Verificar que MongoDB Atlas esté accesible
ping cluster.xxxxx.mongodb.net

# Verificar variables de entorno
cat backend/.env

# Reinstalar dependencias
cd backend
Remove-Item -Recurse -Force node_modules
pnpm install
```

---

### ❌ "Container failed to start" en Cloud Run

```powershell
# Ver logs
gcloud run services logs tail ecoresource-backend --region=us-central1

# Verificar imagen
gcloud container images list --repository=gcr.io/ecoresource-connect-2026

# Verificar secrets
gcloud secrets list
```

---

### ❌ "MongoNetworkError" en producción

- MongoDB Atlas → Network Access
- Añadir IP `0.0.0.0/0` temporalmente
- Si persiste, verificar connection string en Secret Manager

---

## 🚀 Próximos Pasos (Opcional)

Una vez que todo funcione:

- [ ] Implementar endpoints de donaciones (modelos ya existen)
- [ ] Deploy del frontend a Firebase Hosting
- [ ] Configurar dominio personalizado
- [ ] Implementar OAuth 2.0 (Google/Apple)
- [ ] Comenzar recolección de datos para modelo ML

---

## 📞 Ayuda Adicional

**Documentación completa**:
- [SETUP_MONGODB_ATLAS.md](SETUP_MONGODB_ATLAS.md)
- [SETUP_GOOGLE_CLOUD.md](SETUP_GOOGLE_CLOUD.md)
- [INSTALACION.md](INSTALACION.md)
- [INDEX.md](INDEX.md)

**Comandos útiles**:
- [SCRIPTS_UTILES.md](SCRIPTS_UTILES.md)

**Si encuentras errores**:
- Busca en docs/ el tema específico
- Revisa los logs con `gcloud run services logs tail`
- Verifica las variables de entorno en `.env` y Secret Manager

---

## ✅ Checklist Final

Antes de considerar la configuración completa:

**Desarrollo Local**:
- [ ] MongoDB Atlas funcionando
- [ ] `.env` configurado correctamente
- [ ] Tests pasando (27/27)
- [ ] Backend corriendo en http://localhost:5000
- [ ] Health check responde ✅

**Cloud (Opcional pero recomendado)**:
- [ ] Google Cloud proyecto creado
- [ ] Secrets configurados en Secret Manager
- [ ] Imagen Docker pusheada a GCR
- [ ] Cloud Run desplegado
- [ ] Health check en producción responde ✅
- [ ] GitHub Secrets configurados
- [ ] CI/CD pipeline ejecutándose

**Seguridad**:
- [ ] `.env` NO está en git
- [ ] `github-actions-key.json` eliminado del disco
- [ ] Passwords fuertes generados
- [ ] Network Access en Atlas configurado

---

**Última actualización**: 4 de marzo de 2026  
**Tiempo estimado total**: 2-3 horas  
**Costo mensual**: $0-15 (con Free Tiers)

<p align="center">
  ✅ <b>Sigue esta lista y tendrás tu proyecto funcionando en producción</b> ✅
</p>
