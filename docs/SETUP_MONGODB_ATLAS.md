# 🗄️ Configuración de MongoDB Atlas

Esta guía te ayudará a crear y configurar tu base de datos MongoDB Atlas para EcoResource Connect.

---

## ✅ Paso 1: Crear Cuenta en MongoDB Atlas

1. Ve a [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Crea una cuenta gratuita (puedes usar tu cuenta de Google)
3. Completa el registro

---

## 🌐 Paso 2: Crear un Cluster (FREE TIER)

### Opción Visual

1. **Click en "Build a Database"**
2. **Selecciona "M0 Free"** (gratuito para siempre)
3. **Configura el cluster**:
   ```
   Cloud Provider: Google Cloud
   Region: us-central1 (Iowa) - Más cercana a América
   Cluster Name: ecoresource-cluster
   ```
4. Click en **"Create"**

### Características del Free Tier

```yaml
Storage: 512 MB
RAM: Shared
Backup: Manual snapshots
Cost: $0 / mes ✅
```

---

## 🔒 Paso 3: Configurar Seguridad

### 3.1 Crear Usuario de Base de Datos

1. Ve a **Security → Database Access**
2. Click en **"Add New Database User"**
3. **Configuración**:
   ```
   Authentication Method: Password
   
   Username: ecoresource_admin
   Password: [Genera uno fuerte] 
   Ejemplo: Ec0R3s0urc3_2026!SecureDB
   
   Database User Privileges: 
   ✅ Read and write to any database
   ```
4. Click en **"Add User"**

### 3.2 Configurar Acceso de Red

1. Ve a **Security → Network Access**
2. Click en **"Add IP Address"**
3. **Para desarrollo local**:
   ```
   Access List Entry: 0.0.0.0/0
   Comment: Allow all IPs (development only)
   ```
   ⚠️ **IMPORTANTE**: En producción, restringe a las IPs de Google Cloud

4. **Para producción (Google Cloud Run)**:
   - Click en **"Add IP Address"**
   - Usa las IPs de salida de Cloud Run (veremos más adelante)

---

## 🔗 Paso 4: Obtener la Connection String

1. Ve a tu cluster principal
2. Click en **"Connect"**
3. Selecciona **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 5.5 or later
6. **Copia la Connection String**:

```bash
mongodb+srv://ecoresource_admin:<password>@ecoresource-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=ecoresource-cluster
```

### 4.1 Reemplazar Valores

Ejemplo de connection string completa:

```env
# ❌ INCORRECTO (con <password>)
mongodb+srv://ecoresource_admin:<password>@ecoresource-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

# ✅ CORRECTO (password reemplazado)
mongodb+srv://ecoresource_admin:Ec0R3s0urc3_2026!SecureDB@ecoresource-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
```

⚠️ **Caracteres especiales**: Si tu password tiene caracteres especiales, codifícalos:

| Carácter | Codificado |
|----------|------------|
| @ | %40 |
| : | %3A |
| / | %2F |
| ? | %3F |
| # | %23 |
| ! | %21 |

---

## 📝 Paso 5: Actualizar Variables de Entorno

### 5.1 Archivo `backend/.env`

Crea o edita el archivo:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://ecoresource_admin:Ec0R3s0urc3_2026!SecureDB@ecoresource-cluster.abc123.mongodb.net/ecoresource_db?retryWrites=true&w=majority

# Nota: Añade el nombre de la base de datos (/ecoresource_db)
```

### 5.2 Verificar Conexión

Desde la terminal:

```powershell
# Ir al backend
cd backend

# Instalar dependencias si no lo hiciste
pnpm install

# Test rápido de conexión
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'TU_CONNECTION_STRING_AQUI').then(() => { console.log('✅ MongoDB Atlas conectado!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

Si ves `✅ MongoDB Atlas conectado!`, todo está correcto.

---

## 🏗️ Paso 6: Crear Índices Geoespaciales

### Opción 1: Automático (al iniciar el servidor)

Los modelos de Mongoose crearán los índices automáticamente:

```powershell
pnpm run dev
```

Verás en la consola:

```
✅ MongoDB connected: ecoresource-cluster.abc123.mongodb.net
ℹ️ Creating indexes...
✅ 2dsphere index created on Donation.pickupLocation
```

### Opción 2: Manual (MongoDB Compass)

1. Descarga [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Conecta usando tu connection string
3. Ve a la base de datos `ecoresource_db`
4. Colección `donations` → pestaña **Indexes**
5. Click en **"Create Index"**:

```json
{
  "pickupLocation": "2dsphere"
}
```

---

## 🧪 Paso 7: Verificar con Datos de Prueba

### Script de Prueba

Crea `backend/scripts/testAtlas.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa!');

    // Probar escritura
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await TestModel.create({ name: 'test' });
    console.log('✅ Escritura exitosa!');

    // Probar lectura
    const doc = await TestModel.findOne({ name: 'test' });
    console.log('✅ Lectura exitosa:', doc);

    // Limpiar
    await TestModel.deleteMany({});
    console.log('✅ Limpieza exitosa!');

    await mongoose.disconnect();
    console.log('✅ Desconexión limpia!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
```

**Ejecutar**:

```powershell
node backend/scripts/testAtlas.js
```

---

## 🐛 Solución de Problemas Comunes

### Error: "MongoNetworkError: connection timed out"

**Causa**: Tu IP no está en la whitelist

**Solución**:
1. Ve a **Network Access** en Atlas
2. Añade tu IP actual: [https://www.whatismyip.com/](https://www.whatismyip.com/)
3. O temporalmente añade `0.0.0.0/0` para desarrollo

---

### Error: "Authentication failed"

**Causa**: Usuario o password incorrectos

**Solución**:
1. Verifica el usuario en **Database Access**
2. Si no recuerdas el password, edita el usuario y genera uno nuevo
3. Actualiza el `.env` con el nuevo password
4. Recuerda codificar caracteres especiales

---

### Error: "Server selection timeout"

**Causa**: Connection string mal formada

**Solución**:
```env
# ❌ Falta el nombre de la base de datos
mongodb+srv://user:pass@cluster.mongodb.net/

# ✅ Con nombre de base de datos
mongodb+srv://user:pass@cluster.mongodb.net/ecoresource_db
```

---

### Error: "ENOTFOUND" o DNS error

**Causa**: Problema de red o DNS

**Solución**:
```powershell
# Verificar conectividad
ping ecoresource-cluster.abc123.mongodb.net

# Cambiar servidor DNS (si es necesario)
# Usar Google DNS: 8.8.8.8 y 8.8.4.4
```

---

## 📊 Paso 8: Monitoreo y Métricas

### Dashboard de Atlas

1. Ve a tu cluster en Atlas
2. Pestaña **"Metrics"**:
   - Conexiones activas
   - Operaciones/segundo
   - Latencia de red

### Configurar Alertas (Opcional)

1. Ve a **Alerts** en el menú lateral
2. Crea alerta personalizada:
   ```
   Trigger: Connections > 100
   Action: Email notification
   ```

---

## 🔄 Migración desde Base de Datos Local

Si ya tenías datos en MongoDB local:

### Exportar desde Local

```powershell
# Exportar colección users
mongodump --db ecoresource_db --collection users --out ./backup

# Exportar colección donations
mongodump --db ecoresource_db --collection donations --out ./backup
```

### Importar a Atlas

```powershell
# Importar usando tu connection string de Atlas
mongorestore --uri="mongodb+srv://ecoresource_admin:PASSWORD@cluster.mongodb.net/ecoresource_db" ./backup/ecoresource_db
```

---

## 💰 Costos y Límites del Free Tier

### ¿Qué está incluido GRATIS? ✅

```yaml
Storage: 512 MB (suficiente para ~10,000 donaciones)
RAM: Shared
Connections: 500 simultáneas
Backup: Manual snapshots
Uptime: 99.9% SLA
Cost: $0 / mes
```

### ¿Cuándo actualizar a M10? ($0.08/hora)

- **Storage > 512 MB**: Si superas 10,000 donaciones activas
- **Performance**: Si tienes >50 requests/segundo
- **Backups automáticos**: Si necesitas point-in-time recovery

**Costo estimado M10**: ~$57/mes

---

## 🔐 Mejores Prácticas de Seguridad

### ✅ Hacer

1. **Passwords fuertes**: Mínimo 16 caracteres
2. **Restringir IPs**: Solo permitir IPs de producción
3. **Roles mínimos**: Usuario de app solo read/write, no admin
4. **Rotar credentials**: Cambiar password cada 90 días
5. **Auditoría**: Revisar Access Logs mensualmente

### ❌ NO Hacer

1. ❌ Usar password genérico (ej: "password123")
2. ❌ Whitelist 0.0.0.0/0 en producción
3. ❌ Compartir connection string en repos públicos
4. ❌ Usar usuario root para la aplicación
5. ❌ Exponer connection string en logs

---

## 🚀 Siguiente Paso

Una vez configurado MongoDB Atlas:

1. ✅ Actualiza `backend/.env` con tu connection string
2. ✅ Ejecuta `pnpm run dev` para verificar conexión
3. ✅ Ejecuta `pnpm test` para correr los tests
4. ✅ Continúa con la configuración de Google Cloud (ver [SETUP_GOOGLE_CLOUD.md](SETUP_GOOGLE_CLOUD.md))

---

## 📞 Recursos Adicionales

- **Documentación oficial**: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- **Connection strings**: [https://docs.mongodb.com/manual/reference/connection-string/](https://docs.mongodb.com/manual/reference/connection-string/)
- **Geospatial queries**: [https://docs.mongodb.com/manual/geospatial-queries/](https://docs.mongodb.com/manual/geospatial-queries/)
- **Soporte Atlas**: [https://support.mongodb.com/](https://support.mongodb.com/)

---

**Última actualización**: 4 de marzo de 2026  
**Mantenido por**: EcoResource Connect Team
