import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Middleware de autenticación
 * Verifica que el usuario tenga un token JWT válido
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = verifyToken(token);

    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Verificar que la cuenta no esté bloqueada
    if (user.isLocked) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_LOCKED
      });
    }

    // Adjuntar usuario al objeto request
    req.user = user;
    next();

  } catch (error) {
    if (error.message === ERROR_MESSAGES.TOKEN_EXPIRED) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_EXPIRED
      });
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN
    });
  }
};

/**
 * Middleware de autorización por roles
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param {...string} allowedRoles - Roles permitidos para acceder a la ruta
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * Intenta autenticar pero no falla si no hay token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }
  
  next();
};

export default { authenticate, authorize, optionalAuth };
