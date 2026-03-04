import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  refreshAccessToken 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
  body('role')
    .isIn(Object.values(USER_ROLES))
    .withMessage('Rol inválido'),
  body('profile.firstName')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('profile.lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es obligatorio'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Las coordenadas deben ser un array de [longitud, latitud]')
    .optional(),
  validate
], register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
  validate
], login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refrescar access token
 * @access  Public
 */
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token requerido'),
  validate
], refreshAccessToken);

export default router;
