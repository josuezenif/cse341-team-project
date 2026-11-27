import mongoose from "mongoose";

const ticketClassSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pricePerKm: {
    type: Number,
    required: true,
    min: 0,
  },
  amenities: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
});

const ticketClass = mongoose.model(
  "TicketClass",
  ticketClassSchema,
  "ticketClasses"
);

export default ticketClass;