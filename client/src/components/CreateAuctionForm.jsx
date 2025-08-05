import { useEffect, useState } from "react";
import { useAuctionStore } from "../store/useAuctionStore";

const CreateAuctionForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    base_price: '',
    bid_type: 'HIGHEST',
    start_time: '',
    end_time: ''
  });
  const { isCreating } = useAuctionStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      onSubmit(formData);
    } catch (error) {
      console.error('Failed to create auction:', error);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Set default times
  useEffect(() => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60000; // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + istOffset);

    const startTime = new Date(istTime.getTime() + 5 * 60000); // 5 minutes from IST now
    const endTime = new Date(istTime.getTime() + 65 * 60000); // 65 minutes from IST now


    
    setFormData(prev => ({
      ...prev,
      start_time: startTime.toISOString().slice(0, 16),
      end_time: endTime.toISOString().slice(0, 16)
    }));
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Auction</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Item Name</label>
          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter item name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your item"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Base Price ($)</label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bid Type</label>
            <select
              name="bid_type"
              value={formData.bid_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="HIGHEST">Highest Bid Wins</option>
              <option value="LOWEST">Lowest Bid Wins</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Auction'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAuctionForm;