import React, { useState } from 'react';
import axios from 'axios';
const AddIncome = ({addIncome , setAddIncome}) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user._id || '';

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    createdBy: userId,
    splitType: '',
    splits: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      alert('Amount and Category are required');
      return;
    }
    console.log('Income Data:', formData);
    
    try {
        const response = await axios.post("http://localhost:5000/api/transaction/income" , formData);
        console.log(response);
        setAddIncome(!addIncome);
        
      } catch (error) {
        console.error(
          'Error submitting transaction:',
          error.response?.data?.message || error.message
        );
      }
  };

  return (
    <div className='fixed  inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
        <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add Income</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
            type="number"
            name="amount"
            placeholder="Amount *"
            value={formData.amount}
            onChange={handleChange}
            className="border p-2 rounded"
            required
            />
            <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="border p-2 rounded"
            />
            <input
            type="text"
            name="category"
            placeholder="Category *"
            value={formData.category}
            onChange={handleChange}
            className="border p-2 rounded"
            required
            />
            <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
            Add Income
            </button>
        </form>
        </div>
    </div>
  );
};

export default AddIncome;