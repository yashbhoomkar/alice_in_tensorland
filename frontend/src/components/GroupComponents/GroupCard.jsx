import { useState } from 'react';
import {
  Users,
  Info,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Mail,
  Edit,
  Trash2,
  Scissors
} from 'lucide-react';
import EditGroup from './EditGroup';
import axios from 'axios';
import SplitGroup from "./SplitGroup";
const GroupCard = ({ group }) => {
  console.log(group);
  const [expanded, setExpanded] = useState(false);
  const [editform, setEditForm] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplit , setShowSplit] = useState(false);
  const groupid = group._id;

  const formatDate = dateString => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const deletehandler = async() => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/group/${groupid}`);
      console.log(response);
    }
    catch(error) {
      console.error(error);
    }
  }

  const getgroupmembers = async() => {
    if (!expanded) {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/group/member/${groupid}`);
        console.log(response, "groupmember");
        if (response.data) {
          setGroupMembers(response.data.members);
        }
      }
      catch(err) {
        console.log(err);
      }
      finally {
        setIsLoading(false);
      }
    }
    setExpanded(!expanded);
  }

  const splitHandler = () => {
    console.log("Split button clicked for group:", groupid);
  }

  return (
    <div className="max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white">
        <h3 className="truncate text-xl font-bold">{group.name}</h3>
      </div>

      {/* Main content */}
      <div className="p-5">
        {/* Description */}
        <div className="mb-4 flex items-start">
          <Info className="mr-3 mt-1 flex-shrink-0 text-gray-400" size={18} />
          <p className="text-sm text-gray-600">
            {group.description || 'No description provided'}
          </p>
        </div>

        {/* Members count */}
        <div className="mb-4 flex items-center">
          <Users className="mr-3 flex-shrink-0 text-indigo-500" size={18} />
          <span className="text-gray-700">
            {group.members.length}{' '}
            {group.members.length === 1 ? 'Member' : 'Members'}
          </span>
        </div>

        {/* Created date */}
        <div className="mb-4 flex items-center">
          <Calendar className="mr-3 flex-shrink-0 text-purple-500" size={18} />
          <span className="text-gray-700">
            Created on {formatDate(group.createdAt)}
          </span>
        </div>

        {/* Created by */}
        <div className="mb-4 flex items-center">
          <User className="mr-3 flex-shrink-0 text-pink-500" size={18} />
          {/* <span className="text-gray-700">
            Created by {group.createdBy || 'Unknown'}
          </span> */}
        </div>

        {/* Split button for members list */}
        <div className="mt-2 flex">
          <button
            onClick={getgroupmembers}
            className="flex-grow rounded-l-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 border border-gray-200 border-r-0"
          >
            <span>View Members</span>
          </button>
          <button
            onClick={getgroupmembers}
            className="rounded-r-lg bg-gray-50 px-2 py-2 text-gray-500 transition-colors hover:bg-gray-100 border border-gray-200"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            ) : expanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 max-h-60 overflow-y-auto rounded-lg bg-gray-50 p-3">
            {groupMembers.length > 0 ? (
              <ul className="space-y-3">
                {groupMembers.map(member => (
                  <li key={member._id} className="flex flex-col">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 text-white">
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-gray-700">{member.name || 'Unknown'}</span>
                    </div>
                    {member.email && (
                      <div className="ml-11 mt-1 flex items-center text-sm text-gray-500">
                        <Mail className="mr-1 text-gray-400" size={14} />
                        {member.email}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No members found in this group
              </p>
            )}
          </div>
        )}

        {/* NEW: Split Group Button */}
        <div className="mt-4 flex">
          <button 
            onClick={() => setShowSplit(!showSplit)}
            className="w-full flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            <Scissors className="mr-2" size={16} />
            <span >Split Group</span>
          </button>
          {showSplit && <div>
            <SplitGroup group={group} showSplit={showSplit}  setShowSplit={setShowSplit}/>
          </div>}
        </div>
      </div>

      {/* Footer with action buttons - now using split button for actions */}
      <div className="flex justify-between bg-gray-50 px-5 py-3">
        {/* Edit Group Split Button */}
        <div className="flex">
          <button 
            onClick={() => {setEditForm(!editform)}} 
            className="rounded-l-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            Edit Group
          </button>
          <button 
            onClick={() => {setEditForm(!editform)}} 
            className="rounded-r-lg border border-l-0 border-indigo-200 bg-white px-2 py-2 text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            <Edit size={16} />
          </button>
        </div>
        {editform && <EditGroup group={group} editform={editform} setEditForm={setEditForm} />}
        
        {/* Delete Group Split Button */}
        <div className="flex">
          <button 
            onClick={deletehandler} 
            className="rounded-l-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Delete Group
          </button>
          <button 
            onClick={deletehandler} 
            className="rounded-r-lg bg-red-600 border-l border-red-700 px-2 py-2 text-white transition-colors hover:bg-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;