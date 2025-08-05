import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  connectionStatus: "disconnected",

  // Initialize socket connection
  initializeSocket: (authUser) => {
    if (!authUser || get().socket?.connected) return;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    console.log(token);

    const newSocket = io("http://localhost:5000", {
      auth: {
        token: token,
      },
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      set({
        isConnected: true,
        connectionStatus: "connected",
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      set({
        isConnected: false,
        connectionStatus: "disconnected",
      });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      set({
        isConnected: false,
        connectionStatus: "error",
      });
      toast.error("Failed to connect to auction server", error);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      toast.error(error.message || "Socket error occurred");
    });

    set({ socket: newSocket });
  },

  // Disconnect socket
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        connectionStatus: "disconnected",
      });
    }
  },

  // Join auction room
  joinAuction: (auctionId) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit("join-auction", auctionId);
    }
  },

  // Leave auction room
  leaveAuction: (auctionId) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit("leave-auction", auctionId);
    }
  },

  // Place bid
  placeBid: (auctionId, amount) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit("place-bid", { auctionId, amount });
    } else {
      toast.error("Not connected to auction server");
    }
  },

  // Subscribe to auction events
  subscribeToAuctionEvents: (callbacks) => {
    const socket = get().socket;
    if (!socket) return () => {};

    const {
      onAuctionJoined,
      onAuctionUpdate,
      onBidPlaced,
      onBidSuccess,
      onBidError,
      onAuctionEnded,
    } = callbacks;

    // Join auction confirmation
    if (onAuctionJoined) {
      socket.on("auction-joined", onAuctionJoined);
    }

    // Auction updates (current bid changes, etc.)
    if (onAuctionUpdate) {
      socket.on("auction-update", onAuctionUpdate);
    }

    // New bid placed by any user
    if (onBidPlaced) {
      socket.on("bid-placed", onBidPlaced);
    }

    // Bid success confirmation for current user
    if (onBidSuccess) {
      socket.on("bid-success", onBidSuccess);
    }

    // Bid error for current user
    if (onBidError) {
      socket.on("bid-error", onBidError);
    }

    // Auction ended
    if (onAuctionEnded) {
      socket.on("auction-ended", onAuctionEnded);
    }

    // Return cleanup function
    return () => {
      if (onAuctionJoined) socket.off("auction-joined", onAuctionJoined);
      if (onAuctionUpdate) socket.off("auction-update", onAuctionUpdate);
      if (onBidPlaced) socket.off("bid-placed", onBidPlaced);
      if (onBidSuccess) socket.off("bid-success", onBidSuccess);
      if (onBidError) socket.off("bid-error", onBidError);
      if (onAuctionEnded) socket.off("auction-ended", onAuctionEnded);
    };
  },

  // Get socket instance for direct use
  getSocket: () => get().socket,
}));
