import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Conecta a la base de datos MongoDB
 * Implementa opciones de seguridad y manejo de errores robusto
 */
export const connectDatabase = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4 // Usa IPv4, evita problemas con IPv6
    };

    await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB conectado exitosamente: ${mongoose.connection.host}`);

    // Manejo de eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

    // Cierre graceful de la conexión
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexión MongoDB cerrada por terminación de aplicación');
      process.exit(0);
    });

  } catch (error) {
    console.error('💥 Error fatal conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Cierra la conexión a la base de datos
 * Útil para pruebas unitarias
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Conexión MongoDB cerrada correctamente');
  } catch (error) {
    console.error('Error cerrando conexión MongoDB:', error);
    throw error;
  }
};

export default { connectDatabase, disconnectDatabase };
