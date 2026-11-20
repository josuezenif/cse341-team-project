import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        }
    },
    { _id: false }
);

const bookingsSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        passengers: {
            type: [passengerSchema],
            required: true,
            validate: {
                validator: (passengers) => passengers.length > 0,
                message: 'A booking must include at least one passenger.'
            }
        },
        scheduleId: {
            type: String,
            required: true,
            trim: true
        },
        tripId: {
            type: String,
            required: true,
            trim: true
        },
        ticketClass: {
            type: String,
            required: true,
            trim: true
        },
        selectedDay: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (document, booking) => {
                delete booking._id;
                return booking;
            }
        },
        collection: 'bookings'
    }
);

const bookings = mongoose.model('bookings', bookingsSchema);

export default bookings;
