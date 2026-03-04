import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../config/constants.js';

/**
 * Genera un token JWT de acceso
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token JWT firmado
 */
export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRE || '15m';

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: 'ecoresource-connect',
    audience: 'ecoresource-api'
  });
};

/**
 * Genera un token JWT de refresco (refresh token)
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token JWT de refresco
 */
export const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d';

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: 'ecoresource-connect',
    audience: 'ecoresource-api'
  });
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido o expiró
 */
export const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    
    return jwt.verify(token, secret, {
      issuer: 'ecoresource-connect',
      audience: 'ecoresource-api'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }
    throw error;
  }
};

/**
 * Decodifica un token sin verificar (útil para debugging)
 * @param {string} token - Token a decodificar
 * @returns {Object} Payload decodificado
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};
