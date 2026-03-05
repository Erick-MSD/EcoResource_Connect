import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Conectar a MongoDB solo si no estamos en modo test
// (en tests usamos MongoDB Memory Server)
if (process.env.NODE_ENV !== 'test') {
  connectDatabase();
}

// Seguridad: Helmet - Protege contra vulnerabilidades comunes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting - Prevenir ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitización de datos - Prevenir inyección NoSQL
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  Intento de inyección NoSQL detectado: ${key}`);
  }
}));

// Compresión de respuestas
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rutas API
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor solo si no estamos en modo test
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en modo ${process.env.NODE_ENV} en puerto ${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api/${API_VERSION}`);
  });

  // Manejo de errores no capturados
  process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
  });
}

export default app;
