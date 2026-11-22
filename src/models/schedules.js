import { Schedule } from "./schemas/schedules.js";

const getSchedulesByTripId = async (tripId, month = null) => {
    const filter = tripId;

    //console.log(tripId);
    //console.log(filter);

    if(month != null){
        filter.operatingMonths = month;
    }

    const schedules = await Schedule.find({ tripId: filter }).populate({ path: "trip", select: "operatingMonths -_id" }).lean();

    return schedules;
}


export {getSchedulesByTripId};