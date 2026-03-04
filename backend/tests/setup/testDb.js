import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

/**
 * Configuración de MongoDB Memory Server para pruebas
 * Crea una instancia en memoria de MongoDB
 */
export const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    
    console.log('✅ Conectado a MongoDB Memory Server para pruebas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Memory Server:', error);
    throw error;
  }
};

/**
 * Cierra la conexión y detiene el servidor
 */
export const closeTestDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    
    console.log('🔌 MongoDB Memory Server detenido');
  } catch (error) {
    console.error('❌ Error cerrando MongoDB Memory Server:', error);
    throw error;
  }
};

/**
 * Limpia todas las colecciones entre pruebas
 */
export const clearTestDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    console.log('🧹 Base de datos de pruebas limpiada');
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
    throw error;
  }
};

export default {
  connectTestDB,
  closeTestDB,
  clearTestDB
};
