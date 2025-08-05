import cron from "node-cron";
import Auction from "../models/auction.model.js";

export function startCronJobs(io) {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Update PENDING auctions to LIVE when start_time is reached
      const pendingAuctions = await Auction.find({
        status: "PENDING",
        start_time: { $lte: now },
      });

      for (const auction of pendingAuctions) {
        auction.status = "LIVE";
        await auction.save();
        io.to(`auction-${auction._id}`).emit("auction-started", {
          auctionId: auction._id,
        });
      }

      // Update LIVE auctions to ENDED when end_time is reached
      const expiredAuctions = await Auction.find({
        status: "LIVE",
        end_time: { $lte: now },
      });

      for (const auction of expiredAuctions) {
        auction.status = "ENDED";
        await auction.save();

        io.to(`auction-${auction._id}`).emit("auction-ended", {
          auctionId: auction._id,
          winner: auction.current_bidder_id
            ? {
                id: auction.current_bidder_id,
                amount: auction.current_bid,
              }
            : null,
        });
      }
    } catch (error) {
      console.error("Error processing auctions:", error);
    }
  });
}
