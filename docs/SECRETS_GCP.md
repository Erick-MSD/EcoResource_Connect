# 🔐 Configuración de Secrets en Google Cloud Platform

**Guía completa para configurar los secrets en GCP Secret Manager**

---

## ⚠️ IMPORTANTE: Qué Password Usar

### 📋 Tu Connection String de MongoDB Atlas

**Original** (como te lo dio MongoDB):
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<cluster-name>
```

**Para usar en .env y GCP** (con `!` codificado como `%21`):
```
mongodb+srv://<username>:<password_encoded>@<cluster>.mongodb.net/<database_name>?retryWrites=true&w=majority&appName=<cluster-name>
```

### ✅ RESPUESTA A TU PREGUNTA

**En GCP Secret Manager debes usar la versión CODIFICADA** (con `%21`)

**¿Por qué?**
- El símbolo `!` tiene significado especial en URLs
- MongoDB necesita que esté codificado como `%21`
- Si usas `!` sin codificar, la conexión FALLARÁ

**Cambios importantes**:
1. ✅ `!` → `%21` (ya codificado)
2. ✅ Añadido `/ecoresource_db` (nombre de la base de datos)
3. ✅ Añadido `?retryWrites=true&w=majority` (opciones recomendadas)

---

## 🌥️ Pasos para Configurar GCP Secret Manager

### Paso 1: Instalar y Configurar gcloud CLI

```powershell
# Opción 1: Con Chocolatey
choco install gcloudsdk

# Opción 2: Descargar instalador
# https://cloud.google.com/sdk/docs/install

# Inicializar (después de instalar)
gcloud init

# Seleccionar:
# - Tu cuenta de Google
# - Proyecto: ecoresource-connect-2026 (o el que creaste)
# - Región: us-central1
```

---

### Paso 2: Crear Proyecto en GCP (si no lo tienes)

```powershell
# Via web: https://console.cloud.google.com/
# 1. Click "Select a project" arriba
# 2. "New Project"
# 3. Nombre: ecoresource-connect
# 4. Project ID: ecoresource-connect-2026 (o similar disponible)
```

**Guardar tu Project ID** (lo necesitarás):
```powershell
$PROJECT_ID = "ecoresource-connect-2026"  # Reemplaza con tu ID real
```

---

### Paso 3: Habilitar Secret Manager API

```powershell
# Habilitar API
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

# Verificar que está habilitada
gcloud services list --enabled --project=$PROJECT_ID | Select-String "secretmanager"
```

---

### Paso 4: Crear los 3 Secrets Principales

#### Secret 1: JWT_SECRET

```powershell
# Crear secret (reemplaza con tu JWT_SECRET desde .env local)
# Puedes leerlo con: Select-String -Path "backend\.env" -Pattern "JWT_SECRET="
echo -n "<TU_JWT_SECRET_AQUI>" | gcloud secrets create JWT_SECRET --data-file=- --project=$PROJECT_ID

# Verificar
gcloud secrets describe JWT_SECRET --project=$PROJECT_ID
```

---

#### Secret 2: JWT_REFRESH_SECRET

```powershell
# Crear secret (reemplaza con tu JWT_REFRESH_SECRET desde .env local)
echo -n "<TU_JWT_REFRESH_SECRET_AQUI>" | gcloud secrets create JWT_REFRESH_SECRET --data-file=- --project=$PROJECT_ID

# Verificar
gcloud secrets describe JWT_REFRESH_SECRET --project=$PROJECT_ID
```

---

#### Secret 3: MONGODB_URI (⚠️ IMPORTANTE - Usa la versión CODIFICADA)

```powershell
# ✅ CORRECTO - Con %21 y nombre de base de datos
# Reemplaza con tu MongoDB URI real desde MongoDB Atlas
echo -n "mongodb+srv://<username>:<password_encoded>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority" | gcloud secrets create MONGODB_URI --data-file=- --project=$PROJECT_ID

