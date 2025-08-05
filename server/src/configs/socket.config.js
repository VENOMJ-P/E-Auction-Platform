import { socketAuth } from "../middlewares/socket-middleware.js";
import {
  handleJoinAuction,
  handleLeaveAuction,
  handlePlaceBid,
} from "../services/auction.service.js";

export function initializeSocket(io) {
  // Socket.IO authentication middleware
  io.use(socketAuth);

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log(`User ${socket.user.fullName} connected: ${socket.id}`);

    socket.on("join-auction", (auctionId) =>
      handleJoinAuction(socket, auctionId)
    );
    socket.on("leave-auction", (auctionId) =>
      handleLeaveAuction(socket, auctionId)
    );
    socket.on("place-bid", (data) => handlePlaceBid(socket, io, data));

    socket.on("disconnect", () => {
      console.log(`User ${socket.user.fullName} disconnected: ${socket.id}`);
    });
  });
}
