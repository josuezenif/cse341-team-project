import {getSchedulesByTripId} from "../models/schedules.js";


const getSchedulesForTrip = async(req,res) =>{
    try {
        const {tripId} = req.params.id;
        const allSchedules = await getSchedulesByTripId();

        console.log(allSchedules);

        if (!allSchedules) {
            return res.status(404).json({
            error: "Schedules not found",
            });
        }

        return res.status(200).json(allSchedules);
    } catch (error) {
        console.error("Error fetching schedules:", error);

        return res.status(500).json({
        error: "Failed to fetch schedules",
    });
    }
};

const getSchedulesForTripAndMonth = async(req,res) =>{
    try {
        const {id} = req.params.id;
        const {month} = Number(req.query.month);

        const monthSchedules = await getSchedulesByTripId()

        if (!monthSchedules) {
            return res.status(404).json({
            error: "Schedules not found",
            });
        }

        return res.status(200).json(monthSchedules);        
    } catch (error) {
        console.error("Error fetching schedules:", error);

        return res.status(500).json({
        error: "Failed to fetch schedules",
    });
    }
};

export {getSchedulesForTrip, getSchedulesForTripAndMonth};