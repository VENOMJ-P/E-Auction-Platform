import { Router } from "express";
import authRoutes from "./auth.routes.js";
import auctionRoutes from "./auction.routes.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/auctions", auctionRoutes);

export default router;
