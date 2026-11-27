//src/models/trains.js. 
import train from "./schemas/trains.js";

export async function getTrainById(id) {
  return train.findOne({ id }).lean();
}

export async function getAllTrains() {
  return train.find({}).lean();
}


// Adding pagination feature to trips API modle function
export const getPaginatedTrains = async ({ filter = {}, page, limit, sort, order }) => {
  const skip = (page - 1) * limit;
  const sortOptions = { [sort]: order };

  const [trains, totalItems] = await Promise.all([
    train.find(filter).sort(sortOptions).skip(skip).limit(limit),
    train.countDocuments(filter)
  ]);

  return { trains, totalItems };
}