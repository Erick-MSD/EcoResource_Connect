import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // No incluir contraseña en queries por defecto
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    required: [true, 'El rol es obligatorio']
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true
    },
    phone: {
      type: String,
      match: [/^[\d\s\-\+\(\)]+$/, 'Número de teléfono inválido']
    },
    organization: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'México'
      }
    }
  },
  // Geolocalización para cálculos de radio
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitud, latitud]
      index: '2dsphere' // Índice geoespacial para consultas $nearSphere
    }
  },
  // Información específica según el rol
  roleData: {
    // Para DONOR
    businessType: {
      type: String,
      enum: ['restaurant', 'supermarket', 'hotel', 'catering', 'other']
    },
    businessLicense: String,
    
    // Para NGO
    registrationNumber: String,
    certifications: [String],
    
    // Para DRIVER
    licenseNumber: String,
    vehicleType: String,
    vehiclePlate: String
  },
  // Seguridad
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  refreshToken: String
}, {
  timestamps: true
});

// Índices para optimización de consultas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual para verificar si la cuenta está bloqueada
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Middleware: Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) return next();

  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, rounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Método: Comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// Método: Incrementar intentos de login fallidos
userSchema.methods.incrementLoginAttempts = async function() {
  const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 horas en milisegundos

  // Si el bloqueo expiró, resetear intentos
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  // Incrementar intentos
  const updates = { $inc: { loginAttempts: 1 } };

  // Bloquear cuenta si alcanzó el máximo de intentos
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

// Método: Resetear intentos de login tras login exitoso
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { 
      loginAttempts: 0,
      lastLogin: Date.now()
    },
    $unset: { lockUntil: 1 }
  });
};

// Método: Sanitizar datos del usuario antes de enviar al cliente
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.loginAttempts;
  delete user.lockUntil;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
