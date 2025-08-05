import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({
        authUser: res.data.data,
      });
      return res.data.data;
    } catch (error) {
      console.log(error);
      set({ authUser: null });
      return null;
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.data });
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      return false;
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.data });
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },
}));
