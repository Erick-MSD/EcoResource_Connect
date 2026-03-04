import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from '../config/constants.js';

/**
 * Controlador de registro de usuarios
 * POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, role, profile, location, roleData } = req.body;

    // Verificar que el email no exista
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.USER_EXISTS
      });
    }

    // Validar rol
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    // Crear usuario
    const user = new User({
      email,
      password,
      role,
      profile,
      location,
      roleData
    });

    await user.save();

    // Generar tokens
    const accessToken = generateAccessToken({ 
      userId: user._id, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ 
      userId: user._id 
    });

    // Guardar refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Controlador de inicio de sesión
 * POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario (incluir password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Verificar si la cuenta está bloqueada
    if (user.isLocked) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_LOCKED
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      await user.incrementLoginAttempts();

      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Login exitoso - resetear intentos
    await user.resetLoginAttempts();

    // Generar tokens
    const accessToken = generateAccessToken({ 
      userId: user._id, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ 
      userId: user._id 
    });

    // Actualizar refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Controlador de cierre de sesión
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const user = req.user;

    // Eliminar refresh token
    user.refreshToken = undefined;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener perfil del usuario autenticado
 * GET /api/v1/auth/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para refrescar el access token
 * POST /api/v1/auth/refresh
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar refresh token
    const decoded = verifyToken(refreshToken);

    // Buscar usuario
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN
      });
    }

    // Generar nuevo access token
    const newAccessToken = generateAccessToken({ 
      userId: user._id, 
      role: user.role 
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  getProfile,
  refreshAccessToken
};