# Verificar
gcloud secrets describe MONGODB_URI --project=$PROJECT_ID
```

**❌ NO uses**:
```powershell
# INCORRECTO - Falta codificar ! y falta nombre de DB
echo -n "mongodb+srv://user:password!@cluster..." | gcloud secrets create MONGODB_URI --data-file=-
```

---

### Paso 5: Verificar Secrets Creados

```powershell
# Listar todos los secrets
gcloud secrets list --project=$PROJECT_ID

# Ver versiones de cada secret
gcloud secrets versions list JWT_SECRET --project=$PROJECT_ID
gcloud secrets versions list JWT_REFRESH_SECRET --project=$PROJECT_ID
gcloud secrets versions list MONGODB_URI --project=$PROJECT_ID
```

**Resultado esperado**:
```
NAME                    CREATED              STATE
JWT_SECRET              2026-03-04...        enabled
JWT_REFRESH_SECRET      2026-03-04...        enabled
MONGODB_URI             2026-03-04...        enabled
```

---

### Paso 6: Dar Permisos al Service Account de Cloud Run

```powershell
# Obtener número del proyecto
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Service account por defecto de Cloud Run
$SERVICE_ACCOUNT = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Dar acceso a cada secret
gcloud secrets add-iam-policy-binding JWT_SECRET `
  --member="serviceAccount:${SERVICE_ACCOUNT}" `
  --role="roles/secretmanager.secretAccessor" `
  --project=$PROJECT_ID

gcloud secrets add-iam-policy-binding JWT_REFRESH_SECRET `
  --member="serviceAccount:${SERVICE_ACCOUNT}" `
  --role="roles/secretmanager.secretAccessor" `
  --project=$PROJECT_ID

gcloud secrets add-iam-policy-binding MONGODB_URI `
  --member="serviceAccount:${SERVICE_ACCOUNT}" `
  --role="roles/secretmanager.secretAccessor" `
  --project=$PROJECT_ID
```

**Verificar permisos**:
```powershell
gcloud secrets get-iam-policy JWT_SECRET --project=$PROJECT_ID
```

---

## 📋 Resumen de Secrets

| Secret Name | Valor | Notas |
|-------------|-------|-------|
| `JWT_SECRET` | `[Leer desde tu .env local]` | 64 chars hex |
| `JWT_REFRESH_SECRET` | `[Leer desde tu .env local]` | 64 chars hex |
| `MONGODB_URI` | `mongodb+srv://<user>:<pass_encoded>@<cluster>.mongodb.net/<db>?...` | ⚠️ Con `%21` y `/database_name` |

---

## 🔄 Cómo Actualizar un Secret (si cometes un error)

```powershell
# Añadir nueva versión (la anterior se mantiene como backup)
echo -n "NUEVO_VALOR_AQUI" | gcloud secrets versions add MONGODB_URI --data-file=- --project=$PROJECT_ID

# Ver todas las versiones
gcloud secrets versions list MONGODB_URI --project=$PROJECT_ID

# Usar versión específica en Cloud Run (opcional)
# Por defecto usa "latest"
```

---

## 🚀 Deploy a Cloud Run Usando los Secrets

Una vez creados los secrets:

```powershell
# Variables
$PROJECT_ID = "ecoresource-connect-2026"
$REGION = "us-central1"
$SERVICE_NAME = "ecoresource-backend"
$IMAGE_NAME = "gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Build imagen Docker
cd backend
docker build -t ${IMAGE_NAME}:latest .

# Autenticar Docker con GCR
gcloud auth configure-docker

# Push imagen
docker push ${IMAGE_NAME}:latest

# Deploy a Cloud Run con secrets
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
  --set-env-vars="NODE_ENV=production,PORT=5000,CORS_ORIGIN=*" `
  --set-secrets="JWT_SECRET=JWT_SECRET:latest,JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest,MONGODB_URI=MONGODB_URI:latest" `
  --project=$PROJECT_ID
```

**Explicación de `--set-secrets`**:
- `JWT_SECRET=JWT_SECRET:latest` → Variable = Nombre del secret : Versión
- Cloud Run inyecta los valores como variables de entorno
- Tu código en `src/server.js` lee `process.env.JWT_SECRET` automáticamente

---

## 🧪 Probar Connection String Localmente

Antes de subirlo a GCP, prueba que funcione:

