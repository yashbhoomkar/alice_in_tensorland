import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { X } from 'lucide-react';


const ExpensePieChart = ({ isOpen, onClose, expenses }) => {
  const [categoryData, setCategoryData] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff6b6b', '#6495ED', '#9370DB'];

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const categoryMap = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += expense.amount || 0;
        return acc;
      }, {});

      const data = Object.keys(categoryMap).map((category, index) => ({
        name: category,
        value: categoryMap[category],
        color: COLORS[index % COLORS.length]
      }));

      setCategoryData(data);
    }
  }, [expenses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-xl font-bold text-blue-800">Expense Breakdown by Category</h2>

        {categoryData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500">No expense data available</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {categoryData.map((category, index) => (
            <div key={index} className="flex items-center rounded-md border border-blue-100 bg-blue-50 p-2">
              <div 
                className="mr-2 h-4 w-4 rounded-full" 
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="flex-1 text-sm font-medium">{category.name}</span>
              <span className="text-right text-sm font-bold">₹{category.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensePieChart;