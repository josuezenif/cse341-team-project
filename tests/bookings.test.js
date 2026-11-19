import { describe, expect, test } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';
import app from '../app.js';
import { getDb } from '../src/db/connect.js';
import { migrateBookings } from '../src/db/initialize.js';

describe('Bookings', () => {
  test('Swagger UI is available', async () => {
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Swagger UI');

    const specification = swaggerJsdoc({
      definition: { openapi: '3.0.0', info: { title: 'Test API', version: '1.0.0' } },
      apis: [path.join(process.cwd(), 'src', 'routes', 'api-routes.js')]
    });
    expect(specification.paths['/api/bookings/{bookingId}']).toBeDefined();
  });

  test('bookings admin page starts in a client-side loading state', async () => {
    const response = await request(app).get('/bookings-admin');

    expect(response.status).toBe(200);
    expect(response.text).toContain('id="bookings-loading"');
    expect(response.text).toContain('id="booking-card-template"');
    expect(response.text).not.toContain('JR');
  });

  test('bookings page renders the styled admin listing', async () => {
    const response = await request(app).get('/bookings');

    expect(response.status).toBe(200);
    expect(response.text).toContain('href="/css/main.css"');
    expect(response.text).toContain('id="bookings-list"');
    expect(response.text).toContain('id="bookings-loading"');
  });

  test('new booking page selects a schedule before showing its booking form', async () => {
    const selectionResponse = await request(app).get('/bookings/new');

    expect(selectionResponse.status).toBe(200);
    expect(selectionResponse.text).toContain('name="scheduleId"');
    expect(selectionResponse.text).toContain('Choose a trip schedule');

    const formResponse = await request(app).get('/bookings/new?scheduleId=1');
    expect(formResponse.status).toBe(200);
    expect(formResponse.text).toContain('Complete your booking details');
    expect(formResponse.text).toContain('name="scheduleId" value="1"');
  });

  test('booking routes render the form and return 404 for an unknown booking', async () => {
    const formResponse = await request(app).get('/trips/booking/1');
    expect(formResponse.status).toBe(200);
    expect(formResponse.text).toContain('Complete your booking details');

    const missingResponse = await request(app).get('/trips/confirmation/unknown');
    expect(missingResponse.status).toBe(404);

    const missingPageResponse = await request(app).get('/bookings/unknown');
    expect(missingPageResponse.status).toBe(404);
  });

  test('GET /api/bookings returns an empty array when there are no bookings', async () => {
    const response = await request(app).get('/api/bookings');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('booking API creates and retrieves a booking by ID', async () => {
    const createResponse = await request(app)
      .post('/api/bookings')
      .send({
        scheduleId: '1',
        tripId: 'alpine-panorama',
        ticketClass: 'standard',
        selectedDay: 'monday',
        passengers: [{
          firstName: 'Alex',
          lastName: 'Smith',
          email: 'alex@example.com',
          phone: '+81 90-1234-5678'
        }]
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.headers.location).toBe(`/api/bookings/${createResponse.body.id}`);

    const getResponse = await request(app).get(createResponse.headers.location);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toMatchObject({
      id: createResponse.body.id,
      tripId: 'alpine-panorama',
      passengers: [{ firstName: 'Alex', lastName: 'Smith' }]
    });

    const bookingPageResponse = await request(app).get(`/bookings/${createResponse.body.id}`);
    expect(bookingPageResponse.status).toBe(200);
    expect(bookingPageResponse.text).toContain(createResponse.body.id);

    const missingResponse = await request(app).get('/api/bookings/unknown');
    expect(missingResponse.status).toBe(404);
  });

  test('booking form submission stores passenger details and renders the booking', async () => {
    const response = await request(app)
      .post('/trips/book')
      .type('form')
      .send({
        scheduleId: '1',
        tripId: 'alpine-panorama',
        ticketClass: 'standard',
        selectedDay: 'monday',
        'passengers[0][firstName]': 'Alex',
        'passengers[0][lastName]': 'Smith',
        'passengers[0][email]': 'alex@example.com',
        'passengers[0][phone]': '+81 90-1234-5678'
      });

    expect(response.status).toBe(302);
    expect(response.headers.location).toMatch(/^\/trips\/confirmation\/JR/);

    const bookingsResponse = await request(app).get('/api/bookings');
    expect(bookingsResponse.status).toBe(200);
    expect(bookingsResponse.body).toHaveLength(1);
    expect(bookingsResponse.body[0]).toMatchObject({
      tripId: 'alpine-panorama',
      passengers: [{
        firstName: 'Alex',
        lastName: 'Smith',
        email: 'alex@example.com',
        phone: '+81 90-1234-5678'
      }]
    });
    expect(bookingsResponse.body[0]).not.toHaveProperty('_id');

    const confirmationResponse = await request(app).get(response.headers.location);
    expect(confirmationResponse.status).toBe(200);
    expect(confirmationResponse.text).toContain(bookingsResponse.body[0].id);
  });

  test('invalid bookings return an error and are not saved', async () => {
    const response = await request(app)
      .post('/trips/book')
      .type('form')
      .send({
        scheduleId: '1',
        tripId: 'alpine-panorama',
        ticketClass: 'standard',
        selectedDay: 'monday'
      });

    expect(response.status).toBe(400);
    expect(response.text).toContain('booking details are invalid');

    const bookingsResponse = await request(app).get('/api/bookings');
    expect(bookingsResponse.body).toEqual([]);
  });

  test('legacy booking documents migrate without being discarded', async () => {
    const db = getDb();
    const legacyCollection = db.collection('confirmations');
    await legacyCollection.insertOne({
      id: 'legacy-1',
      passengers: [{ firstName: 'Sam', lastName: 'Lee', email: 'sam@example.com', phone: '123' }]
    });

    await migrateBookings(db);

    expect(await db.collection('confirmations').countDocuments()).toBe(0);
    expect(await db.collection('bookings').findOne({ id: 'legacy-1' })).toMatchObject({
      id: 'legacy-1',
      passengers: [{ firstName: 'Sam', lastName: 'Lee' }]
    });
  });

  test('legacy ID conflicts abort migration and leave source data intact', async () => {
    const db = getDb();
    await db.collection('bookings').insertOne({ id: 'shared-id', passengers: [] });
    await db.collection('confirmations').insertOne({ id: 'shared-id', passengers: [] });

    await expect(migrateBookings(db)).rejects.toThrow('shared-id');
    expect(await db.collection('confirmations').countDocuments()).toBe(1);
  });
});
