import React from 'react';
import { UserCircle, Mail, Phone, MapPin, Plus } from 'lucide-react';
const UserProfile = ({addIncome , setAddIncome}) => {
  // Static user data
  let user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    role: "Product Designer",
    joinDate: "Member since January 2024"
  };

   user = JSON.parse(localStorage.getItem("user"));


  return (
    <div className="w-[18rem] mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with background */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
        <div className="absolute -bottom-12 left-6">
          <div className="bg-white p-1 rounded-full">
            <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center">
              <UserCircle size={70} className="text-gray-700" />
            </div>
          </div>
        </div>
      </div>
      
      {/* User info */}
      <div className="pt-16 px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        </div>
        
        {/* Contact details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <Mail size={16} className="mr-2" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone size={16} className="mr-2" />
            <span className="text-sm">{user.mobile}</span>
          </div>
          
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={() => setAddIncome(!addIncome)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors">
            Add Income
          </button>
          <button className="flex-1 bg-red-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors">
            LogOut
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default UserProfile;