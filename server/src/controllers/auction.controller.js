import Auction from "../models/auction.model.js";
import { successResponse, errorResponse } from "../utils/response.handler.js";
import { io } from "../index.js";

export const createAuction = async (req, res) => {
  try {
    const {
      item_name,
      description,
      base_price,
      bid_type,
      bid_interval,
      start_time,
      end_time,
    } = req.body;

    // Validation
    if (!item_name || !base_price || !bid_type || !start_time || !end_time) {
      return errorResponse(res, 400, "Please provide all required fields");
    }

    if (new Date(start_time) >= new Date(end_time)) {
      return errorResponse(res, 400, "End time must be after start time");
    }

    if (new Date(start_time) < new Date()) {
      return errorResponse(res, 400, "Start time cannot be in the past");
    }

    const auction = new Auction({
      user_id: req.user._id,
      item_name,
      description,
      base_price,
      bid_type,
      bid_interval: bid_interval || 1,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      current_bid: bid_type === "HIGHEST" ? 0 : Number.MAX_SAFE_INTEGER,
      status: "PENDING",
    });

    await auction.save();
    await auction.populate("user_id", "fullName email");

    return successResponse(res, 201, "Auction created successfully", auction);
  } catch (error) {
    console.error("Create auction error:", error);
    return errorResponse(res, 500, "Failed to create auction", error);
  }
};

export const getAllAuctions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build query object
    let query = {};
    if (status) {
      // Convert status to array if it's a comma-separated string
      const statusArray = Array.isArray(status) ? status : status.split(",");
      // Validate statuses
      const validStatuses = ["LIVE", "ENDED", "PENDING"];
      const filteredStatuses = statusArray.filter((s) =>
        validStatuses.includes(s.toUpperCase())
      );

      if (filteredStatuses.length > 0) {
        query.status = { $in: filteredStatuses };
      }
    }

    const auctions = await Auction.find(query)
      .populate("user_id", "fullName email")
      .populate("current_bidder_id", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Auction.countDocuments(query);

    return successResponse(res, 200, "Auctions fetched successfully", {
      auctions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch auctions", error);
  }
};
export const getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id)
      .populate("user_id", "fullName email")
      .populate("current_bidder_id", "fullName email")
      .populate("bids.user_id", "fullName email");

    if (!auction) {
      return errorResponse(res, 404, "Auction not found");
    }

    // Filter bids to show only user's own bids if not the auction creator
    let responseAuction = auction.toObject();
    if (auction.user_id._id.toString() !== req.user._id.toString()) {
      responseAuction.bids = auction.bids.filter(
        (bid) => bid.user_id._id.toString() === req.user._id.toString()
      );
    }

    return successResponse(
      res,
      200,
      "Auction fetched successfully",
      responseAuction
    );
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch auction", error);
  }
};

export const getUserAuctions = async (req, res) => {
  try {
    const { type = "created" } = req.query; // created or participated

    let query = {};
    if (type === "created") {
      query.user_id = req.user._id;
    } else {
      query["bids.user_id"] = req.user._id;
    }

    const auctions = await Auction.find(query)
      .populate("user_id", "fullName email")
      .populate("current_bidder_id", "fullName email")
      .sort({ createdAt: -1 });

    return successResponse(
      res,
      200,
      "User auctions fetched successfully",
      auctions
    );
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch user auctions", error);
  }
};

export const endAuction = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id);
    if (!auction) {
      return errorResponse(res, 404, "Auction not found");
    }

    // Check if user is the auction creator
    if (auction.user_id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized to end this auction");
    }

    if (auction.status === "ENDED") {
      return errorResponse(res, 400, "Auction already ended");
    }

    auction.status = "ENDED";
    await auction.save();

    // Emit auction ended event
    io.to(`auction-${auction._id}`).emit("auction-ended", {
      auctionId: auction._id,
      winner: auction.current_bidder_id
        ? {
            id: auction.current_bidder_id,
            amount: auction.current_bid,
          }
        : null,
    });

    return successResponse(res, 200, "Auction ended successfully", auction);
  } catch (error) {
    console.error("End auction error:", error);
    return errorResponse(res, 500, "Failed to end auction", error);
  }
};
