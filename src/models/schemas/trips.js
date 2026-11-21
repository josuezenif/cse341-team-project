import mongoose from "mongoose";

const tripsSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true
        },
        region: {
            type: String,
            required: true,
            trim: true
        },
        durationHours: {
            type: Number,
            required: true,
            min: 0
        },
        distanceKm: {
            type: Number,
            required: true,
            min: 0
        },
        bestSeason: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const trips = mongoose.model('trips', tripsSchema);
export default trips;