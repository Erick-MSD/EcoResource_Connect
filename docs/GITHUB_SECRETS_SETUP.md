# 🔐 Configuración de GitHub Secrets para CI/CD

Esta guía te muestra cómo configurar los **GitHub Secrets** necesarios para que los workflows de GitHub Actions funcionen correctamente.

---

## 📍 Acceso a GitHub Secrets

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/EcoResource_Connect`
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**

---

## 🔑 Secrets Necesarios (6 en total)

### 1️⃣ GCP_PROJECT_ID

**Valor:** Tu Project ID de Google Cloud

```
ecoresource-connect
```

**Cómo obtenerlo:**
```powershell
gcloud config get-value project
```

---

### 2️⃣ GCP_SA_KEY

**Valor:** JSON completo del Service Account Key

**Cómo crearlo:**

```powershell
# 1. Crear service account para GitHub Actions
gcloud iam service-accounts create github-actions `
  --display-name="GitHub Actions Deploy" `
  --project=ecoresource-connect

# 2. Obtener email del service account
$SA_EMAIL = "github-actions@ecoresource-connect.iam.gserviceaccount.com"

# 3. Dar permisos necesarios
gcloud projects add-iam-policy-binding ecoresource-connect `
  --member="serviceAccount:${SA_EMAIL}" `
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ecoresource-connect `
  --member="serviceAccount:${SA_EMAIL}" `
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding ecoresource-connect `
  --member="serviceAccount:${SA_EMAIL}" `
  --role="roles/iam.serviceAccountUser"

# 4. Crear JSON key
gcloud iam service-accounts keys create github-actions-key.json `
  --iam-account=$SA_EMAIL `
  --project=ecoresource-connect

