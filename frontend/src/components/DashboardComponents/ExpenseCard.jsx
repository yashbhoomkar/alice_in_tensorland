import React, { useState } from 'react';
import { Calendar, CreditCard, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import SplitForm from './SplitForm';
const ExpenseCard = ({ expense }) => {
  // Fallback for missing expense data
  const [showForm , setShowForm] = useState(false);
  if (!expense) {
    return null;
  }

  const {
    amount,
    category,
    date,
    description,
    isSettled,
    splitType,
    type
  } = expense;

  // Format the date in a readable format
  const formattedDate = date ? format(new Date(date), 'MMM dd, yyyy') : 'Date not available';
  
  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'shopping':
        return <CreditCard className="text-blue-500" size={20} />;
      case 'food':
        return <DollarSign className="text-green-500" size={20} />;
      default:
        return <DollarSign className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className={`flex items-center p-4 rounded-lg border shadow-sm mb-3 ${isSettled ? 'bg-gray-50' : 'bg-white'}`}>
      {/* Left side - Category icon */}
      <div className="flex-shrink-0 flex justify-center items-center w-12 h-12 bg-gray-100 rounded-full mr-4">
        {getCategoryIcon(category)}
      </div>
      
      {/* Middle - Expense details */}
      <div className="flex-grow overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">{description || 'Unnamed expense'}</h3>
          <span className={`font-bold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'income' ? '+' : '-'}₹{amount?.toFixed(2) || '0.00'}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <div className="flex items-center mr-3">
            <Calendar size={14} className="mr-1" />
            <span>{formattedDate}</span>
          </div>
          
          {category && (
            <div className="px-2 py-0.5 bg-gray-100 rounded-full text-xs mr-3">
              {category}
            </div>
          )}
          
          {splitType && splitType !== 'personal' && (
            <div className="flex items-center">
              <Users size={14} className="mr-1 text-indigo-500" />
              <span className="text-indigo-500">Split</span>
            </div>
          )}
          
          {/* {isSettled && (
            <div className="ml-auto px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
              Settled
            </div>
          )} */}
        </div>
      </div>
      
      {/* Right side - Actions */}
      <div className="flex-shrink-0 ml-4 flex flex-col items-center gap-2">
        <button 
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          onClick={() => setShowForm(!showForm)}
        >
          Split
        </button>
        {
          showForm && <SplitForm expense={expense} showForm={showForm} setShowForm={setShowForm}/>
        }
        {/* {!isSettled && (
          <button 
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            onClick={() => console.log('Settle expense', expense._id)}
          >
            Settle
          </button>
        )} */}
      </div>
    </div>
  );
};

export default ExpenseCard;