import express from 'express';
import { getTripDetails, getTripsList } from '../controllers/trips.js';

const router = express.Router();

// Trip page
router.get('/trips/:_id', getTripDetails);

// Trips list (all trips listed)
router.get('/trips', getTripsList);

export { router as ejsRouter };
