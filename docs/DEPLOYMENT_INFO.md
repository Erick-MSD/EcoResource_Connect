# 🚀 INFORMACIÓN DE DESPLIEGUE - GOOGLE CLOUD RUN

## ✅ ESTADO ACTUAL: DESPLEGADO Y FUNCIONANDO

**Fecha de despliegue:** 5 de marzo de 2026  
**Versión:** v1.0.0  
**Región:** us-central1 (Iowa, USA)

---

## 🌐 URLs DEL SERVICIO

### **URL Principal (Backend API)**
```
https://ecoresource-backend-1028586104605.us-central1.run.app
```

### **Health Check**
```
https://ecoresource-backend-1028586104605.us-central1.run.app/health
```
**Respuesta esperada:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2026-03-05T05:40:17.949Z",
  "environment": "production"
}
```

### **Endpoints API Disponibles**

Base URL: `https://ecoresource-backend-1028586104605.us-central1.run.app/api`

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

#### Usuarios
- `GET /api/users/profile` - Perfil del usuario (requiere auth)
- `PUT /api/users/profile` - Actualizar perfil (requiere auth)

---

## 🗝️ SECRETOS EN GCP SECRET MANAGER

Los siguientes secretos están configurados en **GCP Secret Manager** (NO en variables de entorno):

| Secret Name | Versión | Descripción |
|------------|---------|-------------|
| `JWT_SECRET` | latest | Secret para tokens JWT |
| `JWT_REFRESH_SECRET` | latest | Secret para refresh tokens |
| `MONGODB_URI` | latest | URI de conexión a MongoDB Atlas |

### ⚠️ Importante sobre MONGODB_URI
El password en GCP Secret Manager **DEBE** usar codificación URL:
- ❌ Incorrecto: `Ec0R3s0urc3_2026!SecureDB`
- ✅ Correcto: `Ec0R3s0urc3_2026%21SecureDB` (! → %21)

### Ver secretos (solo metadatos, NO valores)
```powershell
gcloud secrets list --project=ecoresource-connect
```

### Acceder a un secret (requiere permisos)
```powershell
gcloud secrets versions access latest --secret="JWT_SECRET" --project=ecoresource-connect
```

---

## 🐳 IMAGEN DOCKER EN GCR

**Registro:** Google Container Registry  
**Repository:** `gcr.io/ecoresource-connect/ecoresource-backend`

### Tags disponibles
- `gcr.io/ecoresource-connect/ecoresource-backend:latest`
- `gcr.io/ecoresource-connect/ecoresource-backend:v1.0.0`

### Ver imágenes en GCR
```powershell
gcloud container images list --repository=gcr.io/ecoresource-connect
```

### Ver detalles de una imagen
```powershell
gcloud container images describe gcr.io/ecoresource-connect/ecoresource-backend:latest
```

### Consola web GCR
https://console.cloud.google.com/gcr/images/ecoresource-connect

---

## ⚙️ CONFIGURACIÓN DE CLOUD RUN

| Parámetro | Valor |
|-----------|-------|
| **Región** | us-central1 |
| **Plataforma** | managed (serverless) |
| **Autenticación** | allow-unauthenticated |
| **Puerto** | 5000 |
| **CPU** | 1 vCPU |
| **Memoria** | 512 Mi |
| **Min instances** | 0 (scale to zero) |
| **Max instances** | 10 |
| **Timeout** | 300 segundos (default) |

### Service Account
```
1028586104605-compute@developer.gserviceaccount.com
```
**Roles asignados:**
- `roles/secretmanager.secretAccessor` (para acceder a secrets)

---

## 📊 COMANDOS ÚTILES DE GESTIÓN

### Ver logs del servicio
```powershell
gcloud run services logs read ecoresource-backend --region=us-central1 --project=ecoresource-connect --limit=50
```

### Ver detalles del servicio
```powershell
gcloud run services describe ecoresource-backend --region=us-central1 --project=ecoresource-connect
```

### Ver revisiones (versiones desplegadas)
```powershell
gcloud run revisions list --service=ecoresource-backend --region=us-central1 --project=ecoresource-connect
```

### Ver tráfico distribuido
```powershell
gcloud run services describe ecoresource-backend --region=us-central1 --project=ecoresource-connect --format="value(status.traffic)"
```

