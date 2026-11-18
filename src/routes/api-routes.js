import express from "express";
import { getAllTripsHandler, getTripByIdHandler } from "../controllers/trips.js";
import { getAllStations, getStationById } from "../controllers/stations.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB document ID
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *         region:
 *           type: string
 *         durationHours:
 *           type: number
 *         distanceKm:
 *           type: number
 *         bestSeason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Station:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - prefecture
 *         - region
 *         - facilities
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           example: nagoya
 *         name:
 *           type: string
 *         prefecture:
 *           type: string
 *         region:
 *           type: string
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: A list of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       500:
 *         description: Internal service error while retrieving trips
 */
router.get('/trips', getAllTripsHandler);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The trip's MongoDB document ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested trip
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Internal service error while retrieving the trip
 */
router.get('/trips/:_id', getTripByIdHandler);

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Get all stations
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: A list of stations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 *       500:
 *         description: Internal service error while retrieving stations
 */
router.get('/stations', getAllStations);

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Get a station by ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The station's custom ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested station
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       404:
 *         description: Station not found
 *       500:
 *         description: Internal service error while retrieving the station
 */
router.get('/stations/:id', getStationById);

export { router };