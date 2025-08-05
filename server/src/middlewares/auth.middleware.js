import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { errorResponse } from "../utils/response.handler.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("Protect Route Middleware", req.cookies.jwt);
    const token = req.cookies.jwt;
    if (!token) {
      return errorResponse(res, 401, "Unauthorized - No Token Provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return errorResponse(res, 401, "Unauthorized - Invalid Token");
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 501, "Something went wrong", error);
  }
};
