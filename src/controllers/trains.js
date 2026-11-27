//src/controllers/trains.js
import {
  getTrainById as findTrainById,
  getAllTrains as findAllTrains,
  getPaginatedTrains
} from "../models/trains.js";

export async function getTrainById(req, res) {
  try {
    const { id } = req.params;

    const train = await findTrainById(id);

    if (!train) {
      return res.status(404).json({
        error: "Train not found",
      });
    }

    return res.status(200).json(train);
  } catch (error) {
    console.error("Error fetching train:", error);

    return res.status(500).json({
      error: "Failed to fetch train",
    });
  }
}

export async function getAllTrains(req, res) {
  try {
    const trains = await findAllTrains();

    return res.status(200).json(trains);
  } catch (error) {
    console.error("Error fetching trains:", error);

    return res.status(500).json({
      error: "Failed to fetch trains",
    });
  }
}


// Paginated trips API controller function
const sortFields = ['name', 'type', 'powerSource'];

// convert string to number (integer) function
const parsePositiveInteger = (value, defaultVlaue) => { // default value == 2
  if (value === undefined) {
    return defaultVlaue;
  }

  const parsedNum = Number(value); // --- convert string to number
  if (!Number.isInteger(parsedNum) || parsedNum < 1) { // --- checks if number is less than 1
    return null;
  }

  return parsedNum;
}

export const getTrainsPaginated = async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 10);
    const sort = req.query.sort || 'name'; // 'name' is default value if no 'sort' value is added
    const order = req.query.order === 'desc' ? -1 : 1; // default order 'desc'

    if (!page || !limit || limit > 50) {
      return res.status(400).json({
        errors: [{
          field: 'pagination',
          message: 'page and limit must be valid integer numbers'
        }]
      });
    }
    if (sort && !sortFields.includes(sort)) {
      return res.status(400).json({
        errors: [{
          field: 'sort',
          message: 'Sort value not supported. Must be between: name, type, powerSource'
        }]
      });
    }

    const { trains, totalItems } = await getPaginatedTrains({
      filter: {},
      page,
      limit,
      sort,
      order
    });

    return res.status(200).json({
      data: trains,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNextPage: page * limit < totalItems,
        hasPreviousPage: page > 1
      }
    });
  }

  catch (error) {
    next(error);
  }
}