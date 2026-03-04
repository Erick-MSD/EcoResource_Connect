require('dotenv').config();
const crypto = require('crypto');

console.log('\n🔐 Generador de Secrets para EcoResource Connect\n');
console.log('═'.repeat(60));

// Generar JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ JWT_SECRET (para access tokens):');
console.log(jwtSecret);

// Generar JWT_REFRESH_SECRET
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ JWT_REFRESH_SECRET (para refresh tokens):');
console.log(jwtRefreshSecret);

// Generar ejemplo de MONGODB_URI
console.log('\n📊 MONGODB_URI (reemplaza con tus valores de Atlas):');
console.log('mongodb+srv://ecoresource_admin:TU_PASSWORD@cluster.xxxxx.mongodb.net/ecoresource_db?retryWrites=true&w=majority');

console.log('\n═'.repeat(60));
console.log('\n📝 Copia estos valores a tu archivo backend/.env');
console.log('⚠️  NUNCA compartas estos secrets públicamente\n');

// Crear archivo .env.example si no existe
const fs = require('fs');
const path = require('path');

const envExample = `# MongoDB Atlas
MONGODB_URI=mongodb+srv://ecoresource_admin:TU_PASSWORD@cluster.xxxxx.mongodb.net/ecoresource_db?retryWrites=true&w=majority

# JWT Secrets (usa el generador: node scripts/generateSecrets.js)
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=5000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging (opcional)
LOG_LEVEL=info
`;

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

// Solo crear .env si no existe
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envExample);
  console.log('✅ Archivo .env creado en backend/.env');
  console.log('⚠️  Por favor, actualiza MONGODB_URI con tu connection string de Atlas\n');
} else {
  console.log('ℹ️  Archivo .env ya existe. Actualízalo manualmente con los secrets generados.\n');
}

// Actualizar .env.example
fs.writeFileSync(envExamplePath, envExample.replace(jwtSecret, 'your_jwt_secret_here').replace(jwtRefreshSecret, 'your_jwt_refresh_secret_here'));
console.log('✅ Archivo .env.example actualizado\n');
