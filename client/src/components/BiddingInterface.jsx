import { AlertCircle, CheckCircle, Gavel, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocketStore } from "../store/useSocketStore";
import AuctionTimer from "./AuctionTimer";
import BidHistory from "./BidHistory";
import { axiosInstance } from "../lib/axios";

const BiddingInterface = ({ auction, user }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const socketStore = useSocketStore();
  
  useEffect(() => {
    const cleanup = socketStore.subscribeToAuctionEvents({
      onBidSuccess: (data) => {
        setUserPosition(data.userPosition);
        setMessage(data.message);
        setMessageType('success');
        setBidAmount('');
        setTimeout(() => setMessage(''), 3000);
      },
      onBidError: (data) => {
        setMessage(data.message);
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    });
    
    return cleanup;
  }, [socketStore]);
  
  const handleBidSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (!amount || amount <= 0) {
      setMessage('Please enter a valid bid amount');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    socketStore.placeBid(auction._id, amount);
  };

  const handleEndAuction = async () => {
    try {
      const response = await axiosInstance.patch(`/auctions/${auction._id}/end`);
      if (!response.ok) {
        throw new Error('Failed to end auction');
      }
      setMessage('Auction ended successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("End auction error:", error);
      setMessage('Failed to end auction');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const isHighest = auction.bid_type === 'HIGHEST';
  const suggestedBid = auction.current_bid 
    ? (isHighest ? auction.current_bid + 10 : Math.max(auction.base_price, auction.current_bid - 10))
    : auction.base_price;
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Gavel className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Place Your Bid</h2>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {messageType === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Auction Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium flex items-center gap-1">
                {isHighest ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isHighest ? 'Highest Wins' : 'Lowest Wins'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span className="font-medium">${auction.base_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Current {isHighest ? 'Highest' : 'Lowest'}:</span>
              <span className="font-medium text-blue-600">
                ${auction.current_bid?.toLocaleString() || 'No bids'}
              </span>
            </div>
            <div className="pt-2">
              <AuctionTimer 
                startTime={auction.start_time}
                endTime={auction.end_time}
                status={auction.status}
              />
            </div>
          </div>
        </div>
        
        {userPosition && (
          <div>
            <h3 className="font-semibold mb-2">Your Position</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rank:</span>
                <span className={`font-medium ${userPosition.isWinning ? 'text-green-600' : 'text-orange-600'}`}>
                  #{userPosition.position} {userPosition.isWinning && '🏆'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Your Bid:</span>
                <span className="font-medium">${userPosition.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${userPosition.isWinning ? 'text-green-600' : 'text-orange-600'}`}>
                  {userPosition.isWinning ? 'Winning!' : 'Not winning'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {auction.user_id._id === user._id && auction.status !== 'ENDED' && (
        <button
          onClick={handleEndAuction}
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium mb-4"
        >
          <Gavel className="w-4 h-4" />
          End Auction
        </button>
      )}

      {
        auction.user_id._id !== user._id && auction.status === 'LIVE' && (
        
      <form onSubmit={handleBidSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Bid Amount ($)
          </label>
          <div className="relative">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Suggested: ${suggestedBid}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={auction.base_price}
              step="0.01"
            />
            <button
              type="button"
              onClick={() => setBidAmount(suggestedBid.toString())}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
            >
              Use suggested
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isHighest 
              ? `Must be higher than current bid of ${auction.current_bid || auction.base_price}`
              : `Must be lower than current bid of ${auction.current_bid || 'base price'} but above ${auction.base_price}`
            }
          </p>
        </div>
        
        <button
          type="submit"
          disabled={!bidAmount || auction.status !== 'LIVE'}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Gavel className="w-4 h-4" />
          {auction.status === 'LIVE' ? 'Place Bid' : auction.status === 'PENDING' ? 'Auction Not Started' : 'Auction Ended'}
        </button>
      </form>
      )
      }
      
      
      <div className="mt-6">
        <BidHistory 
          bids={auction.bids || []} 
          bidType={auction.bid_type}
          userId={user._id}
        />
      </div>
    </div>
  );
};
export default BiddingInterface;