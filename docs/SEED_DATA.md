# 🌱 Guía de Datos Ficticios (Seed Data)

**Script para poblar MongoDB con datos de prueba**

---

## 📋 ¿Qué hace el script?

El script `seedData.js` crea automáticamente:

### 👥 10 Usuarios ficticios:
- **4 Donantes** (Restaurante, Supermercado, Panadería, Hotel)
- **3 ONGs** (Fundaciones benéficas)
- **2 Conductores** (Transporte de alimentos)
- **1 Administrador** (Acceso completo al sistema)

### 🍲 6 Donaciones ficticias:
- **4 Disponibles** (listas para recoger)
- **1 Reservada** (ya asignada a una ONG)
- **1 Completada** (entregada exitosamente)

### 📍 Ubicaciones reales:
- Todas las ubicaciones están en **Ciudad de México**
- Coordenadas GPS reales (Polanco, Roma, Condesa, Centro, etc.)
- Listas para probar búsquedas geoespaciales

---

## 🚀 Cómo usar el script

### Opción 1: Con npm script (recomendado)

```powershell
cd backend
pnpm run seed
```

### Opción 2: Ejecutar directamente

```powershell
cd backend
node scripts/seedData.js
```

---

## ⚙️ Requisitos previos

1. ✅ Tener MongoDB Atlas configurado
2. ✅ Archivo `.env` con `MONGODB_URI` correcto
3. ✅ Dependencias instaladas (`pnpm install`)

---

## 📝 Resultado esperado

```
🌱 Iniciando seed de base de datos...

✅ Conectado a MongoDB Atlas
🗑️  Limpiando colecciones existentes...
✅ Colecciones limpiadas

👥 Creando usuarios ficticios...
✅ 10 usuarios creados:
   - 4 Donantes
   - 3 ONGs
   - 2 Conductores
   - 1 Administradores

🍲 Creando donaciones ficticias...
✅ 6 donaciones creadas:
   - 4 Disponibles
   - 1 Reservadas
   - 1 Completadas

════════════════════════════════════════════════════════════════════════════════
🔑 CREDENCIALES DE PRUEBA CREADAS
════════════════════════════════════════════════════════════════════════════════

📧 DONANTES:
   Email: restaurant.lasdelicias@mail.com | Password: SecurePass123!
   Email: super.walmart@mail.com | Password: SecurePass123!
   Email: panaderia.dulcevida@mail.com | Password: SecurePass123!
   Email: hotel.granplaza@mail.com | Password: SecurePass123!

🏢 ONGs:
   Email: ong.alimentaesperanza@mail.com | Password: SecurePass123!
   Email: ong.bancodecomida@mail.com | Password: SecurePass123!
   Email: ong.caritas@mail.com | Password: SecurePass123!

🚚 CONDUCTORES:
   Email: driver.juan.perez@mail.com | Password: SecurePass123!
   Email: driver.maria.garcia@mail.com | Password: SecurePass123!

👨‍💼 ADMINISTRADOR:
   Email: admin@ecoresource-connect.com | Password: AdminSecure2026!

════════════════════════════════════════════════════════════════════════════════
✅ Seed completado exitosamente!
════════════════════════════════════════════════════════════════════════════════

💡 Puedes usar estas credenciales para probar la API

🔌 Conexión cerrada
```

---

## 🔑 Credenciales de Prueba

### 📧 Todos los Donantes
**Password**: `SecurePass123!`

| Email | Tipo | Ubicación |
|-------|------|-----------|
| restaurant.lasdelicias@mail.com | Restaurante | Av. Reforma, Centro CDMX |
| super.walmart@mail.com | Supermercado | Polanco, CDMX |
| panaderia.dulcevida@mail.com | Panadería | Roma Norte, CDMX |
| hotel.granplaza@mail.com | Hotel | Paseo de la Reforma, CDMX |

### 🏢 Todas las ONGs
**Password**: `SecurePass123!`

| Email | Organización | Beneficiarios |
|-------|--------------|---------------|
| ong.alimentaesperanza@mail.com | Fundación Alimenta Esperanza | 500 |
| ong.bancodecomida@mail.com | Banco de Alimentos de México | 1,200 |
| ong.caritas@mail.com | Cáritas de la Arquidiócesis | 800 |

### 🚚 Todos los Conductores
**Password**: `SecurePass123!`

