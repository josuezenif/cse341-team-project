import bookings from './schemas/bookings.js';

const createBooking = async (bookingData) => {
    const normalizedBooking = {
        ...bookingData,
        passengers: Array.isArray(bookingData.passengers)
            ? bookingData.passengers.map((passenger) => ({
                ...passenger,
                email: typeof passenger.email === 'string'
                    ? passenger.email.trim().toLowerCase()
                    : passenger.email
            }))
            : bookingData.passengers
    };
    const booking = new bookings(normalizedBooking);
    return booking.save();
};

const getAllBookings = async () => bookings.find({}).select('-_id').lean();

const getBookingById = async (id) => bookings.findOne({ id }).select('-_id').lean();

const getBookingsByPassengerEmail = async (email) => bookings
    .find({ 'passengers.email': email.trim().toLowerCase() })
    .select({
        _id: 0,
        id: 1,
        'passengers.firstName': 1,
        'passengers.lastName': 1,
        'passengers.email': 1,
        scheduleId: 1,
        tripId: 1,
        ticketClass: 1,
        selectedDay: 1,
        createdAt: 1
    })
    .sort({ createdAt: -1 })
    .lean();

export { createBooking, getAllBookings, getBookingById, getBookingsByPassengerEmail };
