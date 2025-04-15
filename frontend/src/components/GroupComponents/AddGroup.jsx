import React, { useState, useEffect } from 'react';
import axios from "axios";
const AddGroup = ({ groupForm, setGroupForm }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user._id || '';
  console.log(user);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    members: [],
    createdBy: userId  // Set createdBy directly here
  });
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData(prev => ({ ...prev, [name]: value }));
  };
  
  // Email validation function
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Add email to members array
  const handleAddEmail = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email cannot be empty');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (groupData.members.includes(email)) {
      setError('This email is already added');
      return;
    }
    
    setGroupData(prev => ({
      ...prev,
      members: [...prev.members, email]
    }));
    
    setEmail('');
    setError('');
  };
  

  const handleRemoveEmail = (emailToRemove) => {
    setGroupData(prev => ({
      ...prev,
      members: prev.members.filter(email => email !== emailToRemove)
    }));
  };
  
  // Form submission
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    // Validate form data
    if (!groupData.name.trim()) {
      setError('Group name is required');
      return;
    }
    
    if (groupData.members.length === 0) {
      setError('Please add at least one member');
      return;
    }
    // console.log('Submitting group data:', groupData);
    const response = await axios.post("http://localhost:5000/api/group" , groupData);
    console.log(response , "456");
    // Here you would typically send the data to your API
    setGroupForm(!groupForm);
    // Reset form after submission
    setGroupData({
      name: '',
      description: '',
      members: [],
      createdBy: groupData.createdBy // Keep the user ID
    });
    
    setError('');
    alert('Group created successfully!');
  };

  const handleClose = () => {
    if (setGroupForm) {
      setGroupForm(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-90vh overflow-y-auto animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-poppins">Create New Group</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="font-poppins">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={groupData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter group name"
              />
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={groupData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24 resize-none"
                placeholder="Enter group description"
              />
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Members <span className="text-red-500">*</span>
              </label>
              <div className="flex mb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter email address"
                />
                <button
                  onClick={handleAddEmail}
                  className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add
                  </div>
                </button>
              </div>
              <p className="text-sm text-gray-500">Add email addresses of group members</p>
            </div>
            
            {groupData.members.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-700 font-medium mb-3">Members List:</p>
                <div className="flex flex-wrap gap-2">
                  {groupData.members.map((memberEmail, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-full transition-all hover:bg-blue-100"
                    >
                      <span className="mr-2 text-sm">{memberEmail}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(memberEmail)}
                        className="text-blue-400 hover:text-blue-700 focus:outline-none rounded-full hover:bg-blue-200 h-5 w-5 flex items-center justify-center transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium shadow-sm"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGroup;