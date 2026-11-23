import { describe, expect, test } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { ensureDefaultRoles } from '../src/db/initialize.js';
import { getDb } from '../src/db/connect.js';
import { Role } from '../src/models/schemas/roles.js';
import { User } from '../src/models/schemas/users.js';

describe('Registration', () => {
  test('default roles can be created idempotently', async () => {
    const db = getDb();
    await db.collection('roles').deleteMany({});

    await ensureDefaultRoles(db);
    await ensureDefaultRoles(db);

    const roleNames = await Role.find({}).distinct('name');
    expect(roleNames.sort()).toEqual(['admin', 'customer']);
  });

  test('weak passwords are rejected with a visible message', async () => {
    const response = await request(app)
      .post('/register')
      .type('form')
      .send({
        name: 'New User',
        email: 'new@example.com',
        password: 'weakpass'
      });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Password must be at least 8 characters');
    expect(response.text).toContain('value="New User"');
    expect(response.text).toContain('value="new@example.com"');
    expect(await User.findOne({ email: 'new@example.com' })).toBeNull();
  });

  test('registration creates a customer account and confirms success on login', async () => {
    const db = getDb();
    await db.collection('roles').deleteMany({});
    await ensureDefaultRoles(db);

    const agent = request.agent(app);
    const response = await agent
      .post('/register')
      .type('form')
      .send({
        name: ' New User ',
        email: ' NEW@example.com ',
        password: 'RailPass1'
      });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      '/login?message=Account%20created%20successfully.%20Please%20sign%20in.'
    );

    const loginPage = await agent.get(response.headers.location);
    expect(loginPage.text).toContain('Account created successfully. Please sign in.');

    const user = await User.findOne({ email: 'new@example.com' }).populate('role');
    expect(user.name).toBe('New User');
    expect(user.role.name).toBe('customer');
    expect(user.passwordHash).not.toBe('RailPass1');
    expect(await bcrypt.compare('RailPass1', user.passwordHash)).toBe(true);
  });
});
