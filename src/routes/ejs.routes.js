import express from 'express';
import { getTripDetails, getTripsList } from '../controllers/trips.js';

const router = express.Router();

// Trip page
router.get('/:_id', getTripDetails);

// Trips list (all trips listed)
router.get('/', getTripsList);

export { router };
