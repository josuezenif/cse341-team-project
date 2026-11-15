// import { MongoClient } from 'mongodb';

// let database;
// let client;

// const connectToDb = async (options = {}) => {
//   if (database) {
//     return database;
//   }

//   const connectionString = options.connectionString || process.env.MONGODB_URI;
//   const databaseName = options.databaseName || process.env.MONGODB_DB_NAME || 'practice';

//   if (!connectionString) {
//     throw new Error('MONGODB_URI is required.');
//   }

//   client = new MongoClient(connectionString);
//   await client.connect();
//   database = client.db(databaseName);
//   return database;
// };

import mongoose from 'mongoose';

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'practice'
    });

    console.log('MongoDB connected successfully!');

  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const getDb = () => {
  if (!database) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }
  return database;
};

const closeDb = async () => {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
};

export { closeDb, connectToDb, getDb };
