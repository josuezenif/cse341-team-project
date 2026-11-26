import ticketClass from "./schemas/ticket-classes.js";

const ticketClassAvailability = {
  standard: [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ],
  premium: [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ],
  first: [
    "friday", 
    "saturday", 
    "sunday"],
};

export async function getAllTicketClasses() {
  return ticketClass.find({}).lean();
}

export async function getTicketClassesForDay(day) {
  const normalizedDay = day.toLowerCase();

  const allClasses = await getAllTicketClasses();

  return allClasses.map((item) => ({
    ...item,
    available: ticketClassAvailability[item.class]?.includes(normalizedDay) ?? false,
  }));
}