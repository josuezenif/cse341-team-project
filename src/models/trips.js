import trips from "./schemas/trips.js";
import { getDb } from "../db/connect.js";

const getAllTrips = async () => {
    const allTrips = trips.find({}).lean();
    return allTrips;
}

const getTripById = async (tripId) => {
    const trip = trips.findOne({ id: tripId });
    return trip;
}

export { getAllTrips, getTripById };