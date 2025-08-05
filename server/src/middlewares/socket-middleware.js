import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const socketAuth = async (socket, next) => {
  try {
    console.log(
      "Socket Auth",
      socket.handshake.auth.token,
      socket.handshake.headers.cookie?.split("jwt=")[1]?.split(";")[0]
    );
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.cookie?.split("jwt=")[1]?.split(";")[0];

    if (!token) {
      return next(new Error("Authentication error - No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("Authentication error - User not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error - Invalid token"));
  }
};
