import { validationResult } from 'express-validator';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Middleware de validación
 * Verifica los resultados de express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

export default validate;
