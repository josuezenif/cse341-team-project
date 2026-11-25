import { afterAll, beforeAll, beforeEach, inject } from 'vitest';
import {
  closeDb,
  connectToDb,
  connectToMongoose,
  getDb
} from '../src/db/connect.js';
import { initializeDatabase } from '../src/db/initialize.js';

process.env.SESSION_SECRET ||= 'test-only-session-secret';

const connectionString = inject('MONGODB_TEST_URI');

beforeAll(async () => {
  await connectToDb({
    connectionString,
    databaseName: 'kizuna-rail-test'
  });
  await connectToMongoose({
    connectionString,
    databaseName: 'kizuna-rail-test'
  });
});

beforeEach(async () => {
  const db = getDb();
  await db.dropDatabase();
  await initializeDatabase(db);
});

afterAll(async () => {
  await closeDb();
});
