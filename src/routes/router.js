import railTripsRouter from './trips.js';
import { trainsApi, trainsPage } from './trains.js';
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { bookingsAdminPage } from '../controllers/bookings.js';
import { router as apiRouter } from './api-routes.js';
import { router as ejsRouter } from './ejs.routes.js';

const router = Router();

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Trains page
router.get('/trains', trainsPage);

// Bookings admin page
router.get('/bookings-admin', bookingsAdminPage);

// Trains API
router.get('/api/trains', trainsApi);

// Trips router API
router.use('/api', apiRouter);

// Trips route EJS
router.use('/trips', ejsRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;