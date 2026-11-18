import express from "express";
import { getAllTripsHandler, getTripByIdHandler } from "../controllers/trips.js";
import { getAllBookings } from "../controllers/bookings.js";

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
 */
router.get('/bookings', getAllBookings);

export { router };