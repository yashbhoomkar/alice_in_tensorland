

// SplitCard.js
import React from 'react';
import { Calendar, User, DollarSign } from 'lucide-react';

const SplitCard = ({ split }) => {
  // Format date to be more readable.
  console.log(split , "seperate split");
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get appropriate color based on transaction category
  const getCategoryColor = (category) => {
    const colors = {
      'DINING': 'bg-orange-100 text-orange-800',
      'SHOPPING': 'bg-purple-100 text-purple-800',
      'TRANSPORTATION': 'bg-blue-100 text-blue-800',
      'GROCERIES': 'bg-green-100 text-green-800',
      'UTILITIES': 'bg-yellow-100 text-yellow-800',
      'ENTERTAINMENT': 'bg-pink-100 text-pink-800',
      'RENT': 'bg-red-100 text-red-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Check if split and transaction exist
  if (!split || !split.transaction) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-lg border border-blue-100 bg-white p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`rounded-full p-2 mr-3 ${getCategoryColor(split.transaction.category)}`}>
            <DollarSign size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">{split.transaction.description || 'Expense'}</h3>
            <p className="text-xs text-blue-400">
              {split.group ? split.group.name : 'Personal Split'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-blue-800">₹ {split.transaction.amount}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${split.transaction.isSettled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {split.transaction.isSettled ? 'Settled' : 'Pending'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between text-sm text-blue-600 border-t border-blue-50 pt-3">
        <div className="flex items-center mb-1">
          <Calendar size={14} className="mr-1" />
          <span>{formatDate(split.transaction.date)}</span>
        </div>
        <div className="flex items-center mb-1">
          <User size={14} className="mr-1" />
          <span>{split.participants ? `${split.participants.length} participants` : 'No participants'}</span>
        </div>
        <div className="px-2 py-1 rounded-md text-xs font-medium mt-1 w-full md:w-auto text-center md:text-left">
          {split.transaction.category}
        </div>
      </div>
    </div>
  );
};

export default SplitCard;