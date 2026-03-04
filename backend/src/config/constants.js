/**
 * Constantes de la aplicación
 * Definición centralizada de roles, estados y configuraciones
 */

export const USER_ROLES = {
  DONOR: 'donor',           // Restaurantes y Supermercados
  NGO: 'ngo',              // Organizaciones No Gubernamentales
  DRIVER: 'driver',        // Conductores de reparto
  ADMIN: 'admin'           // Administradores del sistema
};

export const DONATION_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

export const FOOD_CATEGORIES = {
  FRESH_PRODUCE: 'fresh_produce',
  DAIRY: 'dairy',
  MEAT: 'meat',
  BAKERY: 'bakery',
  CANNED: 'canned',
  PREPARED_MEALS: 'prepared_meals',
  BEVERAGES: 'beverages',
  OTHER: 'other'
};

export const PERISHABILITY = {
  IMMEDIATE: 'immediate',    // < 4 horas
  SAME_DAY: 'same_day',      // < 24 horas
  SHORT_TERM: 'short_term',  // 1-3 días
  MEDIUM_TERM: 'medium_term', // 4-7 días
  LONG_TERM: 'long_term'     // > 7 días
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_EXISTS: 'El usuario ya existe',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  TOKEN_EXPIRED: 'Token expirado',
  INVALID_TOKEN: 'Token inválido',
  SERVER_ERROR: 'Error interno del servidor',
  VALIDATION_ERROR: 'Error de validación',
  ACCOUNT_LOCKED: 'Cuenta bloqueada por múltiples intentos fallidos'
};

export const GEOSPATIAL_CONFIG = {
  DEFAULT_RADIUS_KM: 10,
  MAX_RADIUS_KM: 50,
  EARTH_RADIUS_KM: 6378.1
};

// TTL para documentos de historial (90 días)
export const HISTORY_TTL_DAYS = 90;

export default {
  USER_ROLES,
  DONATION_STATUS,
  FOOD_CATEGORIES,
  PERISHABILITY,
  HTTP_STATUS,
  ERROR_MESSAGES,
  GEOSPATIAL_CONFIG,
  HISTORY_TTL_DAYS
};
