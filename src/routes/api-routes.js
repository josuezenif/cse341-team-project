import express from "express";
import { getAllTripsHandler, getTripByIdHandler } from "../controllers/trips.js";
import { getAllStations, getStationById } from "../controllers/stations.js";
import { requireApiLogin, requireApiRole } from "../middleware/auth.js";
import {
  createBookingHandler,
  getAllBookings,
  getBookingByIdHandler
} from "../controllers/bookings.js";

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
 *     BookingPassenger:
 *       type: object
 *       required: [firstName, lastName, email, phone]
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *     CreateBooking:
 *       type: object
 *       required: [passengers, scheduleId, tripId, ticketClass, selectedDay]
 *       properties:
 *         passengers:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/BookingPassenger'
 *         scheduleId:
 *           type: string
 *           example: "1"
 *         tripId:
 *           type: string
 *           example: alpine-panorama
 *         ticketClass:
 *           type: string
 *           example: standard
 *         selectedDay:
 *           type: string
 *           example: monday
 *     Booking:
 *       type: object
 *       required: [id, passengers, scheduleId, tripId, ticketClass, selectedDay, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           example: JR8K2M4P1
 *         passengers:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/BookingPassenger'
 *         scheduleId:
 *           type: string
 *           example: "1"
 *         tripId:
 *           type: string
 *           example: alpine-panorama
 *         ticketClass:
 *           type: string
 *           example: standard
 *         selectedDay:
 *           type: string
 *           example: monday
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ApiError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         description: The trip's custom ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/stations/:id', getStationById);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Internal service error while retrieving bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBooking'
 *           example:
 *             passengers:
 *               - firstName: Alex
 *                 lastName: Smith
 *                 email: alex@example.com
 *                 phone: "+81 90-1234-5678"
 *             scheduleId: "1"
 *             tripId: alpine-panorama
 *             ticketClass: standard
 *             selectedDay: monday
 *     responses:
 *       201:
 *         description: Booking created
 *         headers:
 *           Location:
 *             description: URL of the created booking
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid booking details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Booking reference conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal service error while creating booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/bookings', getAllBookings);
router.post('/bookings', createBookingHandler);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         description: The booking reference
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal service error while retrieving the booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/bookings/:bookingId', getBookingByIdHandler);

export { router };