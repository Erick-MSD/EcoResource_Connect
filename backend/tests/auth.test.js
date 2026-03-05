import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/server.js';
import User from '../src/models/User.js';
import { USER_ROLES, HTTP_STATUS } from '../src/config/constants.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup/testDb.js';

describe('Auth Controller - Pruebas de Autenticación', () => {
  
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/v1/auth/register - Registro de Usuario', () => {
    
    test('Debe registrar un nuevo donante exitosamente', async () => {
      const newUser = {
        email: 'restaurant@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Juan',
          lastName: 'Pérez',
          phone: '+52 55 1234 5678',
          organization: 'Restaurante El Buen Sabor'
        },
        location: {
          coordinates: [-99.1332, 19.4326] // Ciudad de México
        },
        roleData: {
          businessType: 'restaurant',
          businessLicense: 'LIC-2024-001'
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.role).toBe(USER_ROLES.DONOR);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      
      // Verificar que la contraseña no se incluya en la respuesta
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('Debe registrar una ONG exitosamente', async () => {
      const newNGO = {
        email: 'ong@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.NGO,
        profile: {
          firstName: 'María',
          lastName: 'González',
          phone: '+52 55 9876 5432',
          organization: 'Banco de Alimentos México'
        },
        location: {
          coordinates: [-99.1500, 19.4200]
        },
        roleData: {
          registrationNumber: 'REG-NGO-2024-001',
          certifications: ['ISO-9001', 'FDA-Approved']
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(newNGO)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe(USER_ROLES.NGO);
      expect(response.body.data.user.roleData.registrationNumber).toBe('REG-NGO-2024-001');
    });

    test('Debe fallar si el email ya está registrado', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      };

      // Primer registro
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.CREATED);

      // Segundo registro con mismo email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.CONFLICT);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ya');
    });

    test('Debe fallar con contraseña débil', async () => {
      const userData = {
        email: 'weak@test.com',
        password: '123', // Contraseña muy corta
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('Debe fallar con email inválido', async () => {
      const userData = {
        email: 'not-an-email',
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.success).toBe(false);
    });

    test('Debe fallar con rol inválido', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'SecurePass123!',
        role: 'invalid_role',
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login - Inicio de Sesión', () => {
    
    const validUser = {
      email: 'login@test.com',
      password: 'SecurePass123!',
      role: USER_ROLES.DONOR,
      profile: {
        firstName: 'Login',
        lastName: 'Test'
      }
    };

    beforeEach(async () => {
      // Crear usuario de prueba
      await request(app)
        .post('/api/v1/auth/register')
        .send(validUser);
    });

    test('Debe iniciar sesión con credenciales correctas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        })
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUser.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    test('Debe fallar con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword123!'
        })
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciales');
    });

    test('Debe fallar con email no existente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'SecurePass123!'
        })
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
    });

    test('Debe bloquear cuenta tras múltiples intentos fallidos', async () => {
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;

      // Realizar intentos fallidos
      for (let i = 0; i < maxAttempts; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: validUser.email,
            password: 'WrongPassword123!'
          });
      }

      // El siguiente intento debe indicar cuenta bloqueada
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        })
        .expect(HTTP_STATUS.FORBIDDEN);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('bloqueada');
    });

    test('Debe fallar con campos faltantes', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email
          // password faltante
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile - Obtener Perfil', () => {
    
    let accessToken;
    const testUser = {
      email: 'profile@test.com',
      password: 'SecurePass123!',
      role: USER_ROLES.NGO,
      profile: {
        firstName: 'Profile',
        lastName: 'Test'
      }
    };

    beforeEach(async () => {
      // Registrar y obtener token
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      accessToken = registerResponse.body.data.accessToken;
    });

    test('Debe obtener perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('Debe fallar sin token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
    });

    test('Debe fallar con token inválido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout - Cerrar Sesión', () => {
    
    let accessToken;
    
    beforeEach(async () => {
      const userData = {
        email: 'logout@test.com',
        password: 'SecurePass123!',
        role: USER_ROLES.DRIVER,
        profile: {
          firstName: 'Logout',
          lastName: 'Test'
        }
      };

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      accessToken = registerResponse.body.data.accessToken;
    });

    test('Debe cerrar sesión exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);
    });

    test('Debe fallar sin token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Cobertura de Seguridad', () => {
    
    test('Debe sanitizar intentos de inyección NoSQL en email', async () => {
      const maliciousPayload = {
        email: { $ne: null }, // Intento de inyección NoSQL
        password: 'SecurePass123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Hacker',
          lastName: 'Test'
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(maliciousPayload)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.success).toBe(false);
    });

    test('Debe hashear la contraseña antes de guardar', async () => {
      const userData = {
        email: 'hash@test.com',
        password: 'PlainPassword123!',
        role: USER_ROLES.DONOR,
        profile: {
          firstName: 'Hash',
          lastName: 'Test'
        }
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const user = await User.findOne({ email: userData.email }).select('+password');
      
      // La contraseña almacenada NO debe ser igual a la original
      expect(user.password).not.toBe(userData.password);
      // Debe tener formato de hash bcrypt
      expect(user.password).toMatch(/^\$2[aby]\$.{56}$/);
    });
  });
});
