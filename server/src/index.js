import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";

import appRoutes from "./routes/index.routes.js";
import { PORT } from "./configs/server.config.js";
import { connectDB } from "./configs/database.config.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { initializeSocket } from "./configs/socket.config.js";
import { startCronJobs } from "./utils/jobs.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`URL: ${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", appRoutes);
app.use(errorHandler);

// Initialize Socket.IO
initializeSocket(io);

// Start cron jobs
startCronJobs(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

export { io };
