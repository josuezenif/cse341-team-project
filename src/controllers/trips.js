import { getAllTrips, getTripById } from "../models/trips.js";
import { getDb } from "../db/connect.js";

const getAllTripsHandler = async (req, res) => {
    try {
        const pageValue = req.query.page ?? '1';
        const limitValue = req.query.limit ?? '10';
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const region = typeof req.query.region === 'string' ? req.query.region.trim() : '';
        const season = typeof req.query.season === 'string' ? req.query.season.trim() : '';
        const sortValue = req.query.sort ?? 'name';
        const allowedSortFields = new Set(['name', 'region', 'bestSeason']);
        if (!/^\d+$/.test(pageValue) || Number(pageValue) < 1) {
            return res.status(400).json({ error: 'The page parameter must be a positive integer.' });
        }
        if (!/^\d+$/.test(limitValue) || Number(limitValue) < 1 || Number(limitValue) > 100) {
            return res.status(400).json({ error: 'The limit parameter must be an integer from 1 to 100.' });
        }
        if (!allowedSortFields.has(sortValue)) {
            return res.status(400).json({ error: 'The sort parameter must be name, region, or bestSeason.' });
        }
        if (req.query.order && !['asc', 'desc'].includes(req.query.order)) {
            return res.status(400).json({ error: 'The order parameter must be either asc or desc.' });
        }

        const page = Number(pageValue);
        const limit = Number(limitValue);
        const skip = (page - 1) * limit;
        const filter = {};
        if (region && region !== 'all') filter.region = region;
        if (season && season !== 'all') filter.bestSeason = season;
        if (q) {
            const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(escapedQuery, 'i');
            filter.$or = [{ name: pattern }, { description: pattern }];
        }
        const direction = req.query.order === 'desc' ? -1 : 1;
        const result = await getAllTrips({
            filter,
            skip,
            limit,
            sort: { [sortValue]: direction }
        });
        const totalPages = Math.ceil(result.totalItems / limit);

        return res.status(200).json({
            data: result.data,
            metadata: {
                totalItems: result.totalItems,
                totalPages,
                currentPage: page,
                limit,
                search: q,
                region: region || 'all',
                season: season || 'all',
                sort: sortValue,
                order: req.query.order === 'desc' ? 'desc' : 'asc'
            }
        });
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