# ☁️ Configuración de Google Cloud Platform (GCP)

Esta guía reemplaza AWS Fargate con **Google Cloud Run** para el despliegue de EcoResource Connect.

---

## 💰 Comparación de Costos: GCP vs AWS

| Servicio | AWS | GCP | Ahorro |
|----------|-----|-----|--------|
| **Compute** | Fargate: $30/mes | Cloud Run: $0-15/mes | 50%+ |
| **Database** | RDS: $15/mes | MongoDB Atlas Free | 100% |
| **Load Balancer** | ALB: $16/mes | Incluido en Cloud Run | 100% |
| **Certificado SSL** | ACM: Gratis | SSL automático | - |
| **Container Registry** | ECR: $1/mes | GCR: $0.26/mes | 74% |
| **TOTAL** | ~$62/mes | ~$15/mes | **76% ahorro** |

✅ **Google Cloud Run incluye**:
- HTTPS automático
- Auto-scaling (0 a N instancias)
- Load balancing integrado
- Free tier: 2 millones de requests/mes

---

## 🚀 Paso 1: Crear Proyecto en Google Cloud

### 1.1 Consola Web

1. Ve a [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Click en el selector de proyectos (arriba a la izquierda)
3. Click en **"NEW PROJECT"**
4. **Configuración**:
   ```
   Project name: ecoresource-connect
   Project ID: ecoresource-connect-2026
   Location: No organization
   ```
5. Click en **"CREATE"**

### 1.2 Activar APIs Necesarias

```powershell
# Navegar a la consola del proyecto
# Menú → APIs & Services → Enable APIs and Services

# Buscar y habilitar:
# ✅ Cloud Run API
# ✅ Cloud Build API
# ✅ Container Registry API
# ✅ Secret Manager API
# ✅ Cloud Logging API
```

---

## 🔑 Paso 2: Instalar y Configurar Google Cloud CLI

### 2.1 Descargar gcloud CLI (Windows)

```powershell
# Opción 1: Descargar instalador
# https://cloud.google.com/sdk/docs/install

# Opción 2: Con Chocolatey
choco install gcloudsdk

# Opción 3: Con winget
winget install Google.CloudSDK
```

### 2.2 Inicializar gcloud

```powershell
# Iniciar sesión
gcloud init

# Selecciona:
# 1. Log in with a new account
# 2. Selecciona el proyecto: ecoresource-connect-2026
# 3. Selecciona región: us-central1 (Iowa)

# Verificar configuración
gcloud config list
```

### 2.3 Configurar Docker para GCR

```powershell
# Autenticar Docker con Google Container Registry
gcloud auth configure-docker

# Mensaje esperado:
# ✅ Docker configuration file updated.
```

---

## 🐳 Paso 3: Build y Push de Imágenes Docker

### 3.1 Variables de Entorno

```powershell
# Definir variables
$PROJECT_ID = "ecoresource-connect-2026"
$REGION = "us-central1"
$SERVICE_NAME = "ecoresource-backend"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"
```

### 3.2 Build de la Imagen

```powershell
# Ir al directorio backend
cd backend

# Build con tag
docker build -t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:v1.0.0 .

# Verificar imagen creada
docker images | Select-String "ecoresource"
```

### 3.3 Push a Google Container Registry

```powershell
# Push imagen latest
docker push ${IMAGE_NAME}:latest

# Push imagen con versión
docker push ${IMAGE_NAME}:v1.0.0

# Verificar en GCP Console:
# Menú → Container Registry → Images
```

---

## 🔒 Paso 4: Configurar Secrets Manager

### 4.1 Crear Secrets

```powershell
# JWT Secret
echo -n "tu_jwt_secret_super_seguro_aqui_min_32_caracteres_2026" | gcloud secrets create JWT_SECRET --data-file=-

# JWT Refresh Secret
echo -n "tu_jwt_refresh_secret_diferente_min_32_caracteres_2026" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-

# MongoDB URI (desde Atlas)
echo -n "mongodb+srv://ecoresource_admin:PASSWORD@cluster.mongodb.net/ecoresource_db" | gcloud secrets create MONGODB_URI --data-file=-

# Verificar secrets creados
gcloud secrets list
```

### 4.2 Dar Permisos al Service Account

```powershell
# Obtener email del service account de Cloud Run
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
$SERVICE_ACCOUNT = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Dar acceso a los secrets
gcloud secrets add-iam-policy-binding JWT_SECRET --member="serviceAccount:${SERVICE_ACCOUNT}" --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding JWT_REFRESH_SECRET --member="serviceAccount:${SERVICE_ACCOUNT}" --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding MONGODB_URI --member="serviceAccount:${SERVICE_ACCOUNT}" --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 Paso 5: Deploy a Cloud Run

### 5.1 Deploy Manual (Primera vez)

```powershell
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
  --timeout=300 `
  --set-env-vars="NODE_ENV=production,PORT=5000,CORS_ORIGIN=https://ecoresource-connect.web.app" `
  --set-secrets="JWT_SECRET=JWT_SECRET:latest,JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest,MONGODB_URI=MONGODB_URI:latest"
```

**Explicación de parámetros**:
```yaml
--allow-unauthenticated: API pública (requiere JWT en endpoints protegidos)
--port: 5000 (puerto del backend)
--memory: 512Mi (suficiente para Node.js)
--min-instances: 0 (escala a cero = GRATIS cuando no hay tráfico)
--max-instances: 10 (máximo de instancias paralelas)
--timeout: 300s (5 minutos para requests largos)
--set-secrets: Inyecta secrets como variables de entorno
```

### 5.2 Obtener URL del Servicio

```powershell
# Obtener URL
$SERVICE_URL = (gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

Write-Host "✅ Servicio desplegado en: $SERVICE_URL"

# Probar health check
curl "${SERVICE_URL}/health"

# Respuesta esperada:
# {"status":"ok","timestamp":"2026-03-04T...","environment":"production"}
```

---

## 🌐 Paso 6: Configurar Dominio Personalizado (Opcional)

### 6.1 Mapear Dominio

```powershell
# Si tienes un dominio propio (ej: api.ecoresource-connect.com)
gcloud run domain-mappings create --service=$SERVICE_NAME --domain=api.ecoresource-connect.com --region=$REGION

# Aparecerán registros DNS que debes añadir a tu proveedor de dominio
```

### 6.2 Registros DNS Necesarios

```
Tipo: CNAME
Nombre: api
Valor: ghs.googlehosted.com
TTL: 3600
```

---

## 🔄 Paso 7: Configurar CI/CD con GitHub Actions

### 7.1 Crear Service Account para CI/CD

```powershell
# Crear service account
gcloud iam service-accounts create github-actions --display-name="GitHub Actions"

# Email del service account
$SA_EMAIL = "github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Dar permisos necesarios
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/iam.serviceAccountUser"

# Crear key JSON
gcloud iam service-accounts keys create github-actions-key.json --iam-account=$SA_EMAIL

# Este archivo se usará en GitHub Secrets
```

### 7.2 Configurar GitHub Secrets

Ve a tu repositorio en GitHub:

```
Repositorio → Settings → Secrets and variables → Actions → New repository secret
```

**Secrets a crear**:

```env
GCP_PROJECT_ID = ecoresource-connect-2026

GCP_SA_KEY = [contenido completo del archivo github-actions-key.json]

GCP_REGION = us-central1

GCP_SERVICE = ecoresource-backend

MONGODB_URI = mongodb+srv://ecoresource_admin:PASSWORD@cluster.mongodb.net/ecoresource_db

JWT_SECRET = tu_jwt_secret_super_seguro_aqui_min_32_caracteres_2026

JWT_REFRESH_SECRET = tu_jwt_refresh_secret_diferente_min_32_caracteres_2026
```

---

## 📋 Paso 8: Actualizar Workflow de GitHub Actions

Ya creé el archivo, solo necesitas actualizarlo:

```powershell
# El archivo .github/workflows/ci-cd-gcp.yml ya está creado
# Solo verifica que los secrets estén configurados en GitHub
```

---

## 📊 Paso 9: Configurar MongoDB Atlas para GCP

### 9.1 Obtener IPs de Salida de Cloud Run

Cloud Run usa IPs dinámicas, así que necesitamos permitir todo o usar Cloud NAT:

**Opción 1: Desarrollo (temporal)**
```
MongoDB Atlas → Network Access → Add IP Address
IP: 0.0.0.0/0 (Allow all)
Comment: Development - Cloud Run
```

**Opción 2: Producción (recomendado)**

Configurar Cloud NAT con IP estática:

```powershell
# Crear VPC Connector
gcloud compute networks vpc-access connectors create ecoresource-connector `
  --region=$REGION `
  --range=10.8.0.0/28

# Crear Cloud NAT
gcloud compute routers create ecoresource-router --network=default --region=$REGION

gcloud compute routers nats create ecoresource-nat `
  --router=ecoresource-router `
  --region=$REGION `
  --nat-all-subnet-ip-ranges `
  --auto-allocate-nat-external-ips

# Obtener IP estática
gcloud compute addresses create ecoresource-ip --region=$REGION

$STATIC_IP = (gcloud compute addresses describe ecoresource-ip --region=$REGION --format="value(address)")

Write-Host "✅ IP estática: $STATIC_IP"

# Añade esta IP a MongoDB Atlas Network Access
```

---

## 🔍 Paso 10: Monitoreo y Logs

### 10.1 Ver Logs en Tiempo Real

```powershell
# Logs del servicio
gcloud run services logs tail $SERVICE_NAME --region=$REGION

# Filtrar por errores
gcloud run services logs read $SERVICE_NAME --region=$REGION --filter="severity>=ERROR"
```

### 10.2 Dashboard de Métricas

```
GCP Console → Cloud Run → Selecciona servicio → METRICS

Métricas disponibles:
- Request count
- Request latency
- Container instance count
- CPU utilization
- Memory utilization
- Billable container instance time
```

### 10.3 Configurar Alertas

```powershell
# Crear alerta de alto uso de CPU
gcloud alpha monitoring policies create `
  --notification-channels=CHANNEL_ID `
  --display-name="High CPU Usage" `
  --condition-display-name="CPU > 80%" `
  --condition-threshold-value=0.8
```

---

## 🧪 Paso 11: Probar el Despliegue

### 11.1 Health Check

```powershell
$SERVICE_URL = "https://ecoresource-backend-xxxxx-uc.a.run.app"

# Test básico
curl "${SERVICE_URL}/health"

# Test con formato JSON
curl "${SERVICE_URL}/health" | ConvertFrom-Json
```

### 11.2 Probar Endpoints de Autenticación

```powershell
# Registro de usuario
$body = @{
  email = "test@example.com"
  password = "Test1234!"
  role = "donor"
  profile = @{
    name = "Test User"
    phone = "+525512345678"
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "${SERVICE_URL}/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"

# Login
$loginBody = @{
  email = "test@example.com"
  password = "Test1234!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "${SERVICE_URL}/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

# Guardar token
$token = $response.data.tokens.accessToken

# Obtener perfil
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "${SERVICE_URL}/api/v1/auth/profile" -Headers $headers
```

---

## 💸 Paso 12: Optimizar Costos

### 12.1 Estrategias de Ahorro

```yaml
# Escalar a cero cuando no hay tráfico
min-instances: 0  # ✅ Gratis cuando nadie usa la app

# Usar menos memoria
memory: 512Mi     # Suficiente para Node.js

# CPU compartida (más barato)
cpu: 1            # No usar --cpu-boost

# Timeout razonable
timeout: 60s      # No 300s si no es necesario

# Concurrency alta
concurrency: 80   # Múltiples requests por instancia
```

### 12.2 Monitorear Costos

```
GCP Console → Billing → Reports

Filtros:
- Service: Cloud Run
- Time range: Last 30 days
- Group by: SKU
```

**Free Tier incluye**:
- 2 millones de requests/mes
- 360,000 GB-segundos de memoria/mes
- 180,000 vCPU-segundos/mes

---

## 🐛 Solución de Problemas Comunes

### Error: "Container failed to start"

**Causa**: Port incorrecto o app no inicia

**Solución**:
```powershell
# Verificar logs
gcloud run services logs tail $SERVICE_NAME --region=$REGION

# Verificar que el backend escucha en el puerto 5000
# y que NODE_ENV=production está configurado
```

---

### Error: "Service account does not have permission"

**Causa**: Faltan permisos IAM

**Solución**:
```powershell
# Verificar roles
gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --filter="bindings.members:serviceAccount"

# Añadir rol faltante
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:SA_EMAIL" --role="roles/ROLE_NAME"
```

---

### Error: "Failed to pull image"

**Causa**: Imagen no existe en GCR

**Solución**:
```powershell
# Listar imágenes en GCR
gcloud container images list --repository=gcr.io/$PROJECT_ID

# Verificar tags
gcloud container images list-tags gcr.io/$PROJECT_ID/$SERVICE_NAME

# Re-push si es necesario
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest
```

---

### Error: "MongoDB connection timeout"

**Causa**: IP de Cloud Run no está en whitelist de Atlas

**Solución**:
```
MongoDB Atlas → Network Access
→ Add 0.0.0.0/0 (temporal)
→ O configurar Cloud NAT con IP estática (producción)
```

---

## 📚 Comandos Útiles de Referencia

```powershell
# Ver servicios en Cloud Run
gcloud run services list --region=$REGION

# Describir servicio específico
gcloud run services describe $SERVICE_NAME --region=$REGION

# Ver revisiones
gcloud run revisions list --service=$SERVICE_NAME --region=$REGION

# Revertir a revisión anterior
gcloud run services update-traffic $SERVICE_NAME --to-revisions=REVISION_NAME=100 --region=$REGION

# Ver secretos
gcloud secrets list

# Ver versiones de un secret
gcloud secrets versions list SECRET_NAME

# Actualizar secret
echo -n "nuevo_valor" | gcloud secrets versions add SECRET_NAME --data-file=-

# Eliminar servicio
gcloud run services delete $SERVICE_NAME --region=$REGION

# Ver cuota de uso
gcloud compute project-info describe --project=$PROJECT_ID
```

---

## 🎯 Checklist de Verificación Final

Antes de considerar el deploy completo, verifica:

### Configuración
- [ ] Proyecto GCP creado
- [ ] APIs habilitadas (Cloud Run, Build, Registry)
- [ ] gcloud CLI instalado y autenticado
- [ ] Service account con permisos correctos

### Secrets
- [ ] JWT_SECRET creado en Secret Manager
- [ ] JWT_REFRESH_SECRET creado
- [ ] MONGODB_URI creado (con Atlas connection string)
- [ ] Service account tiene acceso a secrets

### MongoDB Atlas
- [ ] Cluster creado en Google Cloud (M0 Free)
- [ ] Usuario de base de datos creado
- [ ] Network Access configurado (0.0.0.0/0 o IP estática)
- [ ] Connection string probado localmente

### Deployment
- [ ] Imagen Docker builds correctamente
- [ ] Imagen pusheada a GCR
- [ ] Cloud Run service desplegado
- [ ] Health check responde correctamente
- [ ] Endpoints de autenticación funcionan

### CI/CD
- [ ] GitHub Secrets configurados
- [ ] Workflow file actualizado
- [ ] Push a main dispara deployment automático
- [ ] Tests pasan en CI

### Monitoreo
- [ ] Logs visibles en GCP Console
- [ ] Métricas configuradas
- [ ] Alertas opcionales creadas

---

## 🚀 Próximos Pasos

Una vez completado el setup de GCP:

1. ✅ Deploy del frontend a Firebase Hosting o Cloud Storage
2. ✅ Configurar dominio personalizado
3. ✅ Implementar endpoints de donaciones
4. ✅ Conectar frontend con backend en GCP
5. ✅ Comenzar recolección de datos para ML

---

## 📞 Recursos Adicionales

- **Documentación Cloud Run**: [https://cloud.google.com/run/docs](https://cloud.google.com/run/docs)
- **Pricing Calculator**: [https://cloud.google.com/products/calculator](https://cloud.google.com/products/calculator)
- **gcloud CLI Reference**: [https://cloud.google.com/sdk/gcloud/reference](https://cloud.google.com/sdk/gcloud/reference)
- **Secret Manager**: [https://cloud.google.com/secret-manager/docs](https://cloud.google.com/secret-manager/docs)
- **Comunidad GCP**: [https://www.googlecloudcommunity.com/](https://www.googlecloudcommunity.com/)

---

**Última actualización**: 4 de marzo de 2026  
**Mantenido por**: EcoResource Connect Team  
**Ventaja vs AWS**: 76% más económico 💰
