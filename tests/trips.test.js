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

  test('GET /api-docs/ serves trip API documentation', async () => {
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Swagger UI');
  });

  test('GET /api/trips searches names and descriptions', async () => {
    const response = await request(app).get('/api/trips?q=Alpine&limit=10');

    expect(response.status).toBe(200);
    expect(response.body.metadata.search).toBe('Alpine');
  });

  test('GET /api/trips validates search sort and order parameters', async () => {
    const invalidSort = await request(app).get('/api/trips?sort=distance');
    const invalidOrder = await request(app).get('/api/trips?order=sideways');

    expect(invalidSort.status).toBe(400);
    expect(invalidSort.body.error).toContain('sort');
    expect(invalidOrder.status).toBe(400);
    expect(invalidOrder.body.error).toContain('order');
  });
});
