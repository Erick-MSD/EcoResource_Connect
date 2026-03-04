import mongoose from 'mongoose';
import { DONATION_STATUS, FOOD_CATEGORIES, PERISHABILITY } from '../config/constants.js';

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El donante es obligatorio']
  },
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  category: {
    type: String,
    enum: Object.values(FOOD_CATEGORIES),
    required: [true, 'La categoría es obligatoria']
  },
  quantity: {
    amount: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [0, 'La cantidad no puede ser negativa']
    },
    unit: {
      type: String,
      enum: ['kg', 'liters', 'units', 'portions'],
      required: true
    }
  },
  perishability: {
    type: String,
    enum: Object.values(PERISHABILITY),
    required: [true, 'El nivel de perecibilidad es obligatorio']
  },
  expirationDate: {
    type: Date,
    required: [true, 'La fecha de expiración es obligatoria'],
    validate: {
      validator: function(value) {
        return value > Date.now();
      },
      message: 'La fecha de expiración debe ser futura'
    }
  },
  // Ubicación de recogida
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitud, latitud]
        required: true,
        index: '2dsphere'
      }
    }
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(DONATION_STATUS),
    default: DONATION_STATUS.AVAILABLE
  },
  // Reserva por ONG
  reservedBy: {
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reservedAt: Date,
    estimatedPickupTime: Date
  },
  // Imágenes de la donación
  images: [{
    url: String,
    publicId: String
  }],
  // Información adicional
  specialInstructions: String,
  requiresRefrigeration: {
    type: Boolean,
    default: false
  },
  // Métricas
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  feedback: String
}, {
  timestamps: true
});

// Índices compuestos para consultas optimizadas
donationSchema.index({ status: 1, expirationDate: 1 });
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
donationSchema.index({ category: 1, status: 1 });

// Índice TTL para auto-eliminación de donaciones expiradas (después de 90 días)
donationSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 7776000 }); // 90 días

// Virtual: Calcular tiempo restante hasta expiración
donationSchema.virtual('timeUntilExpiration').get(function() {
  const now = new Date();
  const expiration = new Date(this.expirationDate);
  const diffMs = expiration - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  return diffHours > 0 ? diffHours : 0;
});

// Middleware: Auto-cambiar estado a EXPIRED si la fecha pasó
donationSchema.pre('find', function() {
  this.where({
    $or: [
      { expirationDate: { $gte: new Date() } },
      { status: DONATION_STATUS.EXPIRED }
    ]
  });
});

// Método estático: Buscar donaciones cercanas (consulta geoespacial)
donationSchema.statics.findNearby = function(longitude, latitude, radiusKm = 10) {
  const radiusMeters = radiusKm * 1000;
  
  return this.find({
    'pickupLocation.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusMeters
      }
    },
    status: DONATION_STATUS.AVAILABLE,
    expirationDate: { $gte: new Date() }
  });
};

// Método: Reservar donación
donationSchema.methods.reserve = async function(ngoId, driverId = null) {
  this.status = DONATION_STATUS.RESERVED;
  this.reservedBy = {
    ngo: ngoId,
    driver: driverId,
    reservedAt: Date.now()
  };
  return this.save();
};

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
