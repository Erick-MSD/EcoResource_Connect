# 📱 Deploy Frontend a GitHub Pages

Esta guía muestra cómo desplegar el frontend de EcoResource Connect en **GitHub Pages** de forma gratuita.

---

## 🎯 Resultado Final

Tu frontend estará disponible en:
```
https://TU_USUARIO.github.io/EcoResource_Connect/
```

Ejemplo: `https://johndoe.github.io/EcoResource_Connect/`

---

## ✅ Requisitos Previos

- ✅ Backend ya desplegado en Google Cloud Run
- ✅ Repositorio en GitHub
- ✅ Workflow de GitHub Actions configurado (ya está en `.github/workflows/deploy-frontend.yml`)

---

## 🚀 Paso 1: Habilitar GitHub Pages

### 1.1 Configurar en GitHub

1. Ve a tu repositorio: `https://github.com/TU_USUARIO/EcoResource_Connect`
2. Click en **Settings** (Configuración)
3. En el menú lateral, busca **Pages**
4. En **Source**, selecciona:
   - **Source:** `GitHub Actions` ✅ (NO "Deploy from a branch")
5. Click en **Save**

**Captura esperada:**
```
┌─────────────────────────────────────┐
│ GitHub Pages                        │
├─────────────────────────────────────┤
│ Source: GitHub Actions         [✓]  │
│                                     │
│ Your site is ready to be published │
└─────────────────────────────────────┘
```

---

## 🔧 Paso 2: Configurar Variables de Entorno

### 2.1 Crear archivo de entorno local

```powershell
cd frontend

# Copiar ejemplo
Copy-Item .env.example .env.local

# Editar con tus valores
code .env.local
```

### 2.2 Configurar valores

**Para desarrollo local (.env.local):**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=EcoResource Connect
VITE_APP_ENV=development
VITE_BASE_PATH=/
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG=true
```

**Para producción (GitHub Actions - ya configurado en workflow):**
```env
VITE_API_URL=https://ecoresource-backend-1028586104605.us-central1.run.app
VITE_APP_NAME=EcoResource Connect
VITE_APP_ENV=production
VITE_BASE_PATH=/EcoResource_Connect/
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG=false
```

---

## 📋 Paso 3: Verificar Base Path

El `base` path es importante para GitHub Pages.

### Opción A: Username Pages (Recomendado)

Si tu URL es `TU_USUARIO.github.io/EcoResource_Connect/`:

✅ **Ya está configurado** en el workflow con:
```yaml
env:
  VITE_BASE_PATH: /EcoResource_Connect/
```

### Opción B: Dominio Personalizado

Si usarás un dominio propio (ej: `app.ecoresource.com`):

1. Cambiar en `.github/workflows/deploy-frontend.yml`:
```yaml
env:
  VITE_BASE_PATH: /  # ← Cambiar a /
```

2. Configurar CNAME en GitHub:
```
Settings → Pages → Custom domain → app.ecoresource.com
```

---

## 🚀 Paso 4: Deploy Manual (Primera Vez)

### 4.1 Commit y Push

```powershell
# En la raíz del proyecto
git add .
git commit -m "feat: configure GitHub Pages deployment"
git push origin main
```

### 4.2 Monitorear Deploy

1. Ve a **Actions** en GitHub
2. Busca el workflow **"🚀 Deploy Frontend to GitHub Pages"**
3. Espera que termine (~2-3 minutos)

**Logs esperados:**
```
📥 Checkout repository          ✓
📦 Setup PNPM                    ✓
🟢 Setup Node.js                 ✓
📥 Install dependencies          ✓
🔨 Build production bundle       ✓
📄 Setup Pages                   ✓
📦 Upload artifact               ✓
🚀 Deploy to GitHub Pages        ✓
```

---

## ✅ Paso 5: Verificar Deployment

### 5.1 Obtener URL

```
GitHub → Settings → Pages
```

Verás algo como:
```
✅ Your site is live at https://TU_USUARIO.github.io/EcoResource_Connect/
```

### 5.2 Probar la Aplicación

```powershell
# Abrir en navegador
Start-Process "https://TU_USUARIO.github.io/EcoResource_Connect/"

# O usar curl para verificar
curl https://TU_USUARIO.github.io/EcoResource_Connect/
```

---

## 🔄 Deploy Automático

Una vez configurado, cada push que modifique archivos del frontend se desplegará automáticamente.

### Ejemplo de Workflow Automático

```powershell
# 1. Hacer cambios en el frontend
cd frontend/src
# Editar archivos...

# 2. Commit
git add .
git commit -m "feat: actualizar UI del dashboard"

# 3. Push
git push origin main

# ✅ GitHub Actions detectará el cambio en frontend/**
# ✅ Ejecutará el workflow automáticamente
# ✅ Deploy nuevo en ~2-3 minutos
```

---

## 🎨 Paso 6: Configurar Base URL en la App

Asegúrate de que tu frontend use la variable de entorno correcta.

### En src/config/api.js (o similar):

```javascript
// ❌ MAL (hardcodeado)
const API_URL = 'http://localhost:5000'

// ✅ BIEN (usa variable de entorno)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### En src/router/index.jsx (o similar):