```powershell
cd backend

# Probar conexión (con la URI codificada desde tu .env)
# Reemplaza <TU_MONGODB_URI> con tu connection string real
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || '<TU_MONGODB_URI>').then(() => { console.log('✅ Conexión exitosa!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

**Resultado esperado**: `✅ Conexión exitosa!`

---

## ❓ Preguntas Frecuentes

### 1. ¿Debo usar el password con `!` o con `%21`?

**Respuesta**: **Siempre usa `%21`** en:
- `.env` local
- GCP Secret Manager
- Cualquier lugar donde uses la URI completa

Solo usa `!` sin codificar si estás escribiendo el password por separado (no en una URI).

---

### 2. ¿Qué pasa si me equivoco en el secret?

Puedes actualizarlo:
```powershell
# Crear nueva versión (no borra la anterior)
echo -n "NUEVO_VALOR_CORRECTO" | gcloud secrets versions add MONGODB_URI --data-file=- --project=$PROJECT_ID

# Cloud Run usará la última versión automáticamente
```

---

### 3. ¿Puedo ver el valor de un secret después de crearlo?

```powershell
# Ver valor (requiere permisos de accessor)
gcloud secrets versions access latest --secret=JWT_SECRET --project=$PROJECT_ID
```

---

### 4. ¿Cómo verifico que Cloud Run tiene acceso a los secrets?

Después del deploy:
```powershell
# Obtener URL del servicio
$SERVICE_URL = (gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)

# Probar health check
Invoke-WebRequest -Uri "${SERVICE_URL}/health" -UseBasicParsing

# Ver logs (si hay error de conexión)
gcloud run services logs read $SERVICE_NAME --region=$REGION --project=$PROJECT_ID
```

---

### 5. ¿Los secrets tienen costo?

**Primeros 6 secrets: GRATIS**
- 10,000 accesos/mes gratis
- Después: $0.06 / 10,000 accesos

Para este proyecto: **$0/mes** (estás muy por debajo del límite)

---

## 📊 Configuración MongoDB Atlas para GCP

### Network Access en Atlas

1. Ir a MongoDB Atlas → Network Access
2. **Para desarrollo**: Mantener `0.0.0.0/0`
3. **Para producción** (opcional):
   - Obtener IPs de salida de Cloud Run
   - Añadirlas específicamente en Atlas
   - Eliminar `0.0.0.0/0`

### Database Access

Configura en MongoDB Atlas:
- Usuario: `<tu_usuario>`
- Password: `<tu_password>` (en Atlas)
- Pero en URI usa la versión codificada: caracteres especiales deben ser URL-encoded

---

## ✅ Checklist de Configuración GCP

- [ ] gcloud CLI instalado
- [ ] Proyecto GCP creado
- [ ] Secret Manager API habilitada
- [ ] Secret `JWT_SECRET` creado
- [ ] Secret `JWT_REFRESH_SECRET` creado
- [ ] Secret `MONGODB_URI` creado (con `%21` y `/ecoresource_db`)
- [ ] Permisos dados al service account
- [ ] Connection string probado localmente
- [ ] Imagen Docker buildeada
- [ ] Imagen pusheada a GCR
- [ ] Cloud Run desplegado con secrets
- [ ] Health check funciona en producción

---

## 🚀 Siguiente Paso

Una vez que tengas los secrets configurados:

1. **Crear datos ficticios**: `node backend/scripts/seedData.js`
2. **Deploy a Cloud Run**: Ver comandos arriba
3. **Configurar GitHub Secrets**: Ver [CHECKLIST_CONFIGURACION.md](CHECKLIST_CONFIGURACION.md)

---

## 💡 Tips de Seguridad

1. ✅ **NUNCA** commitees secrets a Git
2. ✅ Usa Secret Manager para producción
3. ✅ `.env` está en `.gitignore` (ya configurado)
4. ✅ Rota secrets cada 90 días (buena práctica)
5. ✅ Revisa audit logs de Secret Manager mensualmente

---

**Última actualización**: 4 de marzo de 2026  
**Configurado para**: ecoresource-cluster.olny8dm.mongodb.net  
**Estado**: ✅ Listo para GCP Deploy