### Actualizar servicio (nuevo deploy)
```powershell
gcloud run deploy ecoresource-backend `
  --image=gcr.io/ecoresource-connect/ecoresource-backend:latest `
  --region=us-central1 `
  --project=ecoresource-connect
```

### Escalar manualmente
```powershell
# Cambiar min/max instances
gcloud run services update ecoresource-backend `
  --min-instances=1 `
  --max-instances=20 `
  --region=us-central1 `
  --project=ecoresource-connect
```

### Pausar servicio (scale to zero forzado)
```powershell
gcloud run services update ecoresource-backend --max-instances=0 --region=us-central1 --project=ecoresource-connect
```

---

## 🔄 WORKFLOW DE ACTUALIZACIÓN

Cuando necesites actualizar el backend:

### 1. Hacer cambios en el código
```powershell
cd d:\Documents\GitHub\EcoResource_Connect\backend
# Edita archivos...
```

### 2. Rebuild imagen Docker
```powershell
$IMAGE_NAME = "gcr.io/ecoresource-connect/ecoresource-backend"

# Build con nuevo tag (ejemplo: v1.0.1)
docker build -t "${IMAGE_NAME}:v1.0.1" -t "${IMAGE_NAME}:latest" .
```

### 3. Push a GCR
```powershell
docker push "${IMAGE_NAME}:v1.0.1"
docker push "${IMAGE_NAME}:latest"
```

### 4. Deploy automático (usa :latest)
```powershell
gcloud run deploy ecoresource-backend `
  --image="${IMAGE_NAME}:latest" `
  --region=us-central1 `
  --project=ecoresource-connect
```

**Nota:** Si usas `:latest`, Cloud Run **NO** redeploya automáticamente. Debes especificar un tag único (v1.0.1, v1.0.2, etc.) o forzar el deploy.

---

## 💰 MONITOREO DE COSTOS

### Ver facturación en GCP Console
https://console.cloud.google.com/billing

### Recursos que generan costo

1. **Cloud Run**
   - Cobro por: CPU-segundos, memoria-segundos, requests
   - Free tier: 2 millones de requests/mes, 360k GB-segundos RAM
   - Scale to zero = $0 cuando no hay tráfico

2. **Container Registry**
   - Cobro por: almacenamiento de imágenes (GB/mes)
   - Free tier: primeros 0.5 GB gratis
   - Costo aprox: ~$0.026 por GB/mes

3. **Secret Manager**
   - 6 versiones activas: $0.06/mes por versión = ~$0.36/mes
   - Accesos: $0.03 por 10,000 accesos

4. **MongoDB Atlas** (fuera de GCP)
   - Free tier: 512 MB storage
   - Actualmente: **$0/mes** (usando cluster gratis)

### Estimación mensual
- **Tráfico bajo** (< 100 requests/día): ~$1-2/mes
- **Tráfico medio** (1000 requests/día): ~$5-10/mes
- **Tráfico alto** (10k requests/día): ~$20-40/mes

---

## 🧪 TESTING DEL BACKEND DESPLEGADO

### PowerShell
```powershell
$BASE_URL = "https://ecoresource-backend-1028586104605.us-central1.run.app"

# Health check
Invoke-RestMethod -Uri "$BASE_URL/health" -Method GET

# Register nuevo usuario
$body = @{
    email = "test@example.com"
    password = "Test123456!"
    firstName = "Test"
    lastName = "User"
    role = "DONOR"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### cURL (Git Bash / WSL)
```bash
# Health check
curl https://ecoresource-backend-1028586104605.us-central1.run.app/health

# Register
curl -X POST https://ecoresource-backend-1028586104605.us-central1.run.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "firstName": "Test",
    "lastName": "User",
    "role": "DONOR"
  }'
