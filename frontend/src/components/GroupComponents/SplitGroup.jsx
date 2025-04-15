import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SplitGroup = ({ group, showSplit, setShowSplit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    otherCategory: '',
    paidByEmail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    'Food',
    'Travel',
    'Entertainment',
    'Utilities',
    'Rent',
    'Other'
  ];

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const finalCategory = formData.category === 'Other' ? formData.otherCategory : formData.category;
      
      const response = await axios.post(
        'http://localhost:5000/api/splits/create-split-group',
        {
          amount: formData.amount,
          description: formData.description,
          category: finalCategory,
          groupId: group._id,
          paidByEmail: formData.paidByEmail
        }
      );
      console.log(response);
      setShowSplit(!showSplit);
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className='flex justify-between items-center'>
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Add New Split
          </h2>
          <X onClick={() => setShowSplit(!showSplit)} className='bg-red-500 mb-6 text-white rounded-full p-1 hover:bg-red-600 hover:scale-110 transition-all duration-150'/>
        </div>

        {success && (
          <div className="mb-4 rounded-md bg-green-100 p-3 text-green-700">
            Expense successfully added to the group!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="amount"
            >
              Amount
            </label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="description"
            >
              Description
            </label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="description"
              name="description"
              type="text"
              placeholder="What was this expense for?"
              required
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="category"
            >
              Category
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {formData.category === 'Other' && (
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="otherCategory"
              >
                Specify Category
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="otherCategory"
                name="otherCategory"
                type="text"
                placeholder="Enter custom category"
                required={formData.category === 'Other'}
                value={formData.otherCategory}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="mb-6">
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="paidByEmail"
            >
              Paid By (Email)
            </label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="paidByEmail"
              name="paidByEmail"
              type="email"
              placeholder="email@example.com"
              required
              value={formData.paidByEmail}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`rounded-md px-6 py-2 font-medium text-white ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition duration-200`}
            >
              {isLoading ? 'Submitting...' : 'Split Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SplitGroup;