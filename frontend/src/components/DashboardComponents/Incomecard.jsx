import React from 'react';
import { Calendar, DollarSign, Briefcase, Gift, Award } from 'lucide-react';
import { format } from 'date-fns';

const IncomeCard = ({ income }) => {
  // Fallback for missing income data
  if (!income) {
    return null;
  }

  const {
    amount,
    category,
    date,
    description,
    isSettled,
    _id
  } = income;

  // Format the date in a readable format
  const formattedDate = date ? format(new Date(date), 'MMM dd, yyyy') : 'Date not available';
  
  // Format large numbers with commas
  const formatAmount = (amount) => {
    return amount?.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0.00';
  };

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'salary':
        return <Briefcase className="text-green-600" size={20} />;
      case 'gift':
        return <Gift className="text-purple-500" size={20} />;
      case 'bonus':
        return <Award className="text-yellow-500" size={20} />;
      default:
        return <DollarSign className="text-green-500" size={20} />;
    }
  };

  // Helper function for category label
  const getCategoryLabel = (category) => {
    return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Other';
  };

  return (
    <div className="flex items-center p-4 rounded-lg border shadow-sm mb-3 bg-white border-green-100">
      {/* Left side - Category icon */}
      <div className="flex-shrink-0 flex justify-center items-center w-12 h-12 bg-green-50 rounded-full mr-4">
        {getCategoryIcon(category)}
      </div>
      
      {/* Middle - Income details */}
      <div className="flex-grow overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">
            {description || getCategoryLabel(category) || 'Income'}
          </h3>
          <span className="font-bold text-green-600">
            +₹{formatAmount(amount)}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <div className="flex items-center mr-3">
            <Calendar size={14} className="mr-1" />
            <span>{formattedDate}</span>
          </div>
          
          {category && (
            <div className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs mr-3">
              {getCategoryLabel(category)}
            </div>
          )}
          
          {isSettled !== undefined && (
            <div className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
              isSettled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              {isSettled ? 'Processed' : 'Pending'}
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Actions */}
      <div className="flex-shrink-0 ml-4 flex flex-col items-center gap-2">
        {/* <button 
          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          onClick={() => console.log('View income details', _id)}
        >
          Details
        </button> */}

        {!isSettled && (
          <button 
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            onClick={() => console.log('Mark as processed', _id)}
          >
            Process
          </button>
        )}
      </div>
    </div>
  );
};

export default IncomeCard;