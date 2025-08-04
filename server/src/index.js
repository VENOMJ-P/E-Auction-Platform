import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import appRoutes from "./routes/index.routes.js";
import { PORT } from "./configs/server.config.js";
import { connectDB } from "./configs/database.config.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api", appRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});
