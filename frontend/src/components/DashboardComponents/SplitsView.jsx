// SplitsView.js
import React from 'react';
import { X } from 'lucide-react';
import SplitCard from './SplitCard';

const SplitsView = ({ isOpen, onClose, splits }) => {
    console.log(splits , "insplitsview");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-lg bg-blue-50 p-4 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-100">
          <h2 className="text-xl font-bold text-blue-800">Your Splits</h2>
          <button 
            className="rounded-full p-1 hover:bg-blue-100"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-auto max-h-[calc(90vh-5rem)]">
          {splits.splits && splits.splits.length > 0 ? (
            splits.splits.map((split, index) => (
              <SplitCard key={index} split={split} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-blue-800 text-lg mb-2">No splits found</p>
              <p className="text-blue-600 text-sm">You don't have any active splits at the moment.</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-2 border-t border-blue-100 flex justify-end">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitsView;