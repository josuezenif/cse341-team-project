import trips from "./schemas/trips.js";
import { getDb } from "../db/connect.js";

const getAllTrips = async ({
    filter = {},
    skip = 0,
    limit = 10,
    sort = { name: 1 }
} = {}) => {
    const [data, totalItems] = await Promise.all([
        trips.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        trips.countDocuments(filter)
    ]);

    return { data, totalItems };
}

const getTripById = async (tripId) => {
    const trip = trips.findOne({ id: tripId });
    return trip;
}

export { getAllTrips, getTripById };