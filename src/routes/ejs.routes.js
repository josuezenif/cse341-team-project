import express from 'express';
import { getTripDetails, getTripsList } from '../controllers/trips.js';
import { renderRegisterPage, renderLoginPage, renderAdminDashboard, register, login, logout } from '../controllers/users.js';
import { requirePageLogin, requirePageRole } from '../middleware/auth.js';
import {
    bookingFormPage,
    bookingPage,
    processBookingRequest
} from '../controllers/bookings.js';

const router = express.Router();

router.get('/booking/:scheduleId', bookingFormPage);
router.post('/book', processBookingRequest);
router.get('/confirmation/:bookingId', bookingPage);

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

// Admin dashboard page
router.get('/admin-dashboard', requirePageRole('admin'), renderAdminDashboard);


export { router };
