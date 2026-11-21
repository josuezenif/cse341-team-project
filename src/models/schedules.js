import { Schedule } from "./schemas/schedules.js";

const getSchedulesByTripId = async (tripId, month = null) => {
    const filter = {tripId};

    if(month != null){
        filter.operatingMonths = month;
    }

    const schedules = await Schedule.find().lean();
    console.log(schedules);

    return schedules;
}


export {getSchedulesByTripId};