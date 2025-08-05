import { Users } from "lucide-react";

const BidHistory = ({ bids, bidType, userId }) => {
  const sortedBids = [...bids].sort((a, b) => 
    bidType === 'HIGHEST' ? b.amount - a.amount : a.amount - b.amount
  );
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Bidding History
      </h3>
      {sortedBids.length === 0 ? (
        <p className="text-gray-500 text-sm">No bids placed yet</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sortedBids.slice(0, 10).map((bid, index) => (
            <div key={index} className={`flex justify-between items-center p-2 rounded border ${
              bid.user_id === userId ? 'bg-blue-50 border-blue-200' : 'bg-white'
            }`}>
              <div>
                <span className="font-medium">${bid.amount.toLocaleString()}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {bid.user_name || 'Anonymous'}
                  {bid.user_id === userId && ' (You)'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(bid.time).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BidHistory;