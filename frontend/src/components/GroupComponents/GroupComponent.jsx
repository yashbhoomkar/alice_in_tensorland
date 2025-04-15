import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, DollarSign, Settings } from 'lucide-react';
import AddGroup from './AddGroup';
import GroupCard from './GroupCard';
const GroupComponent = () => {
  const [groupForm, setGroupForm] = useState(false);
  const [groups, setGroups] = useState([]);

  // Get user ID from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || '';

  // Function to fetch groups
  const fetchGroups = async () => {
    if (!userId) return; // Prevent request if userId is missing

    try {
      const response = await axios.get(
        `http://localhost:5000/api/group/user/${userId}`
      );
      setGroups(response.data.groups);
      console.log(response);
      // setGroups(response.data); // Assuming response.data contains an array of groups
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Fetch groups when component mounts
  useEffect(() => {
    fetchGroups();
  }, [userId]);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="relative flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-800">Your Groups</h2>

          <div className="relative">
            <button
              onClick={() => setGroupForm(!groupForm)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <UserPlus size={16} />
              <span>Create New Group</span>
            </button>

            {groupForm && (
              <div className="absolute right-0 z-10 mt-2 w-64 rounded-md bg-white p-4 shadow-lg">
                <AddGroup groupForm={groupForm} setGroupForm={setGroupForm} />
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-blue-400">
          Manage your shared expenses with friends, roommates, and family
        </p>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => (
          <div
            key={group.id}
          >
            <GroupCard group={group}/>
          </div>
        ))}

        
      </div>
    </div>
  );
};

export default GroupComponent;
