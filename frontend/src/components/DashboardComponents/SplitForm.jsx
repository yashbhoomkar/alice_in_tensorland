import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
const SplitForm = ({ expense, showForm, setShowForm }) => {
  console.log(expense);
  const user = JSON.parse(localStorage.getItem('user'));

  const [paidBy, setPaidBy] = useState(user.email);
  const [participants, setParticipants] = useState([
    { email: '', mobile: '', share: '' }
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  useEffect(() => {
    if (expense && expense.amount) {
      setTotalAmount(Number(expense.amount));
      setRemainingAmount(Number(expense.amount));
    }
  }, [expense]);

  useEffect(() => {
    const allocatedAmount = participants.reduce((sum, participant) => {
      return sum + (Number(participant.share) || 0);
    }, 0);
    setRemainingAmount(totalAmount - allocatedAmount);
  }, [participants, totalAmount]);

  const handlePaidByChange = e => {
    setPaidBy(e.target.value);
  };

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  };

  const addParticipant = () => {
    setParticipants([...participants, { email: '', mobile: '', share: '' }]);
  };

  const removeParticipant = index => {
    if (participants.length === 1) return;
    const updatedParticipants = participants.filter((_, i) => i !== index);
    setParticipants(updatedParticipants);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const payload = {
      transaction: expense._id || '',
      paidBy,
      participants: participants.map(p => ({
        email: p.email,
        mobile: p.mobile,
        share: Number(p.share)
      }))
    };
    try {
      const response = await axios.post(
        'http://localhost:5000/api/splits/create',
        payload
      );
    //   console.log(response);
    setShowForm(!showForm);
    } catch (error) {
      console.log('error creating split', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="z-10 max-h-screen w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Split Expense
          </h2>
          <X
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-red-500 p-1 text-white transition-all duration-150 hover:scale-110 hover:bg-red-600"
          />
        </div>

        {expense && (
          <div className="mb-4 rounded-md bg-gray-100 p-3">
            <div className="font-medium">Expense Details</div>
            <div className="text-sm text-gray-600">
              {expense.description || 'No description'}
            </div>
            <div className="mt-1 font-semibold">₹{totalAmount}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Paid By (Email)
            </label>
            <input
              type="email"
              value={paidBy}
              onChange={handlePaidByChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email of person who paid"
              required
            />
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Participants
              </label>
              <div>
                <span
                  className={`text-sm ${
                    remainingAmount === 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  Remaining: ₹{remainingAmount}
                </span>
              </div>
            </div>

            {participants.map((participant, index) => (
              <div key={index} className="mb-3 rounded-md bg-gray-50 p-3">
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Participant {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <input
                      type="email"
                      value={participant.email}
                      onChange={e =>
                        handleParticipantChange(index, 'email', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={participant.mobile}
                      onChange={e =>
                        handleParticipantChange(index, 'mobile', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Mobile Number"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={participant.share}
                      onChange={e =>
                        handleParticipantChange(index, 'share', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Share Amount"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addParticipant}
              className="mt-2 w-full rounded-md border border-blue-500 px-4 py-2 text-sm text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Another Participant
            </button>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Split Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SplitForm;
