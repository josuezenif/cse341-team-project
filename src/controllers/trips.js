import { getAllTrips, getTripById } from "../models/trips.js";
import { getDb } from "../db/connect.js";

const getAllTripsHandler = async (req, res) => {
    try {
        const trips = await getAllTrips();
        return res.status(200).json(trips);
    }

    catch (error) {
        return res.status(500).json({ message: "Internal service error! Couldn't retrieve trips!" });
    }
}

const getTripByIdHandler = async (req, res) => {
    try {
        const id = req.params._id;
        const trip = await getTripById(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found given id!" });
        }

        return res.status(200).json(trip);
    }

    catch (error) {
        return res.status(500).json({ message: "Internal service error! Couldn't retrieve specified trip!" });
    }
}

async function getTripDetails(req, res, next) {
    try {
        const tripId = req.params.id;
        const trip = await getTripById(tripId);

        if (!trip) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found',
                error: 'Trip not found'
            });
        }

        const details = typeof trip.toObject === 'function' ? trip.toObject() : trip;
        details.schedules = await getDb().collection('schedules').find({ tripId }).toArray();

        return res.render('trips/details', {
            title: 'Trip Details',
            details
        });
    } catch (error) {
        console.error('Error rendering trip details:', error);
        return next(error);
    }
};

async function getTripsList(req, res) {
    const db = await getDb();
    const [regions, seasons] = await Promise.all([
        db.collection('trips').distinct('region'),
        db.collection('trips').distinct('bestSeason')
    ]);
    res.render('trips/list', {
        title: 'Scenic Train Trips',
        regions,
        seasons
    });
};


export { getAllTripsHandler, getTripByIdHandler, getTripDetails, getTripsList };