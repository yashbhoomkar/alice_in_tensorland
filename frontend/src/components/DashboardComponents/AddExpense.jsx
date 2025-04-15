import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import axios from 'axios';
const AddExpense = ({ addscreen, setAddscreen }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userid = user._id || '';
  const [expense, setExpense] = useState({
    amount: '',
    description: '',
    category: 'Food',
    createdBy: userid,
    splitType: 'personal',
    splits: [],
    date: '04/03/2025'
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const categories = [
    'Food',
    'Travel',
    'Entertainment',
    'Utilities',
    'Rent',
    'Other'
  ];

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:5000/api/transaction/expense',
        expense
      );
      console.log(response);
      setAddscreen(!addscreen);
      // console.log('Transaction submitted successfully:', data);

      // if (typeof setAddscreen === 'function') {
      //   setAddscreen(false);
      // }
    } catch (error) {
      console.error(
        'Error submitting transaction:',
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-auto w-[23rem] rounded-lg border border-blue-800 bg-white p-6 text-black shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Add Expense</h2>
          <button
            onClick={() => setAddscreen(!addscreen)}
            className="rounded-full bg-red-500 p-1 text-white transition-all duration-150 hover:scale-110 hover:bg-red-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="amount"
              className="mb-2 block text-sm font-medium text-black"
            >
              Amount (₹)
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={expense.amount}
              onChange={handleChange}
              className="w-full rounded-md border border-blue-600 bg-gray-200 p-2.5 text-black focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-black"
            >
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={expense.description}
              onChange={handleChange}
              className="w-full rounded-md border border-blue-600 bg-gray-200 p-2.5 text-black focus:border-blue-500 focus:ring-blue-500"
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
              value={expense.category}
              onChange={handleChange}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {expense.category === 'Other' && (
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
                required={expense.category === 'Other'}
                value={expense.otherCategory}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-700 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
