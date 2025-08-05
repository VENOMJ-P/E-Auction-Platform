import React from 'react';
import AuctionTimer from './AuctionTimer';
import { Gavel, TrendingDown, TrendingUp } from 'lucide-react';

const AuctionCard = ({ auction, onJoin }) => {
  const isHighest = auction.bid_type === 'HIGHEST';
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{auction.item_name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          auction.status === 'LIVE' ? 'bg-green-100 text-green-800' : 
          auction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {auction.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{auction.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-gray-500">Base Price</label>
          <p className="text-lg font-semibold">${auction.base_price.toLocaleString()}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Current {isHighest ? 'Highest' : 'Lowest'}</label>
          <p className="text-lg font-semibold text-blue-600 flex items-center gap-1">
            {isHighest ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            ${auction.current_bid?.toLocaleString() || 'No bids'}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <AuctionTimer 
          startTime={auction.start_time}
          endTime={auction.end_time} 
          status={auction.status}
        />
      </div>
      
      <button
        onClick={() => onJoin(auction._id)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Gavel className="w-4 h-4" />
        Join Auction
      </button>
    </div>
  );
};

export default AuctionCard;