import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    id: {
      type:Number,
      required:true
    },
    tripId: {
      type: String,
      ref: "trips",
      required: true
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

scheduleSchema.virtual("trip", {
  ref: "trips",             // must match the name used in mongoose.model(...) for the collection referenced
  localField: "tripId",     // field in this schedule
  foreignField: "id",       // custom ID field in the Trip document
  justOne: true,
});

const Schedule = mongoose.model('schedules', scheduleSchema);
export { Schedule };