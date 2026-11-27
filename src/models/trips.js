import Trips from "./schemas/trips.js";
import { getDb } from "../db/connect.js";

const getAllTrips = async () => {
    const allTrips = Trips.find({}).lean();
    return allTrips;
}

const getTripById = async (tripId) => {
    const trip = Trips.findOne({ id: tripId });
    return trip;
}

export { getAllTrips, getTripById };