```javascript
import { BrowserRouter } from 'react-router-dom'

// ✅ Usar basename para GitHub Pages
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* tus rutas */}
    </BrowserRouter>
  )
}
```

---

## 🐛 Troubleshooting

### Error: "404 Not Found" al refrescar página

**Causa:** GitHub Pages no soporta SPA routing por defecto

**Solución:** Añadir `404.html` que redirija a `index.html`

```powershell
# Crear archivo en frontend/public/404.html
```

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>EcoResource Connect</title>
  <script>
    // Redirect to index.html with path as query parameter
    var segmentCount = 1; // Ajusta según tu base path
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + segmentCount).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(segmentCount).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body>
</body>
</html>
```

---

### Error: "CSS/JS files 404"

**Causa:** Base path incorrecto

**Solución:**
1. Verificar que `VITE_BASE_PATH` en el workflow coincida con tu repo name
2. Si tu repo es `EcoResource_Connect`, debe ser `/EcoResource_Connect/`
3. Si cambias el nombre del repo, actualiza el workflow

---

### Error: "API calls failing (CORS)"

**Causa:** Backend no permite el dominio de GitHub Pages

**Solución:**

```powershell
# Actualizar CORS_ORIGIN en Cloud Run
gcloud run services update ecoresource-backend \
  --set-env-vars="CORS_ORIGIN=https://TU_USUARIO.github.io" \
  --region=us-central1 \
  --project=ecoresource-connect
```

O actualizar backend para permitir múltiples orígenes:

```javascript
// backend/src/app.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://TU_USUARIO.github.io'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS not allowed'))
    }
  }
}))
```

---

### Workflow falla en "Build production bundle"

**Causa:** Error en el código o dependencias faltantes

**Solución:**
1. Probar build localmente:
```powershell
cd frontend
pnpm install
pnpm build
```
2. Ver error específico en logs de GitHub Actions
3. Corregir error y hacer push de nuevo

---

## 📊 Monitoreo y Analytics

### Verificar Tráfico en GitHub

```
Repositorio → Insights → Traffic
```

Verás:
- Visitors (visitantes únicos)
- Views (páginas vistas)
- Clones (descargas del repo)

### Agregar Google Analytics (Opcional)

1. Crear cuenta en [Google Analytics](https://analytics.google.com/)
2. Obtener Measurement ID (ej: `G-XXXXXXXXXX`)
3. Actualizar workflow:

```yaml
env:
  VITE_ENABLE_ANALYTICS: "true"
  VITE_GA_MEASUREMENT_ID: "G-XXXXXXXXXX"
```

4. Agregar en `frontend/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 💰 Costos

**GitHub Pages es 100% GRATIS** con las siguientes limitaciones:

| Límite | Valor |
|--------|-------|
| **Storage** | 1 GB |
| **Bandwidth** | 100 GB/mes |
| **Builds** | 10 builds/hora |

Para tu proyecto:
- Frontend build: ~5-10 MB
- Bandwidth: Suficiente para ~10,000 usuarios/mes
- ✅ **Costo total: $0/mes**

---

## 🚀 Alternativas a GitHub Pages

Si necesitas más features, considera:

| Servicio | Costo | Ventajas |
|----------|-------|----------|
| **GitHub Pages** | Gratis | Integrado, simple |
| **Vercel** | Gratis | Analytics, Edge Functions |
| **Netlify** | Gratis | Forms, Lambdas |
| **Firebase Hosting** | Gratis | CDN global, integración GCP |
| **Cloudflare Pages** | Gratis | CDN ultra-rápido |

---

## ✅ Checklist de Verificación

Antes de considerar el deploy completo:

### Configuración
- [ ] GitHub Pages habilitado en Settings
- [ ] Source configurado como "GitHub Actions"
- [ ] Workflow de deploy creado
- [ ] Variables de entorno configuradas

### Build
- [ ] `pnpm build` funciona localmente
- [ ] No hay errores de TypeScript/ESLint
- [ ] Base path configurado correctamente
- [ ] API URL apunta al backend de GCP

### Deployment
- [ ] Primer deploy manual exitoso
- [ ] URL de GitHub Pages accesible
- [ ] Aplicación carga correctamente
- [ ] Rutas funcionan (no 404)
- [ ] API calls funcionan (CORS OK)

### Automatización
- [ ] Push a `main` dispara deploy automático
- [ ] Workflow completa sin errores
- [ ] Cambios se reflejan en ~2-3 minutos

---

## 🎯 Próximos Pasos

Una vez desplegado el frontend:

1. ✅ Conectar frontend con backend de GCP
2. ✅ Probar flujo completo (registro, login, donaciones)
3. ✅ Configurar dominio personalizado (opcional)
4. ✅ Agregar analytics
5. ✅ Optimizar performance (Lighthouse)

---

## 📞 Recursos

- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **Vite Docs**: https://vitejs.dev/guide/
- **React Router**: https://reactrouter.com/en/main
- **GitHub Actions**: https://docs.github.com/en/actions

---

**Última actualización:** 5 de marzo de 2026  
**Autor:** EcoResource Connect Team
