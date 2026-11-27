import express from 'express';
import { getTripDetails, getTripsList } from '../controllers/trips.js';
import {
    renderRegisterPage,
    renderLoginPage,
    renderAdminDashboard,
    register,
    login,
    logout
} from '../controllers/users.js';
import { noStore, requirePageRole } from '../middleware/auth.js';
import {
    bookingFormPage,
    bookingPage,
    processBookingRequest
} from '../controllers/bookings.js';

const router = express.Router();

router.get('/trips/booking/:scheduleId', bookingFormPage);
router.post('/trips/book', processBookingRequest);
router.get('/trips/confirmation/:bookingId', bookingPage);

// Trip page
router.get('/trips/:id', getTripDetails);

// Trips list (all trips listed)
router.get('/trips', getTripsList);

// Register page
router.get('/register', renderRegisterPage);
router.post('/register', register);

// Login page
router.get('/login', renderLoginPage);
router.post('/login', login);

// Logout
router.post('/logout', logout);
router.get('/logout', logout);

// Admin dashboard page
router.get('/admin-dashboard', noStore, requirePageRole('admin'), renderAdminDashboard);


export { router };
