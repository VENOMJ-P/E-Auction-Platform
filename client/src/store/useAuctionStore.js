import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuctionStore = create((set, get) => ({
  auctions: [],
  selectedAuction: null,
  userAuctions: [],
  isLoading: false,
  isCreating: false,
  isFetching: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  fetchAuctions: async (params = {}) => {
    set({ isFetching: true });
    try {
      const { status, page = 1, limit = 10 } = params;
      const res = await axiosInstance.get("/auctions", {
        params: { status, page, limit },
      });

      set({
        auctions: res.data.data.auctions,
        pagination: res.data.data.pagination,
      });
    } catch (error) {
      console.error("Fetch auctions error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch auctions");
    } finally {
      set({ isFetching: false });
    }
  },

  fetchAuctionById: async (auctionId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/auctions/${auctionId}`);
      set({ selectedAuction: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Fetch auction error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch auction");
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createAuction: async (auctionData) => {
    set({ isCreating: true });
    try {
      const res = await axiosInstance.post("/auctions", auctionData);
      set((state) => ({
        auctions: [res.data.data, ...state.auctions],
      }));

      toast.success("Auction created successfully");
      return res.data.data;
    } catch (error) {
      console.error("Create auction error:", error);
      toast.error(error.response?.data?.message || "Failed to create auction");
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  fetchUserAuctions: async (type = "created") => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/auctions/my-auctions", {
        params: { type },
      });
      set({ userAuctions: res.data.data });
    } catch (error) {
      console.error("Fetch user auctions error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch your auctions"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  endAuction: async (auctionId) => {
    try {
      const res = await axiosInstance.patch(`/auctions/${auctionId}/end`);
      set((state) => ({
        auctions: state.auctions.map((auction) =>
          auction._id === auctionId ? { ...auction, status: "ENDED" } : auction
        ),
        selectedAuction:
          state.selectedAuction?._id === auctionId
            ? { ...state.selectedAuction, status: "ENDED" }
            : state.selectedAuction,
      }));

      toast.success("Auction ended successfully");
      return res.data.data;
    } catch (error) {
      console.error("End auction error:", error);
      toast.error(error.response?.data?.message || "Failed to end auction");
      throw error;
    }
  },

  updateAuction: (updatedAuction) => {
    set((state) => ({
      auctions: state.auctions.map((auction) =>
        auction._id === updatedAuction._id ? updatedAuction : auction
      ),
      selectedAuction:
        state.selectedAuction?._id === updatedAuction._id
          ? updatedAuction
          : state.selectedAuction,
    }));
  },

  setSelectedAuction: (auction) => {
    set({ selectedAuction: auction });
  },

  clearSelectedAuction: () => {
    set({ selectedAuction: null });
  },

  addBidToAuction: (auctionId, bidData) => {
    set((state) => {
      const updatedAuctions = state.auctions.map((auction) => {
        if (auction._id === auctionId) {
          return {
            ...auction,
            ...bidData.auction,
            bids: bidData.auction.bids || auction.bids,
          };
        }
        return auction;
      });

      const updatedSelectedAuction =
        state.selectedAuction?._id === auctionId
          ? {
              ...state.selectedAuction,
              ...bidData.auction,
              bids: bidData.auction.bids || state.selectedAuction.bids,
            }
          : state.selectedAuction;

      return {
        auctions: updatedAuctions,
        selectedAuction: updatedSelectedAuction,
      };
    });
  },

  markAuctionEnded: (auctionId, winnerData) => {
    set((state) => ({
      auctions: state.auctions.map((auction) =>
        auction._id === auctionId
          ? {
              ...auction,
              status: "ENDED",
              winner: winnerData?.winner,
            }
          : auction
      ),
      selectedAuction:
        state.selectedAuction?._id === auctionId
          ? {
              ...state.selectedAuction,
              status: "ENDED",
              winner: winnerData?.winner,
            }
          : state.selectedAuction,
    }));
  },

  searchAuctions: async (searchTerm) => {
    set({ isFetching: true });
    try {
      const res = await axiosInstance.get("/auctions", {
        params: { search: searchTerm },
      });
      set({ auctions: res.data.data.auctions });
    } catch (error) {
      console.error("Search auctions error:", error);
      toast.error("Failed to search auctions");
    } finally {
      set({ isFetching: false });
    }
  },

  filterAuctionsByStatus: async (statuses) => {
    await get().fetchAuctions({ status: statuses.join(",") });
  },

  reset: () => {
    set({
      auctions: [],
      selectedAuction: null,
      userAuctions: [],
      isLoading: false,
      isCreating: false,
      isFetching: false,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    });
  },
}));