```

---

## 🔐 USUARIOS DE PRUEBA

Los siguientes usuarios están disponibles en la base de datos MongoDB para testing:

### Donadores
| Email | Password | Tipo |
|-------|----------|------|
| restaurant.lasdelicias@mail.com | SecurePass123! | Restaurante |
| super.walmart@mail.com | SecurePass123! | Supermercado |

### ONGs
| Email | Password |
|-------|----------|
| contacto@bancodealimentos.org | SecurePass123! |
| ayuda@cruzverde.org | SecurePass123! |

### Transportistas
| Email | Password |
|-------|----------|
| juan.perez.driver@mail.com | SecurePass123! |
| maria.garcia.driver@mail.com | SecurePass123! |

### Administrador
| Email | Password |
|-------|----------|
| admin@ecoresource.com | AdminSecure2026! |

---

## 📍 INFORMACIÓN DEL PROYECTO GCP

| Campo | Valor |
|-------|-------|
| **Project ID** | ecoresource-connect |
| **Project Number** | 1028586104605 |
| **Cuenta GCP** | al07004500@tecmilenio.mx |
| **Región principal** | us-central1 |

### Consola GCP
- **Cloud Run**: https://console.cloud.google.com/run?project=ecoresource-connect
- **Container Registry**: https://console.cloud.google.com/gcr/images/ecoresource-connect
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=ecoresource-connect
- **Logs**: https://console.cloud.google.com/logs/query?project=ecoresource-connect

---

## 🛠️ TROUBLESHOOTING

### Servicio no responde (timeout)
```powershell
# Ver logs recientes
gcloud run services logs read ecoresource-backend --region=us-central1 --limit=100

# Verificar que el contenedor esté healthy
gcloud run services describe ecoresource-backend --region=us-central1
```

### Error "Permission denied on secret"
```powershell
# Verificar roles del service account
gcloud projects get-iam-policy ecoresource-connect `
  --flatten="bindings[].members" `
  --filter="bindings.members:1028586104605-compute@developer.gserviceaccount.com"

# Re-asignar permisos
gcloud projects add-iam-policy-binding ecoresource-connect `
  --member="serviceAccount:1028586104605-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

### MongoDB connection failed
```powershell
# 1. Verificar que el secret MONGODB_URI esté correcto
gcloud secrets versions access latest --secret="MONGODB_URI" --project=ecoresource-connect

# 2. Verificar whitelist en MongoDB Atlas
# Ir a: https://cloud.mongodb.com/v2/your_cluster/security/network
# Asegurarse de tener "0.0.0.0/0" (permitir todas las IPs) para Cloud Run
```

### Build falla
```powershell
# Ver logs detallados del último build
gcloud builds list --limit=5 --project=ecoresource-connect

# Si hay problemas con pnpm lockfile:
cd d:\Documents\GitHub\EcoResource_Connect\backend
pnpm install
Copy-Item "..\pnpm-lock.yaml" "pnpm-lock.yaml"
```

---

## 📝 NOTAS IMPORTANTES

1. **Scale to Zero**: El servicio se apaga automáticamente si no recibe tráfico por ~15 minutos. El primer request después de inactividad toma ~5-10 segundos (cold start).

2. **CORS**: El backend tiene CORS configurado para permitir cualquier origen en desarrollo. En producción deberías restringirlo al dominio de tu frontend.

3. **MongoDB Atlas Whitelist**: Debes tener `0.0.0.0/0` en el Network Access de MongoDB Atlas para que Cloud Run pueda conectarse (las IPs de Cloud Run cambian dinámicamente).

4. **Secrets Updates**: Si actualizas un secret en GCP Secret Manager, debes hacer **redeploy del servicio** para que tome la nueva versión.

5. **Backups**: MongoDB Atlas hace backups automáticos cada 24h en el free tier. Para backups más frecuentes, necesitas un plan pago.

---

## 🎯 PRÓXIMOS PASOS

### Frontend Deployment
1. Configurar build de React/Vue
2. Deploy a Firebase Hosting o Vercel
3. Actualizar URL del backend en frontend (cambiar localhost:5000 por la URL de Cloud Run)
4. Configurar CORS específico para el dominio del frontend

### Producción
1. **Dominio personalizado**: Configurar Cloud Run con dominio propio
2. **CI/CD**: GitHub Actions para deploy automático
3. **Monitoring**: Cloud Monitoring + alertas
4. **Rate Limiting**: Ajustar límites de requests según carga

### Seguridad
1. **HTTPS**: Ya configurado por Cloud Run ✅
2. **Secrets rotation**: Cambiar secrets cada 90 días
3. **Security scanning**: Cloud Security Scanner
4. **Audit logs**: Activar Cloud Audit Logs

---

## 📞 CONTACTO Y SOPORTE

- **GCP Support**: https://console.cloud.google.com/support
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **MongoDB Atlas Support**: https://support.mongodb.com/

---

**Última actualización:** 5 de marzo de 2026 00:40 UTC  
**Revisión:** ecoresource-backend-00002-8lx
