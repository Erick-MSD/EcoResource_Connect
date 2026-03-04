# 🌱 EcoResource Connect

> **Plataforma para conectar excedentes de alimentos de restaurantes y supermercados con ONGs, mitigando el desperdicio alimentario**

[![CI/CD Status](https://github.com/YOUR_ORG/ecoresource-connect/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/YOUR_ORG/ecoresource-connect/actions)
[![SonarQube Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=ecoresource-connect&metric=alert_status)](https://sonarcloud.io/dashboard?id=ecoresource-connect)
[![Coverage](https://codecov.io/gh/YOUR_ORG/ecoresource-connect/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_ORG/ecoresource-connect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📑 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [🏗️ Arquitectura](#️-arquitectura)
- [✨ Características](#-características)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [📖 Documentación](#-documentación)
- [🧪 Testing](#-testing)
- [🔒 Seguridad](#-seguridad)
- [📊 Análisis Predictivo](#-análisis-predictivo)
- [🤝 Contribuir](#-contribuir)

---

## 🎯 Descripción

**EcoResource Connect** es una plataforma MERN (MongoDB, Express.js, React, Node.js) diseñada para combatir el desperdicio alimentario conectando en tiempo real:

- 🏪 **Donantes**: Restaurantes, supermercados, hoteles con excedentes de comida
- 🏢 **ONGs**: Organizaciones que distribuyen alimentos a comunidades vulnerables
- 🚚 **Conductores**: Transportistas que recogen y entregan donaciones
- 👨‍💼 **Administradores**: Gestión y supervisión de la plataforma

### 💡 Problema que resuelve

Cada año se desperdician **931 millones de toneladas** de alimentos globalmente (ONU, 2021), mientras millones de personas sufren inseguridad alimentaria. EcoResource Connect digitaliza y optimiza el proceso de donación de alimentos perecederos.

---

## 🏗️ Arquitectura

### Stack Tecnológico

#### Backend
- **Node.js 18+** con Express.js
- **MongoDB 6.0** con consultas geoespaciales nativas
- **JWT** para autenticación (access + refresh tokens)
- **Docker** para containerización
- **AWS Fargate** para despliegue serverless

#### Frontend
- **React 18** con Vite
- **TailwindCSS** para UI
- **React Query** para state management
- **Leaflet** para mapas interactivos

#### DevOps & QA
- **GitHub Actions** para CI/CD
- **Jest** para testing unitario (85% cobertura)
- **SonarQube** para análisis de calidad (Rating A)
- **OWASP ZAP** para seguridad
- **PNPM** como gestor de paquetes

### Diagrama de Arquitectura

```
┌─────────────┐      HTTPS/TLS 1.3      ┌──────────────────┐
│   Cliente   │ ◄─────────────────────► │   AWS ALB        │
│ React + PWA │                          │ (Load Balancer)  │
└─────────────┘                          └────────┬─────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────┐
                 ▼                                ▼                 ▼
          ┌──────────────┐              ┌──────────────┐   ┌──────────────┐
          │   Fargate    │              │   Fargate    │   │   Fargate    │
          │  Container 1 │              │  Container 2 │   │  Container N │
          │   (Backend)  │              │   (Backend)  │   │   (Backend)  │
          └──────┬───────┘              └──────┬───────┘   └──────┬───────┘
                 │                             │                   │
                 └─────────────────┬───────────┴───────────────────┘
                                   ▼
                          ┌──────────────────┐
                          │   MongoDB Atlas  │
                          │  Primary + 2 Rep │
                          │  (Geospatial DB) │
                          └──────────────────┘
```

---

## ✨ Características

### 🔐 Autenticación y Seguridad
- ✅ JWT con tokens de corta duración (15 min)
- ✅ Refresh tokens con rotación automática
- ✅ Protección contra fuerza bruta (max 5 intentos)
- ✅ Sanitización NoSQL injection
- ✅ Rate limiting (100 req/15min por IP)
- ✅ Headers de seguridad (Helmet.js)
- ✅ HTTPS obligatorio (TLS 1.3)

### 🗺️ Geolocalización Inteligente
- ✅ Búsqueda de donaciones por radio (MongoDB `$nearSphere`)
- ✅ Cálculo automático de distancias
- ✅ Optimización de rutas (próximamente con OR-Tools)

### 📦 Gestión de Donaciones
- ✅ Categorización por tipo de alimento
- ✅ Niveles de perecibilidad (inmediato, mismo día, largo plazo)
- ✅ TTL automático para documentos (90 días)
- ✅ Reserva en tiempo real

### 📊 Dashboard Predictivo (Roadmap)
- 🔜 Modelo LSTM para predecir picos de donaciones
- 🔜 Análisis de patrones temporales
- 🔜 Alertas proactivas para conductores

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **PNPM** 8+ (`npm install -g pnpm`)
- **MongoDB** 6.0+ o MongoDB Atlas
- **Docker** (opcional, para containerización)

### Instalación Local

#### 1. Clonar repositorio

```bash
git clone https://github.com/YOUR_ORG/ecoresource-connect.git
cd ecoresource-connect
```

#### 2. Configurar Backend

```bash
cd backend
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
# MONGODB_URI=mongodb://localhost:27017/ecoresource_connect
# JWT_SECRET=tu-secreto-super-seguro
```

#### 3. Iniciar Backend

```bash
# Desarrollo
pnpm run dev

# Producción
pnpm start
```

El servidor estará en `http://localhost:5000`

#### 4. Configurar Frontend

```bash
cd ../frontend
pnpm install

# Iniciar desarrollo
pnpm run dev
```

El frontend estará en `http://localhost:3000`

### 🐳 Con Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose down
```

**Servicios disponibles**:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- MongoDB: `localhost:27017`
- SonarQube: `http://localhost:9000` (perfil dev)

---

## 📖 Documentación

### 📋 Documentación del Proyecto

- **[Fase 1: Implementación y Seguridad](docs/FASE_1_IMPLEMENTACION_SEGURIDAD.md)**
  - Desarrollo del módulo de autenticación
  - Implementación de JWT y roles
  - Pruebas unitarias con Jest
  - Pipeline CI/CD

- **[Fase 2: Pruebas y Calidad](docs/FASE_2_PRUEBAS_CALIDAD.md)**
  - Análisis de seguridad con OWASP ZAP
  - Vulnerabilidades NoSQL específicas
  - SonarQube y métricas de calidad
  - Configuración TLS 1.3

- **[Fase 3: Cierre y Evaluación](docs/FASE_3_CIERRE_EVALUACION.md)**
  - Planificado vs Ejecutado
  - Lecciones aprendidas
  - Plan de mejora continua
  - **Propuesta de análisis predictivo con IA**

### 🔗 API Endpoints

**Autenticación** (`/api/v1/auth`)

| Method | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| POST | `/logout` | Cerrar sesión | Sí |
| GET | `/profile` | Obtener perfil | Sí |
| POST | `/refresh` | Refrescar token | No |

**Donaciones** (`/api/v1/donations`) - Próximamente

---

## 🧪 Testing

### Ejecutar tests

```bash
cd backend

# Todos los tests
pnpm test

# Con cobertura
pnpm test -- --coverage

# Modo watch
pnpm test:watch
```

### Cobertura actual

```
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.23 |    78.45 |   88.12 |   85.67 |
 controllers/       |   92.14 |    85.32 |   95.00 |   93.21 |
 models/            |   88.76 |    76.54 |   91.23 |   89.45 |
 middleware/        |   82.45 |    74.21 |   80.67 |   83.12 |
 utils/             |   76.89 |    70.12 |   75.34 |   77.56 |
```

**Meta**: Mantener > 80% en todas las categorías ✅

### Tests de seguridad

```bash
# OWASP ZAP (requiere Docker)
docker-compose --profile security up zap

# Ver reporte
open security-reports/zap_report.html
```

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas

✅ **Autenticación**
- JWT con firma HMAC-SHA256
- Tokens de corta duración (15 min)
- Refresh tokens con rotación

✅ **Protección de datos**
- Hash de contraseñas con bcrypt (12 rounds)
- Sanitización de inputs con express-validator
- Prevención de NoSQL injection

✅ **Headers de seguridad**
```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

✅ **Rate Limiting**
- 100 peticiones / 15 minutos por IP
- Bloqueo de cuenta tras 5 intentos fallidos

### Vulnerabilidades Conocidas

🟢 **0 vulnerabilidades críticas**  
🟡 **0 vulnerabilidades altas**  
🔵 **2 vulnerabilidades medias** (sin impacto de seguridad)

---

## 📊 Análisis Predictivo

### 🤖 Modelo de Machine Learning (Roadmap)

**Objetivo**: Predecir picos de donaciones para optimizar logística

**Tecnologías**:
- TensorFlow / Keras (LSTM)
- Python FastAPI para inferencias
- MongoDB Time Series Collections

**Features del modelo**:
- Día de la semana
- Hora del día
- Zona geográfica
- Historial de 30 días
- Condiciones climáticas

**Beneficios esperados**:
- 📈 +80% donaciones recogidas
- ⏱️ -73% tiempo de respuesta
- 🌱 -40% emisiones CO2

Ver [Fase 3 - Sección 3](docs/FASE_3_CIERRE_EVALUACION.md#3️⃣-plan-de-mejora-continua) para detalles completos.

---

## 🤝 Contribuir

¡Contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar un PR.

### Flujo de trabajo

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit tus cambios: `git commit -m 'feat: agregar nueva característica'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

### Commits Semánticos

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva característica
fix: corrección de bug
docs: cambios en documentación
test: agregar o modificar tests
refactor: refactorización de código
chore: tareas de mantenimiento
```

---

## 📜 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo

**EcoResource Connect Team**
- Arquitectura y Backend
- Frontend y UX/UI
- DevOps y Cloud
- Data Science y ML

---

## 🙏 Agradecimientos

- [MongoDB](https://www.mongodb.com/) por consultas geoespaciales nativas
- [OWASP](https://owasp.org/) por herramientas de seguridad
- [SonarQube](https://www.sonarqube.org/) por análisis de código
- [GitHub Actions](https://github.com/features/actions) por CI/CD gratuito

---

## 📞 Contacto

- **Website**: https://ecoresource-connect.com
- **Email**: contact@ecoresource-connect.com
- **Twitter**: [@EcoResourceApp](https://twitter.com/EcoResourceApp)

---

<p align="center">
  <b>Hecho con ❤️ para combatir el desperdicio alimentario</b>
</p>

<p align="center">
  🌱 <i>Cada donación cuenta. Cada byte cuenta.</i> 🌱
</p>