import railTripsRouter from './trips.js';
import { trainsApi, trainsPage } from './trains.js';
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { bookingsAdminPage, bookingPage, bookingFormPage } from '../controllers/bookings.js';
import { userDashboardPage, usersAdminPage } from '../controllers/users.js';
import { noStore, requirePageLogin, requirePageRole } from '../middleware/auth.js';
import { router as apiRouter } from './api-routes.js';
import { router as ejsRouter } from './ejs.routes.js';

const router = Router();

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Trips and booking flow
router.use('/trips', railTripsRouter);

// Dashboard page
router.get('/dashboard', noStore, requirePageLogin, userDashboardPage);

// Trains page
router.get('/trains', trainsPage);

// Bookings page
router.get('/bookings', noStore, requirePageRole('admin'), bookingsAdminPage);

// Booking form page
router.get('/bookings/new', bookingFormPage);

// Booking page
router.get('/bookings/:bookingId', bookingPage);

// Bookings admin page
router.get('/bookings-admin', noStore, requirePageRole('admin'), bookingsAdminPage);

// User admin page
router.get('/users-admin', noStore, requirePageRole('admin'), usersAdminPage);

// Trains API
router.get('/api/trains', trainsApi);

// Trips router API
router.use('/api', apiRouter);

// Trips route EJS
router.use(ejsRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;