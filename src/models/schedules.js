import { Schedule } from "./schemas/schedules.js";

const getSchedulesByTripId = async (tripId, month = null) => {
    const filter = tripId;

    //console.log(tripId);
    //console.log(filter);

    if(month != null){
        filter.operatingMonths = month;
    }

    const schedules = await Schedule.find({ tripId: filter }).populate({ path: "trip", select: "operatingMonths -_id" }).lean();
    //utilizes the virtual schema to populate the field of operatingMonths into the trip field

    const result = schedules.map(({ trip, id, tripId, ...rest }) => ({ // ...rest refers to the rest of the json response
        // this merely reformats the json response so that operatingMonths is JUST BELOW tripId, and gets rid of the trip field.
      id,
      tripId,
      operatingMonths: trip?.operatingMonths ?? [],
      ...rest,
    }));

    return result;
}


export {getSchedulesByTripId};