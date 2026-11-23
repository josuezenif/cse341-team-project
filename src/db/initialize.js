import trips from './seeds/trips.json' with { type: 'json' };
import schedules from './seeds/schedules.json' with { type: 'json' };
import stations from './seeds/stations.json' with { type: 'json' };
import ticketClasses from './seeds/ticket-classes.json' with { type: 'json' };
import trains from './seeds/trains.json' with { type: 'json' };
import { Role } from '../models/schemas/roles.js';

const starterCollections = [
  ['trips', trips],
  ['schedules', schedules],
  ['stations', stations],
  ['ticketClasses', ticketClasses],
  ['trains', trains]
];

const migrateBookings = async (db) => {
  const collectionNames = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map(({ name }) => name)
  );
  const legacyCollectionName = 'confirmations';

  if (!collectionNames.has(legacyCollectionName)) {
    await db.collection('bookings').createIndex({ id: 1 }, { unique: true });
    await db.collection('bookings').createIndex({ 'passengers.email': 1 });
    return;
  }

  if (!collectionNames.has('bookings')) {
    await db.collection(legacyCollectionName).rename('bookings');
    await db.collection('bookings').createIndex({ id: 1 }, { unique: true });
    await db.collection('bookings').createIndex({ 'passengers.email': 1 });
    return;
  }

  const bookings = db.collection('bookings');
  const legacyBookings = await db.collection(legacyCollectionName).find({}).toArray();
  const existingIds = new Set(await bookings.distinct('id'));
  const legacyIds = new Set();
  const conflictingIds = [];

  for (const { id } of legacyBookings) {
    if (existingIds.has(id) || legacyIds.has(id)) {
      conflictingIds.push(id);
    }
    legacyIds.add(id);
  }

  if (conflictingIds.length > 0) {
    throw new Error(
      `Cannot migrate legacy bookings because these IDs already exist: ${conflictingIds.join(', ')}`
    );
  }

  if (legacyBookings.length > 0) {
    await bookings.insertMany(legacyBookings);
  }

  await db.collection(legacyCollectionName).drop();
  await bookings.createIndex({ id: 1 }, { unique: true });
  await bookings.createIndex({ 'passengers.email': 1 });
};

const initializeDatabase = async (db) => {
  if (!db) {
    throw new Error('A database connection is required to initialize data.');
  }

  await migrateBookings(db);

  for (const [collectionName, documents] of starterCollections) {
    const collection = db.collection(collectionName);
    await collection.deleteMany({});
    await collection.insertMany(documents);
  }

  const confirmations = db.collection('confirmations');
  await confirmations.deleteMany({});
  await confirmations.createIndex({ id: 1 }, { unique: true });

  const roles = [{ name: 'customer' }, { name: 'admin' }];

  await db.collection('roles').insertMany(roles);
  await db.collection('bookings').createIndex({ id: 1 }, { unique: true });
  await db.collection('bookings').createIndex({ 'passengers.email': 1 });
};

export { initializeDatabase, migrateBookings, starterCollections };