| Email | Nombre | Vehículo | Capacidad |
|-------|--------|----------|-----------|
| driver.juan.perez@mail.com | Juan Pérez López | Camioneta (ABC-123-D) | 50kg |
| driver.maria.garcia@mail.com | María García | Motocicleta (XYZ-987-M) | 20kg |

### 👨‍💼 Administrador
| Email | Password |
|-------|----------|
| admin@ecoresource-connect.com | AdminSecure2026! |

---

## 🍲 Donaciones Creadas

### Disponibles (4)

#### 1. 50 Panes dulces del día
- **Donante**: Panadería Dulce Vida
- **Categoría**: Pan
- **Peso**: 5kg
- **Perecibilidad**: Alta (vence mañana)
- **Ubicación**: Roma Norte, CDMX

#### 2. Verduras frescas de temporada
- **Donante**: Walmart Polanco
- **Categoría**: Verduras
- **Peso**: 30kg
- **Perecibilidad**: Media (vence en 3 días)
- **Ubicación**: Polanco, CDMX

#### 3. Comida preparada del buffet
- **Donante**: Hotel Gran Plaza
- **Categoría**: Comida preparada
- **Peso**: 10kg (15-20 porciones)
- **Perecibilidad**: Alta (vence hoy)
- **Ubicación**: Paseo de la Reforma, CDMX

#### 4. Platos del menú del día - Comida italiana
- **Donante**: Restaurante Las Delicias
- **Categoría**: Comida preparada
- **Peso**: 12kg (25 porciones)
- **Perecibilidad**: Alta (vence en 8 horas)
- **Ubicación**: Av. Reforma, Centro CDMX

### Reservada (1)

#### 5. Productos lácteos próximos a vencer
- **Donante**: Walmart Polanco
- **Categoría**: Lácteos
- **Peso**: 20kg (40 productos)
- **Estado**: RESERVADA (ya asignada)

### Completada (1)

#### 6. Frutas variadas del mercado
- **Donante**: Walmart Polanco
- **Categoría**: Frutas
- **Peso**: 50kg
- **Estado**: COMPLETADA (entregada ayer)

---

## 🧪 Pruebas con los datos

### 1. Registro ya no funciona (usuarios ya existen)

