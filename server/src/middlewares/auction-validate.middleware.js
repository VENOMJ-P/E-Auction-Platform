import { errorResponse } from "../utils/response.handler.js";

export const validateCreateAuction = (req, res, next) => {
  const { item_name, base_price, bid_type, start_time, end_time } = req.body;

  if (!item_name || !base_price || !bid_type || !start_time || !end_time) {
    return errorResponse(res, 400, "Please provide all required fields");
  }

  if (base_price <= 0) {
    return errorResponse(res, 400, "Base price must be greater than 0");
  }

  if (!["HIGHEST", "LOWEST"].includes(bid_type)) {
    return errorResponse(res, 400, "Bid type must be either HIGHEST or LOWEST");
  }

  if (new Date(start_time) >= new Date(end_time)) {
    return errorResponse(res, 400, "End time must be after start time");
  }

  if (new Date(start_time) < new Date()) {
    return errorResponse(res, 400, "Start time cannot be in the past");
  }

  next();
};
