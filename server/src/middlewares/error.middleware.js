import { errorResponse } from "../utils/response.handler.js";

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    return errorResponse(res, error.statusCode, error.message, error.stack);
  }

  return errorResponse(res, error.statusCode, error.message);
};
