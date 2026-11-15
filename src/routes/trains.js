import { getDb } from '../db/connect.js';
import { getAllTrains } from '../models/trains.js';

const trainsPage = (req, res) => {
    res.render('trains', { title: 'Trains' });
};

const trainsApi = async (req, res, next) => {
    try {
        // const trains = await getDb().collection('trains').find({}).toArray();
        const trains = await getAllTrains();
        return res.json({ trains });
    } catch (error) {
        return next(error);
    }
};

export { trainsApi, trainsPage };
