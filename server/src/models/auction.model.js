import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const bidSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const auctionSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    item_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    base_price: {
      type: Number,
      required: true,
      min: 0,
    },
    bid_type: {
      type: String,
      enum: ["HIGHEST", "LOWEST"],
      required: true,
    },
    bid_interval: {
      type: Number,
      required: true,
      min: 1,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    current_bid: {
      type: Number,
      default: null,
    },
    current_bidder_id: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "LIVE", "ENDED"],
      default: "PENDING",
    },
    bids: [bidSchema],
  },
  { timestamps: true }
);

const Auction = model("Auction", auctionSchema);

export default Auction;
