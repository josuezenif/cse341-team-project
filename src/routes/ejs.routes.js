import express from 'express';
import { getTripDetails, getTripsList } from '../controllers/trips.js';
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
router.get('/:_id', getTripDetails);

// Trips list (all trips listed)
router.get('/', getTripsList);

export { router };
