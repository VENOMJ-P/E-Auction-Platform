import mongoose from "mongoose";

import { MONGODB_URL } from "./server.config.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URL);
    console.log("Database connected successfully", conn.connection.host);
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
};
