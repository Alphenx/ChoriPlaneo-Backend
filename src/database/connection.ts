import mongoose from 'mongoose';
import log from '../logger.js';

const connectDB = async (urlBD: string) => {
  try {
    mongoose.set('strictQuery', false);
    mongoose.set('debug', true);

    await mongoose.connect(urlBD);
    log.debug('¡Database successfully connected!');
    return true;
  } catch (error) {
    log.error('Error connecting to database');
    throw new Error(`Error: ${error}`);
  }
};

export default connectDB;
