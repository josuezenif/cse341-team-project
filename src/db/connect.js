import { MongoClient } from 'mongodb';

let database;
let client;

const connectToDb = async (options = {}) => {
  if (database) {
    return database;
  }

  const connectionString = options.connectionString || process.env.MONGODB_URI;
  const databaseName = options.databaseName || process.env.MONGODB_DB_NAME || 'practice';
  
  if (!connectionString) {
    throw new Error('MONGODB_URI is required.');
  }
  
  client = new MongoClient(connectionString);
  await client.connect();
  database = client.db(databaseName);
  return database;
};

import mongoose from 'mongoose';

const connectToMongoose = async () => {
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
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
};

export { closeDb, connectToMongoose, connectToDb, getDb };

/*
Coworker's version retained as an inactive fallback:
*/

// import dns from 'node:dns';
// import mongoose from 'mongoose';

// let database;

// const connectToDb = async (options = {}) => {
//   if (database) {
//     return database;
//   }

//   const connectionString = options.connectionString || process.env.MONGODB_URI;
//   const databaseName = options.databaseName || process.env.MONGODB_DB_NAME || 'practice';

//   if (!connectionString) {
//     throw new Error('MONGODB_URI is required.');
//   }

//   const configuredDnsServers = process.env.MONGODB_DNS_SERVERS?.trim();
//   if (configuredDnsServers) {
//     const dnsServers = configuredDnsServers
//       .split(',')
//       .map((server) => server.trim())
//       .filter(Boolean);

//     if (dnsServers.length === 0) {
//       throw new Error('MONGODB_DNS_SERVERS must contain at least one DNS server.');
//     }

//     dns.setServers(dnsServers);
//   }

//   const connectionOptions = {
//     dbName: databaseName,
//     ...(/^mongodb\+srv:\/\//i.test(connectionString)
//       ? { secureProtocol: 'TLSv1_2_method' }
//       : {}),
//   };

//   await mongoose.connect(connectionString, connectionOptions);
//   database = mongoose.connection.db;
//   if (!database) {
//     throw new Error('MongoDB connected without initializing a database.');
//   }

//   return database;
// };

// const connectToMongoose = async () => connectToDb();

// const getDb = () => {
//   if (!database) {
//     throw new Error('Database not initialized. Call connectToDb first.');
//   }
//   return database;
// };

// const closeDb = async () => {
//   if (mongoose.connection.readyState !== 0) {
//     await mongoose.disconnect();
//     database = undefined;
//   }
// };

// export { closeDb, connectToDb, connectToMongoose, getDb };