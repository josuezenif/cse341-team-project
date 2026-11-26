import { getDb } from '../db/connect.js';
import { generateBookingId } from '../includes/helpers.js';
import {
    createBooking,
    getAllBookings as findAllBookings,
    getBookingById,
    getBookingsByPassengerEmail
} from '../models/bookings.js';

const getAllBookings = async (req, res) => {
    try {
        const allBookings = await findAllBookings();
        return res.status(200).json(allBookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Something went wrong. Please try again later.'
            }
        });
    }
};

const getBookingByIdHandler = async (req, res) => {
    try {
        const booking = await getBookingById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: 'Booking not found.' }
            });
        }

        return res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Something went wrong. Please try again later.'
            }
        });
    }
};

const createBookingHandler = async (req, res) => {
    try {
        const booking = await createBooking({
            ...req.body,
            id: generateBookingId()
        });

        return res
            .status(201)
            .location(`/api/bookings/${booking.id}`)
            .json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        const status = error.name === 'ValidationError' ? 400 : error.code === 11000 ? 409 : 500;
        const message = status === 400
            ? 'The booking details are invalid.'
            : status === 409
                ? 'A booking with this reference already exists.'
                : 'Unable to save your booking right now.';

        return res.status(status).json({
            error: {
                code: status === 400 ? 'VALIDATION_ERROR' : status === 409 ? 'CONFLICT' : 'INTERNAL_ERROR',
                message: status === 500 ? 'Something went wrong. Please try again later.' : message
            }
        });
    }
};

const bookingFormPage = async (req, res) => {
    try {
        const db = getDb();
        const scheduleId = req.params.scheduleId || req.query.scheduleId;

        if (!scheduleId) {
            const schedules = await db.collection('schedules')
                .find({ status: true })
                .sort({ id: 1 })
                .toArray();
            const tripIds = [...new Set(schedules.map((schedule) => schedule.tripId))];
            const trips = await db.collection('trips')
                .find({ id: { $in: tripIds } })
                .toArray();
            const tripsById = new Map(trips.map((trip) => [trip.id, trip]));

            return res.render('bookings/new', {
                title: 'New Booking',
                schedules: schedules.map((schedule) => ({
                    ...schedule,
                    tripName: tripsById.get(schedule.tripId)?.name || schedule.tripId
                }))
            });
        }

        const schedule = await db.collection('schedules').findOne({ id: Number(scheduleId) });

        if (!schedule) {
            return res.status(404).render('errors/404', { title: 'Schedule Not Found' });
        }

        const trip = await db.collection('trips').findOne({ id: schedule.tripId });
        if (!trip) {
            return res.status(404).render('errors/404', { title: 'Trip Not Found' });
        }

        const ticketClasses = await db.collection('ticketClasses').find({}).toArray();
        const ticketOptions = ticketClasses.map((ticketClass) => ({
            class: ticketClass.class,
            name: ticketClass.name,
            price: trip.distance * ticketClass.pricePerKm,
            amenities: ticketClass.amenities,
            description: ticketClass.description
        }));

        return res.render('trips/book', {
            title: 'Book Trip',
            schedule,
            ticketOptions
        });
    } catch (error) {
        console.error('Error loading booking form:', error);
        return res.status(500).render('errors/500', {
            title: 'Unable to Load Booking',
            error: 'Unable to load the booking form.',
            stack: ''
        });
    }
};

const processBookingRequest = async (req, res) => {
    try {
        const booking = await createBooking({
            ...req.body,
            id: generateBookingId()
        });

        return res.redirect(`/trips/confirmation/${booking.id}`);
    } catch (error) {
        console.error('Error creating booking:', error);
        const status = error.name === 'ValidationError' ? 400 : error.code === 11000 ? 409 : 500;
        const message = status === 400
            ? 'The booking details are invalid. Please check the passenger and trip information.'
            : status === 409
                ? 'A booking with this reference already exists. Please submit again.'
                : 'Unable to save your booking right now. Please try again later.';

        return res.status(status).type('text').send(message);
    }
};

const bookingPage = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await getBookingById(bookingId);

        if (!booking) {
            return res.status(404).render('errors/404', { title: 'Booking Not Found' });
        }

        return res.render('trips/confirm', {
            title: 'Trip Booking',
            booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).render('errors/500', {
            title: 'Unable to Load Booking',
            error: 'Unable to retrieve this booking.',
            stack: ''
        });
    }
};

const bookingsAdminPage = (req, res) => {
    return res.render('bookings', { title: 'Bookings Admin' });
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await getBookingsByPassengerEmail(req.user.email);
        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching my bookings:', error);
        return res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Something went wrong. Please try again later.'
            }
        });
    }
};

export {
    bookingPage,
    bookingFormPage,
    bookingsAdminPage,
    createBookingHandler,
    getBookingByIdHandler,
    getAllBookings,
    processBookingRequest,
    getMyBookings
};