❌ **NO HACER** (ya están creados):
```powershell
# Esto dará error 400 "Email already registered"
$body = @{
  email = "restaurant.lasdelicias@mail.com"
  password = "SecurePass123!"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### 2. Login con usuarios existentes

✅ **Login como Donante**:
```powershell
$loginBody = @{
  email = "restaurant.lasdelicias@mail.com"
  password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

# Guardar token
$TOKEN = $response.token
Write-Host "Token guardado: $TOKEN"
```

✅ **Login como ONG**:
```powershell
$loginBody = @{
  email = "ong.alimentaesperanza@mail.com"
  password = "SecurePass123!"
} | ConvertTo-Json

$ongResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$ONG_TOKEN = $ongResponse.token
```

✅ **Login como Administrador**:
```powershell
$adminBody = @{
  email = "admin@ecoresource-connect.com"
  password = "AdminSecure2026!"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method Post -Body $adminBody -ContentType "application/json"
$ADMIN_TOKEN = $adminResponse.token
```

### 3. Ver perfil del usuario

```powershell
# Obtener perfil (requiere token)
$headers = @{
  "Authorization" = "Bearer $TOKEN"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/profile" -Headers $headers
```

### 4. Logout

```powershell
$headers = @{
  "Authorization" = "Bearer $TOKEN"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/logout" -Method Post -Headers $headers
```

---

## 🔄 Re-ejecutar el Script

El script **limpia todas las colecciones** antes de insertar datos nuevos:

```javascript
await User.deleteMany({});      // Borra usuarios
await Donation.deleteMany({});  // Borra donaciones
```

**Puedes ejecutarlo cuantas veces quieras**:
```powershell
pnpm run seed  # Limpia todo y crea datos nuevos
```

---

## 🗃️ Estructura de Datos

### Modelo de Usuario (User)

```javascript
{
  email: String,           // Único
  password: String,        // Hasheado con bcrypt
  role: String,            // 'donor', 'ngo', 'driver', 'admin'
  profile: {
    name: String,
    phone: String,
    address: String
  },
  location: {
    type: 'Point',
    coordinates: [long, lat]  // [x, y]
  },
  roleData: {
    // Específico según rol
    // Donor: businessType, businessName, rfc
    // NGO: organizationName, beneficiaries
    // Driver: vehicleType, capacity
  },
  isVerified: Boolean,
  createdAt: Date
}
```

### Modelo de Donación (Donation)

```javascript
{
  title: String,
  description: String,
  donor: ObjectId,         // Referencia a User
  foodCategory: String,    // 'fruits', 'vegetables', 'dairy', etc.
  quantity: String,
  estimatedWeight: Number, // kg
  perishability: String,   // 'low', 'medium', 'high'
  expirationDate: Date,
  pickupLocation: {
    type: 'Point',
    coordinates: [long, lat],
    address: String
  },
  pickupTimeStart: Date,
  pickupTimeEnd: Date,
  status: String,          // 'available', 'reserved', 'completed', 'cancelled'
  images: [String],
  tags: [String],
  createdAt: Date
}
```

---

## 📊 Consultas Útiles en MongoDB Compass

Si tienes [MongoDB Compass](https://www.mongodb.com/products/compass) instalado:

### Ver todos los usuarios por rol
```json
{ "role": "donor" }
{ "role": "ngo" }
{ "role": "driver" }
```

### Ver donaciones disponibles
```json
{ "status": "available" }
```

### Donaciones que vencen pronto
```json
{
  "expirationDate": {
    "$lt": { "$date": "2026-03-06T00:00:00Z" }
  }
}
```

### Buscar por ubicación (cercanas a un punto)
```json
{
  "location": {
    "$near": {
      "$geometry": {
        "type": "Point",
        "coordinates": [-99.1677, 19.4326]
      },
      "$maxDistance": 5000  // 5km
    }
  }
}
```

---

## ⚠️ Notas Importantes

1. **Passwords hasheadas**: Todos los passwords están hasheados con bcrypt (12 rounds)
2. **Emails únicos**: No puedes registrar emails que ya existen
3. **Coordenadas GPS**: Todas son ubicaciones reales en CDMX
4. **Fechas dinámicas**: Las fechas de expiración/pickup se calculan relativamente (hoy + X horas)
5. **Limpia antes de insertar**: El script borra todo lo anterior

---

## 🐛 Solución de Problemas

### Error: "ECONNREFUSED"
```
❌ Error: connect ECONNREFUSED
```

**Solución**: MongoDB no está conectado. Verifica:
1. `.env` tiene `MONGODB_URI` correcto
2. Password en la URI está codificado (`%21` no `!`)
3. MongoDB Atlas permite tu IP (`0.0.0.0/0` para desarrollo)

### Error: "Email already registered"

**Esto es normal**: Los usuarios ya existen en la BD.

**Solución**: Re-ejecuta el seed para limpiar:
```powershell
pnpm run seed  # Limpia y recrea todo
```

### Error: "Cannot find module"

**Solución**: Instalar dependencias:
```powershell
cd backend
pnpm install
```

---

## 📁 Archivos Relacionados

| Archivo | Descripción |
|---------|-------------|
| `backend/scripts/seedData.js` | Script de seed |
| `backend/src/models/User.js` | Modelo de usuarios |
| `backend/src/models/Donation.js` | Modelo de donaciones |
| `backend/src/config/constants.js` | Constantes (roles, categorías) |
| `.env` | Variables de entorno (MONGODB_URI) |

---

## ✅ Checklist

Antes de ejecutar el seed:

- [ ] MongoDB Atlas configurado
- [ ] `.env` tiene `MONGODB_URI` con password codificado
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Servidor NO está corriendo (o está en otra terminal)
- [ ] Conexión a internet activa

Después del seed:

- [ ] 10 usuarios creados
- [ ] 6 donaciones creadas
- [ ] Credenciales anotadas
- [ ] Puedes hacer login con cualquier usuario
- [ ] Tokens funcionan correctamente

---

## 🎯 Próximos Pasos

1. **Ejecutar el seed**: `pnpm run seed`
2. **Iniciar servidor**: `pnpm run dev`
3. **Probar login**: Con cualquiera de las credenciales
4. **Ver datos en Compass**: Opcional, para visualizar
5. **Implementar endpoints de donaciones**: Ver TODO list

---

**Última actualización**: 4 de marzo de 2026  
**Datos totales**: 10 usuarios + 6 donaciones  
**Ubicaciones**: Ciudad de México, México
