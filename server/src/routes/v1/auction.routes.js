import express from "express";

import {
  createAuction,
  getAllAuctions,
  getAuctionById,
  getUserAuctions,
  endAuction,
} from "../../controllers/auction.controller.js";
import { protectRoute } from "../../middlewares/auth.middleware.js";
import { validateCreateAuction } from "../../middlewares/auction-validate.middleware.js";

const router = express.Router();

router.use(protectRoute); // All auction routes require authentication

router.post("/", validateCreateAuction, createAuction);
router.get("/", getAllAuctions);
router.get("/my-auctions", getUserAuctions);
router.get("/:id", getAuctionById);
router.patch("/:id/end", endAuction);

export default router;
