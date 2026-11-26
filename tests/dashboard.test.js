import { describe, expect, test } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { createBooking } from '../src/models/bookings.js';
import { Role } from '../src/models/schemas/roles.js';
import { User } from '../src/models/schemas/users.js';

const createAccount = async ({ name, email, role = 'customer' }) => {
  const roleDocument = await Role.findOne({ name: role });
  return User.create({
    name,
    email,
    passwordHash: await bcrypt.hash('correct-password', 4),
    role: roleDocument._id
  });
};

const createBookingFor = async (id, email) => createBooking({
  id,
  passengers: [{
    firstName: 'Passenger <b>One</b>',
    lastName: 'Test',
    email,
    phone: '555-0100'
  }],
  scheduleId: 'schedule-1',
  tripId: 'trip-1',
  ticketClass: 'standard',
  selectedDay: 'monday'
});

describe('Dashboard and role-aware access', () => {
  test('signed-out requests receive page redirects and structured API errors', async () => {
    const agent = request.agent(app);

    const page = await agent.get('/dashboard');
    expect(page.status).toBe(302);
    expect(page.headers.location).toBe('/login?message=Please%20sign%20in%20to%20continue.');

    const myBookings = await agent.get('/api/bookings/me');
    expect(myBookings.status).toBe(401);
    expect(myBookings.body.error).toEqual({
      code: 'UNAUTHENTICATED',
      message: 'You must be signed in to access this resource.'
    });

    const allBookings = await agent.get('/api/bookings');
    expect(allBookings.status).toBe(401);
    expect(allBookings.body.error.code).toBe('UNAUTHENTICATED');
  });

  test('a standard user sees only matching bookings and is denied admin resources', async () => {
    await createAccount({
      name: '<script>alert(1)</script>',
      email: 'Ana@Mail.com'
    });
    await createBookingFor('matched-booking', ' ANA@MAIL.COM ');
    await createBookingFor('other-booking', 'other@example.com');

    const agent = request.agent(app);
    const login = await agent.post('/login').type('form').send({
      email: ' ana@mail.com ',
      password: 'correct-password',
      redirect: 'https://example.com'
    });
    expect(login.status).toBe(302);
    expect(login.headers.location).toBe('/dashboard');

    const dashboard = await agent.get('/dashboard');
    expect(dashboard.status).toBe(200);
    expect(dashboard.headers['cache-control']).toContain('no-store');
    expect(dashboard.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(dashboard.text).toContain('href="/bookings-admin"');
    expect(dashboard.text).toContain('href="/users-admin"');
    expect(dashboard.text).not.toContain('matched-booking');

    const myBookings = await agent.get('/api/bookings/me?email=other@example.com');
    expect(myBookings.status).toBe(200);
    expect(myBookings.body.map(({ id }) => id)).toEqual(['matched-booking']);
    expect(myBookings.body[0].passengers[0]).not.toHaveProperty('phone');

    const allBookings = await agent.get('/api/bookings');
    expect(allBookings.status).toBe(403);
    expect(allBookings.body.error.code).toBe('FORBIDDEN');

    for (const path of ['/bookings-admin', '/bookings', '/users-admin', '/admin-dashboard']) {
      expect((await agent.get(path)).status).toBe(403);
    }

    const header = await agent.get('/');
    expect(header.text).toContain('href="/dashboard">Dashboard</a>');
    expect(header.text).toContain('href="/logout">Logout</a>');
    expect(header.text).not.toContain('href="/login">Login</a>');
    expect((await agent.get('/login')).headers.location).toBe('/dashboard');
    expect((await agent.get('/register')).headers.location).toBe('/dashboard');
  });

  test('admins land on the admin dashboard and are redirected there from the user dashboard', async () => {
    await createAccount({
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin'
    });

    const agent = request.agent(app);
    const login = await agent.post('/login').type('form').send({
      email: 'admin@example.com',
      password: 'correct-password'
    });
    expect(login.headers.location).toBe('/admin-dashboard');

    const dashboard = await agent.get('/dashboard');
    expect(dashboard.status).toBe(302);
    expect(dashboard.headers.location).toBe('/admin-dashboard');
    const home = await agent.get('/');
    expect(home.text).toContain('href="/admin-dashboard">Dashboard</a>');
  });

  test('login validation and invalid credentials use the specified messages', async () => {
    const empty = await request(app).post('/login').type('form').send({});
    expect(empty.status).toBe(400);
    expect(empty.text).toContain('Email and password are required.');

    await createAccount({ name: 'User', email: 'known@example.com' });
    const wrongPassword = await request(app).post('/login').type('form').send({
      email: 'known@example.com',
      password: 'wrong-password'
    });
    const unknownEmail = await request(app).post('/login').type('form').send({
      email: 'unknown@example.com',
      password: 'wrong-password'
    });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.text).toContain('Invalid email or password.');
    expect(unknownEmail.text).toContain('Invalid email or password.');
  });
});
