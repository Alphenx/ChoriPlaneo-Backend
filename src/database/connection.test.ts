import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import connectDB from './connection.js';
import { PlanModel } from '../api/plans/plans-schema';

describe('Given a database connection', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUrl = mongoServer.getUri();
    await connectDB(mongoUrl);
  });

  afterAll(async () => {
    await mongoServer.stop();
    await mongoose.connection.close();
  });

  describe('When the transform options are defined', () => {
    test('Then it should delete __v and id from the returned objects', async () => {
      const doc = new PlanModel({ title: 'Choriplan' });
      await doc.save();

      const transformedDoc = (doc as mongoose.Document).toJSON();

      expect(transformedDoc.__v).toBeUndefined();
      expect(transformedDoc.id).toBeUndefined();
    });
  });
});
