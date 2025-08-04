export const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: "error",
    message,
  });
};
