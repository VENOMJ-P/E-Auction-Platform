import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import AuctionPage from "./pages/AuctionPage";
import MyAuctionsPage from "./pages/MyAuctionPage";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader className="size-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Toaster position="top-center" />
      {authUser && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <AuctionPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-auctions"
          element={authUser ? <MyAuctionsPage /> : <Navigate to="/login" />}
        />
        <Route 
          path="/signup" 
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/login" 
          element={!authUser ? <LoginPage /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  );
};

export default App;