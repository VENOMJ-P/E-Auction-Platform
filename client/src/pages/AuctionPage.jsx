import React, { useState, useEffect, useRef } from 'react';
import { Gavel, TrendingUp, TrendingDown, Timer, AlertCircle, CheckCircle, Users } from 'lucide-react';
import toast from "react-hot-toast";
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import { useAuctionStore } from '../store/useAuctionStore';
import AuctionCard from '../components/AuctionCard';
import BiddingInterface from '../components/BiddingInterface';
import CreateAuctionForm from '../components/CreateAuctionForm';
import { useNavigate } from 'react-router-dom';
import AuctionTimer from '../components/AuctionTimer';

const AuctionPage = () => {
  const { authUser } = useAuthStore();
  const [currentView, setCurrentView] = useState('auctions');
  const [statusFilters, setStatusFilters] = useState(['LIVE']);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // New state for filter menu
  const filterRef = useRef(null); // Ref for closing menu on outside click
  const navigate = useNavigate();
  
  const {
    socket,
    isConnected,
    connectionStatus,
    initializeSocket,
    disconnectSocket,
    subscribeToAuctionEvents,
    joinAuction,
    leaveAuction,
  } = useSocketStore();
  
  const {
    auctions,
    selectedAuction,
    isLoading,
    isCreating,
    isFetching,
    fetchAuctions,
    fetchAuctionById,
    createAuction,
    setSelectedAuction,
    clearSelectedAuction,
    updateAuction,
    addBidToAuction,
    markAuctionEnded,
  } = useAuctionStore();

  useEffect(() => {
    if (authUser) {
      initializeSocket(authUser);
      fetchAuctions({ status: statusFilters.join(',') });
    }

    return () => {
      disconnectSocket();
    };
  }, [authUser, initializeSocket, disconnectSocket, fetchAuctions, statusFilters]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const cleanup = subscribeToAuctionEvents({
      onAuctionJoined: (data) => {
        console.log('Joined auction:', data.auctionId);
        if (data.auction) {
          updateAuction(data.auction);
        }
      },
      onAuctionUpdate: (auction) => {
        console.log('Auction updated:', auction._id);
        updateAuction(auction);
      },
      onBidPlaced: (data) => {
        console.log('New bid placed:', data);
        addBidToAuction(data.auction._id, data);
        if (data.newBid?.user_id !== authUser?._id) {
          toast.success(`New bid of $${data.newBid.amount} by ${data.newBid.user_name}`);
        }
      },
      onBidSuccess: (data) => {
        console.log('Bid success:', data);
      },
      onBidError: (data) => {
        console.log('Bid error:', data);
      },
      onAuctionEnded: (data) => {
        console.log('Auction ended:', data);
        markAuctionEnded(data.auctionId, data);
        if (data.winner) {
          toast.success(`Auction ended! Winner: $${data.winner.amount}`);
        } else {
          toast.success('Auction ended with no winner');
        }
      },
      onAuctionStarted: (data) => {
        console.log('Auction started:', data);
        updateAuction({ ...data.auction, status: 'LIVE' });
        toast.success(`Auction ${data.auctionId} has started!`);
      },
    });

    return cleanup;
  }, [socket, isConnected, subscribeToAuctionEvents, updateAuction, addBidToAuction, markAuctionEnded, authUser]);

  const handleJoinAuction = async (auctionId) => {
    try {
      const auction = await fetchAuctionById(auctionId);
      if (auction) {
        setSelectedAuction(auction);
        setCurrentView('auction-detail');
        joinAuction(auctionId);
      }
    } catch (error) {
      console.error('Failed to join auction:', error);
    }
  };

  const handleCreateAuction = async (formData) => {
    try {
      await createAuction(formData);
      setCurrentView('auctions');
    } catch (error) {
      console.error('Failed to create auction:', error);
    }
  };

  const handleBackToAuctions = () => {
    if (selectedAuction) {
      leaveAuction(selectedAuction._id);
      clearSelectedAuction();
    }
    setCurrentView('auctions');
  };

  const handleRefreshAuctions = () => {
    fetchAuctions({ status: statusFilters.join(',') });
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilters(prev => {
      if (prev.includes(status)) {
        const newFilters = prev.filter(s => s !== status);
        return newFilters.length === 0 ? ['LIVE'] : newFilters;
      }
      return [...prev, status];
    });
    setIsFilterOpen(false); // Close menu after selection
  };

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAuctions = auctions.filter(
    auction => auction.user_id._id !== authUser?._id
  );

  const renderView = () => {
    switch (currentView) {
      case 'create':
        return (
          <CreateAuctionForm
            onSubmit={handleCreateAuction}
            onCancel={() => setCurrentView('auctions')}
            isCreating={isCreating}
          />
        );
      case 'auction-detail':
        if (isLoading) {
          return (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading auction details...</p>
            </div>
          );
        }
        
        return selectedAuction ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToAuctions}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← Back to Auctions
              </button>
              <h1 className="text-3xl font-bold">{selectedAuction.item_name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedAuction.status === 'LIVE' ? 'bg-green-100 text-green-800' : 
                selectedAuction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedAuction.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">Auction Details</h2>
                <div className="space-y-3">
                  <p><strong>Description:</strong> {selectedAuction.description}</p>
                  <p><strong>Seller:</strong> {selectedAuction.user_id?.fullName}</p>
                  <p><strong>Base Price:</strong> ${selectedAuction.base_price?.toLocaleString()}</p>
                  <p><strong>Type:</strong> {selectedAuction.bid_type === 'HIGHEST' ? 'Highest Bid Wins' : 'Lowest Bid Wins'}</p>
                  <p><strong>Current Winner:</strong> {selectedAuction.current_bidder_id?.fullName || 'No bids yet'}</p>
                  <div className="pt-2">
                    <AuctionTimer
                      startTime={selectedAuction.start_time}
                      endTime={selectedAuction.end_time}
                      status={selectedAuction.status}
                    />
                  </div>
                </div>
              </div>
              
              <BiddingInterface
                auction={selectedAuction}
                user={authUser}
                socket={socket}
                isConnected={isConnected}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Auction not found</p>
            <button
              onClick={handleBackToAuctions}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to Auctions
            </button>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Live Auctions</h1>
                <p className="text-gray-600 mt-1">Discover and bid on amazing items</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filters
                  </button>
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {['LIVE', 'ENDED', 'PENDING'].map(status => (
                        <label key={status} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={statusFilters.includes(status)}
                            onChange={() => handleStatusFilterChange(status)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{status}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRefreshAuctions}
                  disabled={isFetching}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  {isFetching ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    '🔄'
                  )}
                  Refresh
                </button>
                <button
                  onClick={() => setCurrentView('create')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  Create Auction
                </button>
                <button
                  onClick={() => navigate('/my-auctions')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  My Auctions
                </button>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-fit ${
              connectionStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : connectionStatus === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'error'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`} />
              {connectionStatus === 'connected' ? 'Connected to auction server' : 
               connectionStatus === 'error' ? 'Connection Error' : 'Connecting to auction server...'}
            </div>
            
            {isFetching && filteredAuctions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading auctions...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAuctions.map(auction => (
                    <AuctionCard
                      key={auction._id}
                      auction={auction}
                      onJoin={handleJoinAuction}
                      currentUserId={authUser?._id}
                    />
                  ))}
                </div>
                
                {filteredAuctions.length === 0 && !isFetching && (
                  <div className="text-center py-12">
                    <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
                    <p className="text-gray-500 mb-6">Be the first to create an auction!</p>
                    <button
                      onClick={() => setCurrentView('create')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Gavel className="w-4 h-4" />
                      Create Your First Auction
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
};

export default AuctionPage;