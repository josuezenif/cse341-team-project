import {
  getAllTicketClasses,
  getTicketClassesForDay,
} from "../models/ticket-classes.js";

const validDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const getAllTicketClassesHandler = async (req, res) => {
  try {
    const ticketClasses = await getAllTicketClasses();

    return res.status(200).json(ticketClasses);
  } catch (error) {
    console.error("Error fetching ticket classes:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve ticket classes.",
    });
  }
};

export const getTicketClassesForDayHandler = async (req, res) => {
  try {
    const day = req.query.day?.trim().toLowerCase();

    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: "Invalid weekday provided.",
      });
    }

    const ticketClasses = await getTicketClassesForDay(day);

    return res.status(200).json(ticketClasses);
  } catch (error) {
    console.error("Error fetching ticket classes by day:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve ticket classes.",
    });
  }
};