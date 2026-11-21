import express from "express";
import { getAllTripsHandler, getTripByIdHandler } from "../controllers/trips.js";
import { requireApiLogin, requireApiRole } from "../middleware/auth.js";
import {
  createBookingHandler,
  getAllBookings,
  getBookingByIdHandler
} from "../controllers/bookings.js";
import { getSchedulesForTrip, getSchedulesForTripAndMonth } from "../controllers/schedules.js";

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
 *     Schedules:
 *        type: object
 *        required: id
 *        properties:
 *          id:
 *            type: String
 *            example: alpine-panorama
 *            required: true
 *          departureTime:
 *            type: String
 *            format: date-time
 *            example: "08:30"
 *            required: true
 *          arrivalTime:
 *            type: String
 *            format: date-time
 *            example: "13:00"
 *            required: true
 *          daysOfWeek:
 *            type: array
 *            items:
 *              type: string
 *            example:
 *              - monday
 *              - tuesday
 *              - wednesday
 *              - thursday
 *              - friday
 *          status: 
 *            type: Boolean
 *            example: true
 *            required: true
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
 *             example:
 *               - id: JR8K2M4P1
 *                 passengers:
 *                   - firstName: Alex
 *                     lastName: Smith
 *                     email: alex@example.com
 *                     phone: "+81 90-1234-5678"
 *                 scheduleId: "1"
 *                 tripId: alpine-panorama
 *                 ticketClass: standard
 *                 selectedDay: monday
 *                 createdAt: "2026-11-18T12:00:00.000Z"
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



 /**
 * @swagger
 * /api/trips/{id}/schedules:
 *   get:
 *     summary: Get schedules by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Thetrip reference
 *         schema:
 *           type: string
 *     responses: 
 *       200:
 *         description: the requested schedules
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedules'
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
router.get('/api/trips/:id/schedules', getSchedulesForTrip);
 
 /**
 * @swagger
 * /api/trips/{id}/schedules?month={month}:
 *   get:
 *     summary: Get schedules by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The trip reference
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         type: string
 *         description: The month number
 *     responses: 
 *       200:
 *         description: the requested schedules by month
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedules'
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
router.get('/api/trips/:id/schedules', getSchedulesForTripAndMonth);


export { router };