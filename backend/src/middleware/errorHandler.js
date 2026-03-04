import { HTTP_STATUS } from '../config/constants.js';

/**
 * Middleware global de manejo de errores
 * Captura y formatea todos los errores de la aplicación
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de Mongoose - Validación
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  // Error de Mongoose - Duplicado (clave única)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: `El ${field} ya está registrado`
    });
  }

  // Error de Mongoose - CastError (ID inválido)
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'ID inválido'
    });
  }

  // Error JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }

  // Error genérico
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
