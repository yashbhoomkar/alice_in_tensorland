import React, { useState } from 'react';
import { DollarSign, Calendar, Tag, Users, ChevronDown, ChevronUp, Edit, Trash2, Clock } from 'lucide-react';

const TransactionsList = ({allTransactions}) => {
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  console.log(allTransactions , "654546");
  // Format date to a readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Toggle transaction details
  const toggleTransaction = (id) => {
    if (expandedTransaction === id) {
      setExpandedTransaction(null);
    } else {
      setExpandedTransaction(id);
    }
  };

  // Get category color based on category name
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-purple-100 text-purple-800',
      'Office': 'bg-blue-100 text-blue-800',
      'Travel': 'bg-green-100 text-green-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  // Handle split button click
  const handleSplit = (transaction) => {
    console.log('Split transaction:', transaction);
    // Implement your split logic here
  };

  return (
    <div className="rounded-md border border-blue-100 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blue-700">
          Expense Transactions
        </h3>
        <div className="flex space-x-2">
          <select className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
            <option>All Categories</option>
            <option>Food & Dining</option>
            <option>Transportation</option>
            <option>Office</option>
            <option>Travel</option>
          </select>
          <select className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>Last 3 Months</option>
            <option>Custom Range</option>
          </select>
        </div>
      </div>

      {allTransactions.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-md bg-blue-50 md:h-64">
          <span className="text-blue-400">No transactions found</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-blue-100">
          {allTransactions.map((transaction) => (
            <div key={transaction._id} className="border-b border-blue-100 last:border-b-0">
              <div 
                className="flex cursor-pointer items-center justify-between bg-white p-4 hover:bg-blue-50"
                onClick={() => toggleTransaction(transaction._id)}
              >
                <div className="flex flex-1 items-center space-x-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <DollarSign size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800">{transaction.description}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-blue-500">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(transaction.date)}
                      </div>
                      <div className={`rounded-full px-2 py-0.5 text-xs ${getCategoryColor(transaction.category)}`}>
                        {transaction.category}
                      </div>
                      {transaction.splitType === 'group' && (
                        <div className="flex items-center text-blue-500">
                          <Users size={12} className="mr-1" />
                          {transaction.group?.name || 'Group'}
                        </div>
                      )}
                      {transaction.isSettled && (
                        <div className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          Settled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-blue-800">₹{transaction.amount.toFixed(2)}</span>
                  {expandedTransaction === transaction._id ? (
                    <ChevronUp size={18} className="text-blue-500" />
                  ) : (
                    <ChevronDown size={18} className="text-blue-500" />
                  )}
                </div>
              </div>

              {expandedTransaction === transaction._id && (
                <div className="border-t border-blue-100 bg-blue-50 p-4">
                  <div className="mb-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-blue-500">Details</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span className="mr-2 w-24 flex-shrink-0 font-medium text-blue-700">Created by:</span>
                          <span className="text-blue-800">{transaction.createdBy.name}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="mr-2 w-24 flex-shrink-0 font-medium text-blue-700">Split type:</span>
                          <span className="capitalize text-blue-800">{transaction.splitType}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="mr-2 w-24 flex-shrink-0 font-medium text-blue-700">Status:</span>
                          <span className={transaction.isSettled ? "text-green-600" : "text-orange-600"}>
                            {transaction.isSettled ? "Settled" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {transaction.splitType === 'group' && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-blue-500">Splits ({transaction.splits.length})</p>
                        <div className="max-h-36 overflow-y-auto rounded-md border border-blue-200 bg-white p-2">
                          {transaction.splits.map((splitId, index) => (
                            <div key={splitId} className="mb-2 flex items-center justify-between border-b border-blue-50 pb-2 last:mb-0 last:border-b-0 last:pb-0">
                              <div className="flex items-center">
                                <div className="mr-2 h-6 w-6 rounded-full bg-blue-200 text-center text-xs leading-6 text-blue-800">
                                  {index + 1}
                                </div>
                                <span className="text-sm text-blue-700">User {index + 1}</span>
                              </div>
                              <span className="text-sm font-medium text-blue-800">
                                ₹{(transaction.amount / transaction.splits.length).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    {!transaction.isSettled && transaction.splitType === 'personal' && (
                      <button 
                        onClick={() => handleSplit(transaction)}
                        className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <Users size={16} className="mr-2" />
                        Split Expense
                      </button>
                    )}
                    <button className="flex items-center rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                      <Edit size={16} className="mr-2" />
                      Edit
                    </button>
                    <button className="flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionsList;