import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import User from '../../src/models/User.js';
import Donation from '../../src/models/Donation.js';
import { USER_ROLES, DONATION_STATUS, FOOD_CATEGORIES } from '../../src/config/constants.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../setup/testDb.js';

jest.setTimeout(30000);

describe('MongoDB Models - Pruebas de Modelos', () => {
  
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('User Model', () => {
    
    test('Debe crear un usuario válido', async () => {
      const userData = {
        email: 'model@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Test',
          lastName: 'Model'
        },
        location: {
          coordinates: [-99.1332, 19.4326]
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(USER_ROLES.DONOR);
    });

    test('Debe fallar sin campos requeridos', async () => {
      const invalidUser = new User({
        email: 'incomplete@test.com'
        // Falta password y role
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });

    test('Debe validar formato de email', async () => {
      const invalidUser = new User({
        email: 'not-an-email',
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });

    test('Debe prevenir emails duplicados', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'First',
          lastName: 'User'
        }
      };

      await User.create(userData);

      const duplicateUser = new User({
        ...userData,
        profile: {
          firstName: 'Second',
          lastName: 'User'
        }
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    test('Método comparePassword debe funcionar correctamente', async () => {
      const password = 'TestPassword123!';
      const user = new User({
        email: 'compare@test.com',
        password,
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Compare',
          lastName: 'Test'
        }
      });

      await user.save();

      const foundUser = await User.findOne({ email: 'compare@test.com' }).select('+password');
      
      const isMatch = await foundUser.comparePassword(password);
      const isNotMatch = await foundUser.comparePassword('WrongPassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });

    test('toJSON debe excluir campos sensibles', async () => {
      const user = new User({
        email: 'json@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'JSON',
          lastName: 'Test'
        }
      });

      await user.save();

      const userJSON = user.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.refreshToken).toBeUndefined();
      expect(userJSON.__v).toBeUndefined();
    });
  });

  describe('Donation Model', () => {
    
    let donor;

    beforeEach(async () => {
      donor = await User.create({
        email: 'donor@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Donor',
          lastName: 'Test'
        }
      });
    });

    test('Debe crear una donación válida', async () => {
      const donationData = {
        donor: donor._id,
        title: 'Pan del día',
        description: '20 piezas de pan fresco',
        category: FOOD_CATEGORIES.BAKERY,
        quantity: {
          amount: 20,
          unit: 'units'
        },
        perishability: 'same_day',
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 horas
        pickupLocation: {
          address: 'Av. Revolución 123, CDMX',
          coordinates: {
            coordinates: [-99.1332, 19.4326]
          }
        },
        availableUntil: new Date(Date.now() + 12 * 60 * 60 * 1000) // +12 horas
      };

      const donation = await Donation.create(donationData);

      expect(donation._id).toBeDefined();
      expect(donation.title).toBe(donationData.title);
      expect(donation.status).toBe(DONATION_STATUS.AVAILABLE);
    });

    test('Debe fallar con fecha de expiración pasada', async () => {
      const invalidDonation = new Donation({
        donor: donor._id,
        title: 'Donación expirada',
        description: 'Test',
        category: FOOD_CATEGORIES.PREPARED_MEALS,
        quantity: {
          amount: 10,
          unit: 'portions'
        },
        perishability: 'immediate',
        expirationDate: new Date(Date.now() - 1000), // Fecha pasada
        pickupLocation: {
          address: 'Test Address',
          coordinates: {
            coordinates: [-99.1332, 19.4326]
          }
        },
        availableUntil: new Date(Date.now() + 1000)
      });

      await expect(invalidDonation.save()).rejects.toThrow();
    });

    test('Consulta geoespacial findNearby debe funcionar', async () => {
      // Crear donaciones en diferentes ubicaciones
      const nearDonation = await Donation.create({
        donor: donor._id,
        title: 'Donación cercana',
        description: 'Test',
        category: FOOD_CATEGORIES.FRESH_PRODUCE,
        quantity: { amount: 5, unit: 'kg' },
        perishability: 'same_day',
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        pickupLocation: {
          address: 'Cerca',
          coordinates: {
            coordinates: [-99.1332, 19.4326] // CDMX Centro
          }
        },
        availableUntil: new Date(Date.now() + 12 * 60 * 60 * 1000)
      });

      const farDonation = await Donation.create({
        donor: donor._id,
        title: 'Donación lejana',
        description: 'Test',
        category: FOOD_CATEGORIES.FRESH_PRODUCE,
        quantity: { amount: 5, unit: 'kg' },
        perishability: 'same_day',
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        pickupLocation: {
          address: 'Lejos',
          coordinates: {
            coordinates: [-103.3500, 20.6597] // Guadalajara (muy lejos)
          }
        },
        availableUntil: new Date(Date.now() + 12 * 60 * 60 * 1000)
      });

      // Buscar donaciones cerca de CDMX Centro
      const nearbyDonations = await Donation.findNearby(-99.1332, 19.4326, 10); // Radio de 10km

      expect(nearbyDonations.length).toBeGreaterThan(0);
      expect(nearbyDonations[0].title).toBe('Donación cercana');
    });

    test('Método reserve debe cambiar el estado', async () => {
      const ngo = await User.create({
        email: 'ngo@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.NGO,
        profile: {
          firstName: 'NGO',
          lastName: 'Test'
        }
      });

      const donation = await Donation.create({
        donor: donor._id,
        title: 'Para reservar',
        description: 'Test',
        category: FOOD_CATEGORIES.CANNED,
        quantity: { amount: 10, unit: 'units' },
        perishability: 'long_term',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        pickupLocation: {
          address: 'Test',
          coordinates: {
            coordinates: [-99.1332, 19.4326]
          }
        },
        availableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await donation.reserve(ngo._id);

      expect(donation.status).toBe(DONATION_STATUS.RESERVED);
      expect(donation.reservedBy.ngo.toString()).toBe(ngo._id.toString());
    });
  });
});
