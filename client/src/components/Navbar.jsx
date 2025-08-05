import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Gavel } from 'lucide-react';

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Gavel className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold">E-Auction Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            {authUser ? (
              <>
                {/* <button
                  onClick={() => navigate('/')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  All Auctions
                </button>
                <button
                  onClick={() => navigate('/my-auctions')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  My Auctions
                </button> */}
                <span className="text-sm text-gray-600">Welcome, <span className="font-medium">{authUser.fullName}</span></span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;