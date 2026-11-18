import bookings from './schemas/bookings.js';

const createBooking = async (bookingData) => {
    const booking = new bookings(bookingData);
    return booking.save();
};

const getAllBookings = async () => bookings.find({}).select('-_id').lean();

const getBookingById = async (id) => bookings.findOne({ id }).select('-_id').lean();

export { createBooking, getAllBookings, getBookingById };
