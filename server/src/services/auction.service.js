import Auction from "../models/auction.model.js";
import { validateBid, getUserPosition } from "../utils/auction.utils.js";

export async function handleJoinAuction(socket, auctionId) {
  try {
    const auction = await Auction.findById(auctionId).populate(
      "user_id",
      "fullName email"
    );
    if (!auction) {
      socket.emit("error", { message: "Auction not found" });
      return;
    }

    socket.join(`auction-${auctionId}`);
    socket.emit("auction-joined", {
      auctionId,
      auction: {
        ...auction.toObject(),
        userBids: auction.bids.filter(
          (bid) => bid.user_id.toString() === socket.user._id.toString()
        ),
      },
    });

    socket.emit("auction-update", auction);
  } catch (error) {
    socket.emit("error", { message: "Failed to join auction" });
  }
}

export function handleLeaveAuction(socket, auctionId) {
  socket.leave(`auction-${auctionId}`);
}

export async function handlePlaceBid(socket, io, data) {
  try {
    const { auctionId, amount } = data;
    const userId = socket.user._id;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      socket.emit("bid-error", { message: "Auction not found" });
      return;
    }

    if (auction.status !== "LIVE") {
      socket.emit("bid-error", { message: "Auction is not live" });
      return;
    }

    if (new Date() < new Date(auction.start_time)) {
      socket.emit("bid-error", { message: "Auction hasn't started yet" });
      return;
    }

    if (new Date() > new Date(auction.end_time)) {
      socket.emit("bid-error", { message: "Auction has ended" });
      return;
    }

    const isValidBid = validateBid(auction, amount);
    if (!isValidBid.valid) {
      socket.emit("bid-error", { message: isValidBid.message });
      return;
    }

    if (auction.user_id.toString() === userId.toString()) {
      socket.emit("bid-error", {
        message: "Auction creator cannot bid on their own auction",
      });
      return;
    }

    auction.bids = auction.bids.filter(
      (bid) => bid.user_id.toString() !== userId.toString()
    );

    const newBid = {
      user_id: userId,
      amount: amount,
      time: new Date(),
    };

    auction.bids.push(newBid);

    if (auction.bid_type === "HIGHEST") {
      const highestBid = Math.max(...auction.bids.map((bid) => bid.amount));
      if (amount === highestBid) {
        auction.current_bid = amount;
        auction.current_bidder_id = userId;
      }
    } else {
      const lowestBid = Math.min(...auction.bids.map((bid) => bid.amount));
      if (amount === lowestBid) {
        auction.current_bid = amount;
        auction.current_bidder_id = userId;
      }
    }

    await auction.save();

    await auction.populate("user_id", "fullName email");
    await auction.populate("current_bidder_id", "fullName email");

    io.to(`auction-${auctionId}`).emit("bid-placed", {
      auction: auction.toObject(),
      newBid: {
        ...newBid,
        user_name: socket.user.fullName,
      },
    });

    socket.emit("bid-success", {
      message: "Bid placed successfully",
      userPosition: getUserPosition(auction, userId),
    });
  } catch (error) {
    console.error("Bid placement error:", error);
    socket.emit("bid-error", { message: "Failed to place bid" });
  }
}
