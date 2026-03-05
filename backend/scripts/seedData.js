/**
 * Script de Seed para MongoDB - Datos Ficticios
 * Crea usuarios y donaciones de prueba para desarrollo y testing
 * 
 * Uso: node scripts/seedData.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Donation from '../src/models/Donation.js';
import { USER_ROLES, DONATION_STATUS, FOOD_CATEGORIES, PERISHABILITY } from '../src/config/constants.js';

// Cargar variables de entorno
dotenv.config();

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// ====================================================
// DATOS FICTICIOS DE USUARIOS
// ====================================================

const usersData = [
  // DONANTES (Restaurantes/Supermercados)
  {
    email: 'restaurant.lasdelicias@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.DONOR,
    profile: {
      firstName: 'Restaurante',
      lastName: 'Las Delicias',
      phone: '+525512345678',
      organization: 'Las Delicias Gourmet',
      address: {
        street: 'Av. Reforma 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06600',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1677, 19.4326] // Centro de CDMX
    },
    roleData: {
      businessType: 'restaurant',
      businessLicense: 'LDG850312ABC'
    },
    isVerified: true
  },
  {
    email: 'super.walmart@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.DONOR,
    profile: {
      firstName: 'Walmart',
      lastName: 'Polanco',
      phone: '+525587654321',
      organization: 'Walmart de México',
      address: {
        street: 'Av. Ejército Nacional 980',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '11560',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.2017, 19.4361] // Polanco
    },
    roleData: {
      businessType: 'supermarket',
      businessLicense: 'WMX920815XYZ'
    },
    isVerified: true
  },
  {
    email: 'panaderia.dulcevida@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.DONOR,
    profile: {
      firstName: 'Panadería',
      lastName: 'Dulce Vida',
      phone: '+525598765432',
      organization: 'Panadería Dulce Vida SA',
      address: {
        street: 'Calle Tonalá 56',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06700',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1625, 19.4203] // Roma Norte
    },
    roleData: {
      businessType: 'other',
      businessLicense: 'PDV030520DEF'
    },
    isVerified: true
  },
  {
    email: 'hotel.granplaza@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.DONOR,
    profile: {
      firstName: 'Hotel',
      lastName: 'Gran Plaza',
      phone: '+525534567890',
      organization: 'Gran Plaza Hotel & Suites',
      address: {
        street: 'Paseo de la Reforma 500',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06600',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1785, 19.4295]
    },
    roleData: {
      businessType: 'hotel',
      businessLicense: 'GPH150910GHI'
    },
    isVerified: true
  },

  // ONGs
  {
    email: 'ong.alimentaesperanza@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.NGO,
    profile: {
      firstName: 'Fundación',
      lastName: 'Alimenta Esperanza',
      phone: '+525556781234',
      organization: 'Fundación Alimenta Esperanza AC',
      address: {
        street: 'Calle Insurgentes 890',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '03100',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1764, 19.3891] // Del Valle
    },
    roleData: {
      registrationNumber: 'FAEAC20180615',
      certifications: ['CEMEFI', 'ISO9001']
    },
    isVerified: true
  },
  {
    email: 'ong.bancodecomida@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.NGO,
    profile: {
      firstName: 'Banco de Alimentos',
      lastName: 'de México',
      phone: '+525587654321',
      organization: 'Banco de Alimentos de México IAP',
      address: {
        street: 'Av. Universidad 234',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '04360',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1785, 19.3482] // Copilco
    },
    roleData: {
      registrationNumber: 'BAMX19950320',
      certifications: ['CEMEFI', 'Donataria Autorizada']
    },
    isVerified: true
  },
  {
    email: 'ong.caritas@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.NGO,
    profile: {
      firstName: 'Cáritas',
      lastName: 'de la Arquidiócesis',
      phone: '+525598761234',
      organization: 'Cáritas de la Arquidiócesis de México IAP',
      address: {
        street: 'Calle Durango 90',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06700',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1631, 19.4177]
    },
    roleData: {
      registrationNumber: 'CAM19850810',
      certifications: ['Donataria Autorizada']
    },
    isVerified: true
  },

  // CONDUCTORES
  {
    email: 'driver.juan.perez@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.DRIVER,
    profile: {
      firstName: 'Juan',
      lastName: 'Pérez López',
      phone: '+525512349876',
      address: {
        street: 'Col. Narvarte',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '03020',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1584, 19.3977]
    },
    roleData: {
      vehicleType: 'van',
      vehiclePlate: 'ABC-123-D',
      licenseNumber: 'A123456789'
    },
    isVerified: true
  },
  {
    email: 'driver.maria.garcia@mail.com',
    password: 'SecurePass123!',
    role: USER_ROLES.DRIVER,
    profile: {
      firstName: 'María',
      lastName: 'García Sánchez',
      phone: '+525587651234',
      address: {
        street: 'Col. Condesa',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06140',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1711, 19.4114]
    },
    roleData: {
      vehicleType: 'motorcycle',
      vehiclePlate: 'XYZ-987-M',
      licenseNumber: 'B987654321'
    },
    isVerified: true
  },

  // ADMINISTRADOR
  {
    email: 'admin@ecoresource-connect.com',
    password: 'AdminSecure2026!',
    role: USER_ROLES.ADMIN,
    profile: {
      firstName: 'Administrador',
      lastName: 'Sistema',
      phone: '+525500000000',
      organization: 'EcoResource Connect',
      address: {
        street: 'Oficina Central',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06600',
        country: 'México'
      }
    },
    location: {
      type: 'Point',
      coordinates: [-99.1677, 19.4326]
    },
    roleData: {},
    isVerified: true
  }
];

// ====================================================
// DATOS FICTICIOS DE DONACIONES
// ====================================================

// Helper para convertir objeto address a string
const formatAddress = (address) => {
  return `${address.street}, ${address.city}, ${address.state}`;
};

const generateDonations = (users) => {
  const donors = users.filter(u => u.role === USER_ROLES.DONOR);
  
  const donations = [
    // Donaciones DISPONIBLES
    {
      title: '50 Panes dulces del día',
      description: 'Pan dulce fresco elaborado hoy en la mañana. Incluye conchas, cuernos y roles de canela.',
      donor: donors[2]._id, // Panadería
      category: FOOD_CATEGORIES.BAKERY,
      quantity: {
        amount: 50,
        unit: 'units'
      },
      perishability: PERISHABILITY.SAME_DAY,
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Mañana
      pickupLocation: {
        address: formatAddress(donors[2].profile.address),
        coordinates: {
          type: 'Point',
          coordinates: donors[2].location.coordinates
        }
      },
      availableFrom: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
      availableUntil: new Date(Date.now() + 8 * 60 * 60 * 1000), // Hasta 8 horas
      status: DONATION_STATUS.AVAILABLE,
      images: [
        { url: 'https://picsum.photos/400/300?random=1', publicId: 'seed_pan_dulce' }
      ],
      specialInstructions: 'Preferible recoger en la tarde',
      requiresRefrigeration: false
    },
    {
      title: 'Verduras frescas de temporada',
      description: 'Lechugas, tomates, cebollas y zanahorias que ya no puedo vender pero están en perfecto estado.',
      donor: donors[1]._id, // Walmart
      category: FOOD_CATEGORIES.FRESH_PRODUCE,
      quantity: {
        amount: 30,
        unit: 'kg'
      },
      perishability: PERISHABILITY.SHORT_TERM,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
      pickupLocation: {
        address: formatAddress(donors[1].profile.address),
        coordinates: {
          type: 'Point',
          coordinates: donors[1].location.coordinates
        }
      },
      availableFrom: new Date(Date.now() + 1 * 60 * 60 * 1000),
      availableUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
      status: DONATION_STATUS.AVAILABLE,
      images: [
        { url: 'https://picsum.photos/400/300?random=2', publicId: 'seed_verduras' }
      ],
      specialInstructions: 'Traer contenedores o bolsas grandes',
      requiresRefrigeration: true
    },
    {
      title: 'Comida preparada del buffet',
      description: 'Sobras del buffet del desayuno: chilaquiles, huevos, frijoles, frutas. Todo en perfecto estado.',
      donor: donors[3]._id, // Hotel
      category: FOOD_CATEGORIES.PREPARED_MEALS,
      quantity: {
        amount: 20,
        unit: 'portions'
      },
      perishability: PERISHABILITY.IMMEDIATE,
      expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // Hoy mismo
      pickupLocation: {
        address: formatAddress(donors[3].profile.address),
        coordinates: {
          type: 'Point',
          coordinates: donors[3].location.coordinates
        }
      },
      availableFrom: new Date(Date.now() + 30 * 60 * 1000), // En 30 min
      availableUntil: new Date(Date.now() + 4 * 60 * 60 * 1000),
      status: DONATION_STATUS.AVAILABLE,
      images: [
        { url: 'https://picsum.photos/400/300?random=3', publicId: 'seed_buffet' }
      ],
      specialInstructions: 'Recoger por la puerta de servicio, piso -1',
      requiresRefrigeration: true
    },
    {
      title: 'Platos del menú del día - Comida italiana',
      description: 'Pasta a la boloñesa, lasaña vegetariana y ensalada césar. Preparado hace 2 horas.',
      donor: donors[0]._id, // Restaurante Las Delicias
      category: FOOD_CATEGORIES.PREPARED_MEALS,
      quantity: {
        amount: 25,
        unit: 'portions'
      },
      perishability: PERISHABILITY.IMMEDIATE,
      expirationDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
      pickupLocation: {
        address: formatAddress(donors[0].profile.address),
        coordinates: {
          type: 'Point',
          coordinates: donors[0].location.coordinates
        }
      },
      availableFrom: new Date(Date.now() + 1 * 60 * 60 * 1000),
      availableUntil: new Date(Date.now() + 5 * 60 * 60 * 1000),
      status: DONATION_STATUS.AVAILABLE,
      images: [
        { url: 'https://picsum.photos/400/300?random=4', publicId: 'seed_italiana' }
      ],
      specialInstructions: 'Contenedores térmicos recomendados',
      requiresRefrigeration: true
    },

    // Donaciones RESERVADAS
    {
      title: 'Productos lácteos próximos a vencer',
      description: 'Leche, yogurt y quesos que vencen en 2 días. Total 40 productos.',
      donor: donors[1]._id, // Walmart
      category: FOOD_CATEGORIES.DAIRY,
      quantity: {
        amount: 40,
        unit: 'units'
      },
      perishability: PERISHABILITY.SHORT_TERM,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      pickupLocation: {
        address: formatAddress(donors[1].profile.address),
        coordinates: {
          type: 'Point',
          coordinates: donors[1].location.coordinates
        }
      },
      availableFrom: new Date(Date.now() + 3 * 60 * 60 * 1000),
      availableUntil: new Date(Date.now() + 7 * 60 * 60 * 1000),
      status: DONATION_STATUS.RESERVED,
      images: [
        { url: 'https://picsum.photos/400/300?random=5', publicId: 'seed_lacteos' }
      ],
      requiresRefrigeration: true
    },

    // Donaciones COMPLETADAS
    {
      title: 'Frutas variadas del mercado',
      description: 'Manzanas, naranjas, plátanos y piñas. Ligeramente maduras pero comestibles.',
      donor: donors[1]._id,
      category: FOOD_CATEGORIES.FRESH_PRODUCE,
      quantity: {
        amount: 50,
        unit: 'kg'
      },
      perishability: PERISHABILITY.MEDIUM_TERM,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días (para que no falle validación)
      pickupLocation: {
        address: formatAddress(donors[1].profile.address),
        coordinates: {
          type: 'Point',
          coordinates: donors[1].location.coordinates
        }
      },
      availableFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      availableUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: DONATION_STATUS.COMPLETED,
      images: [
        { url: 'https://picsum.photos/400/300?random=6', publicId: 'seed_frutas' }
      ],
      requiresRefrigeration: false
    }
  ];

  return donations;
};

// ====================================================
// FUNCIÓN PRINCIPAL
// ====================================================

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de base de datos...\n');

    // Conectar a MongoDB
    await connectDB();

    // Limpiar colecciones existentes
    console.log('🗑️  Limpiando colecciones existentes...');
    await User.deleteMany({});
    await Donation.deleteMany({});
    console.log('✅ Colecciones limpiadas\n');

    // Insertar usuarios
    console.log('👥 Creando usuarios ficticios...');
    
    // Hash de passwords
    for (let user of usersData) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }

    const users = await User.insertMany(usersData);
    console.log(`✅ ${users.length} usuarios creados:`);
    console.log(`   - ${users.filter(u => u.role === USER_ROLES.DONOR).length} Donantes`);
    console.log(`   - ${users.filter(u => u.role === USER_ROLES.NGO).length} ONGs`);
    console.log(`   - ${users.filter(u => u.role === USER_ROLES.DRIVER).length} Conductores`);
    console.log(`   - ${users.filter(u => u.role === USER_ROLES.ADMIN).length} Administradores\n`);

    // Insertar donaciones
    console.log('🍲 Creando donaciones ficticias...');
    const donationsData = generateDonations(users);
    const donations = await Donation.insertMany(donationsData);
    console.log(`✅ ${donations.length} donaciones creadas:`);
    console.log(`   - ${donations.filter(d => d.status === DONATION_STATUS.AVAILABLE).length} Disponibles`);
    console.log(`   - ${donations.filter(d => d.status === DONATION_STATUS.RESERVED).length} Reservadas`);
    console.log(`   - ${donations.filter(d => d.status === DONATION_STATUS.COMPLETED).length} Completadas\n`);

    // Mostrar credenciales de prueba
    console.log('═'.repeat(80));
    console.log('🔑 CREDENCIALES DE PRUEBA CREADAS');
    console.log('═'.repeat(80));
    console.log('\n📧 DONANTES:');
    console.log('   Email: restaurant.lasdelicias@mail.com | Password: SecurePass123!');
    console.log('   Email: super.walmart@mail.com | Password: SecurePass123!');
    console.log('   Email: panaderia.dulcevida@mail.com | Password: SecurePass123!');
    console.log('   Email: hotel.granplaza@mail.com | Password: SecurePass123!');
    
    console.log('\n🏢 ONGs:');
    console.log('   Email: ong.alimentaesperanza@mail.com | Password: SecurePass123!');
    console.log('   Email: ong.bancodecomida@mail.com | Password: SecurePass123!');
    console.log('   Email: ong.caritas@mail.com | Password: SecurePass123!');
    
    console.log('\n🚚 CONDUCTORES:');
    console.log('   Email: driver.juan.perez@mail.com | Password: SecurePass123!');
    console.log('   Email: driver.maria.garcia@mail.com | Password: SecurePass123!');
    
    console.log('\n👨‍💼 ADMINISTRADOR:');
    console.log('   Email: admin@ecoresource-connect.com | Password: AdminSecure2026!');
    
    console.log('\n═'.repeat(80));
    console.log('✅ Seed completado exitosamente!');
    console.log('═'.repeat(80));
    console.log('\n💡 Puedes usar estas credenciales para probar la API\n');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar seed
seedDatabase();