# 5. Ver contenido del JSON
Get-Content github-actions-key.json | Out-String
```

**Copiar TODO el contenido del JSON** (debe verse así):

```json
{
  "type": "service_account",
  "project_id": "ecoresource-connect",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions@ecoresource-connect.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

⚠️ **IMPORTANTE:** 
- Copia TODO el JSON completo
- NO compartas este archivo con nadie
- Elimina el archivo local después: `Remove-Item github-actions-key.json -Force`

---

### 3️⃣ MONGODB_URI

**Valor:** Connection string de MongoDB Atlas

```
mongodb+srv://ecoresource_admin:Ec0R3s0urc3_2026%21SecureDB@ecoresource-cluster.olny8dm.mongodb.net/ecoresource_db?retryWrites=true&w=majority&appName=ecoresource-cluster
```

**Dónde encontrarlo:**
1. MongoDB Atlas → Clusters
2. Click en **Connect** → **Connect your application**
3. Copiar el connection string
4. ⚠️ Usa `%21` en lugar de `!` en el password

---

### 4️⃣ JWT_SECRET

**Valor:** Ya lo tienes generado

```
553c6070a385d8dc46efbf9ae91a2d64149f8eaf0cc2bb8b1c803ed5f90ca102
```

**Dónde encontrarlo:**
```powershell
# Leer desde .env local
Select-String -Path "backend\.env" -Pattern "JWT_SECRET="
```

---

### 5️⃣ JWT_REFRESH_SECRET

**Valor:** Ya lo tienes generado

```
a5acbef91e89909c2d51cb82d69f2c069957cac880ed4c9c2e6a1b7a5450d16c
```

**Dónde encontrarlo:**
```powershell
# Leer desde .env local
Select-String -Path "backend\.env" -Pattern "JWT_REFRESH_SECRET="
```

---

### 6️⃣ SONAR_TOKEN (Opcional)

**Solo si usas SonarQube para análisis de código**

**Cómo obtenerlo:**
1. Ve a SonarCloud: https://sonarcloud.io/
2. Login con GitHub
3. My Account → Security → Generate Token
4. Copiar token generado

**Si NO usas SonarQube:** No necesitas este secret y puedes comentar el job en `.github/workflows/ci-cd.yml`

---

## 📋 Resumen de Secrets

| Secret Name | Tipo | Ejemplo |
|-------------|------|---------|
| `GCP_PROJECT_ID` | String | `ecoresource-connect` |
| `GCP_SA_KEY` | JSON | `{"type":"service_account",...}` |
| `MONGODB_URI` | String | `mongodb+srv://user:pass@...` |
| `JWT_SECRET` | String | `553c6070a385d8...` (64 chars) |
| `JWT_REFRESH_SECRET` | String | `a5acbef91e89...` (64 chars) |
| `SONAR_TOKEN` | String | `squ_abc123...` (opcional) |

---

## ✅ Verificación de Secrets

Una vez configurados todos los secrets, verifica que aparezcan en:

```
GitHub → Settings → Secrets and variables → Actions
```

Deberías ver:
- ✅ GCP_PROJECT_ID
- ✅ GCP_SA_KEY
- ✅ MONGODB_URI
- ✅ JWT_SECRET
- ✅ JWT_REFRESH_SECRET
- ⚠️ SONAR_TOKEN (opcional)

---

## 🚀 Probar el CI/CD

### Deploy Manual (primera vez)

1. Ve a **Actions** en GitHub
2. Click en el workflow **"Deploy Backend to Google Cloud Run"**
3. Click en **"Run workflow"** → **"Run workflow"**
4. Espera que termine (~3-5 minutos)

### Deploy Automático

**Backend:**
```bash
git add backend/
git commit -m "feat: actualizar backend"
git push origin main
```
→ Se desplegará automáticamente a Cloud Run

**Frontend:**
```bash
git add frontend/
git commit -m "feat: actualizar frontend"
git push origin main
```
→ Se desplegará automáticamente a GitHub Pages

---

## 🔒 Seguridad

### ⚠️ Nunca Hagas Esto:
- ❌ Subir archivos `.json` de service accounts al repositorio
- ❌ Poner secrets en código (hardcodear)
- ❌ Compartir secrets en Slack, Discord, etc.
- ❌ Usar secrets de producción en desarrollo local

### ✅ Buenas Prácticas:
- ✅ Usa GitHub Secrets para CI/CD
- ✅ Usa GCP Secret Manager para Cloud Run
- ✅ Usa `.env` local para desarrollo (NO subirlo a Git)
- ✅ Rota secrets cada 90 días
- ✅ Usa service accounts con permisos mínimos necesarios

---

## 🐛 Troubleshooting

### Error: "Invalid Service Account Key"

**Causa:** JSON del service account incorrecto o incompleto

**Solución:**
1. Verificar que copiaste TODO el JSON (desde `{` hasta `}`)
2. No debe tener espacios extras al inicio/final
3. Regenerar key si es necesario

---

### Error: "Permission denied"

**Causa:** Service account no tiene permisos suficientes

**Solución:**
```powershell
# Verificar permisos actuales
gcloud projects get-iam-policy ecoresource-connect `
  --flatten="bindings[].members" `
  --filter="bindings.members:github-actions@"

# Añadir roles necesarios (ver paso 2 arriba)
```

---

### Error: "MongoDB connection failed"

**Causa:** MONGODB_URI incorrecto o IP no permitida

**Solución:**
1. Verificar que el URI tiene `%21` en lugar de `!`
2. MongoDB Atlas → Network Access → Permitir `0.0.0.0/0`

---

### Workflow no se ejecuta automáticamente

**Causa:** Paths incorrectos en el trigger

**Solución:**
```yaml
# En deploy-backend.yml, verifica:
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'  # ✅ Debe coincidir con tu estructura
```

---

## 📊 Monitoreo de Deployments

### Ver logs del deployment

```
GitHub → Actions → Selecciona workflow → Click en run específico
```

### Ver logs de Cloud Run

```powershell
gcloud run services logs tail ecoresource-backend --region=us-central1
```

### Verificar que el deploy funcionó

```powershell
# Backend
curl https://ecoresource-backend-1028586104605.us-central1.run.app/health

# Frontend (cuando esté configurado)
curl https://TU_USUARIO.github.io/EcoResource_Connect/
```

---

## 🎯 Próximos Pasos

Una vez configurados todos los secrets:

1. ✅ Push a `main` para activar el primer deploy automático
2. ✅ Verificar que el workflow se ejecuta correctamente
3. ✅ Revisar logs en GitHub Actions
4. ✅ Confirmar que el backend responde
5. ✅ Configurar GitHub Pages para el frontend

---

## 📞 Recursos

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **GCP Service Accounts**: https://cloud.google.com/iam/docs/service-accounts
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

**Última actualización:** 5 de marzo de 2026  
**Autor:** EcoResource Connect Team
