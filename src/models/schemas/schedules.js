import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trips",
      required: true,
    },
    departureTime: {
        type: String,
        required: true,
    },
    arrivalTime: {
        type: String,
        required: true
    },
    daysOfWeek: {
      type: [{
        type: String,
        enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      }],
      required: true,
    },
    status: {
        type: Boolean,
        required: true
    }
});

const Schedule = mongoose.model('schedules', scheduleSchema);
export { Schedule };