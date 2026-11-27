import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Trips pagination API', () => {
  test('GET /api/trips returns a paginated response', async () => {
    const response = await request(app).get('/api/trips?page=1&limit=10');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.metadata).toEqual(expect.objectContaining({
      currentPage: 1,
      limit: 10
    }));
  });

  test('GET /api/trips rejects invalid pagination', async () => {
    const invalidPage = await request(app).get('/api/trips?page=0');
    const invalidLimit = await request(app).get('/api/trips?limit=101');

    expect(invalidPage.status).toBe(400);
    expect(invalidPage.body).toEqual({
      error: 'The page parameter must be a positive integer.'
    });
    expect(invalidLimit.status).toBe(400);
    expect(invalidLimit.body).toEqual({
      error: 'The limit parameter must be an integer from 1 to 100.'
    });
  });

  test('GET /api/trips/:id still returns one trip', async () => {
    const response = await request(app).get('/api/trips/alpine-panorama');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: 'alpine-panorama'
    }));
  });

  test('GET /api-docs.json documents trip pagination', async () => {
    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.body.paths['/api/trips'].get.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'page' }),
        expect.objectContaining({ name: 'limit' })
      ])
    );
  });
});
