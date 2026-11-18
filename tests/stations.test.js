import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { getDb } from '../src/db/connect.js';

describe('GET /api/stations', () => {
  test('returns a successful JSON response with seeded stations', async () => {
    const response = await request(app).get('/api/stations');

    expect(response.status, response.text).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toHaveLength(12);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'nagoya',
          name: 'Nagoya Station',
          prefecture: 'Aichi',
          facilities: expect.arrayContaining(['restaurant', 'tourist_info'])
        })
      ])
    );
  });

  test('returns a station added to the test database', async () => {
    await getDb().collection('stations').insertOne({
      id: 'test-station',
      name: 'Test Station',
      prefecture: 'Test Prefecture',
      region: 'test',
      facilities: ['restroom'],
      description: 'A test station.'
    });

    const response = await request(app).get('/api/stations/test-station');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 'test-station',
        name: 'Test Station',
        description: 'A test station.'
      })
    );
  });

  test('returns 404 when the requested station does not exist', async () => {
    const response = await request(app).get('/api/stations/not-a-station');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Station not found'
    });
  });
});

describe('Trip station details', () => {
  test('renders station detail controls for a trip', async () => {
    const response = await request(app).get('/trips/alpine-panorama');

    expect(response.status, response.text).toBe(200);
    expect(response.text).toContain('data-station-id="nagoya"');
    expect(response.text).toContain('data-station-id="toyama"');
  });
});
