import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import log from './logger.js';

dotenv.config();

const port = process.env.PORT ?? 3000;

mongoose.set('strictQuery', false);

app.listen(port, () => {
  log.info(`Server started in port ${port}`);
});
