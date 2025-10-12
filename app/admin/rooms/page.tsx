// app/admin/rooms/page.tsx
'use client'

import { useState } from 'react'
import AdminSidebar from '@/app/components/AdminSidebar'
import React from 'react'

// Mock Data
const allRoomsData = [
    { id: 101, branch: 'Colombo', status: 'occupied', type: 'Deluxe Room' }, 
    { id: 102, branch: 'Colombo', status: 'available', type: 'Deluxe Room' }, 
    { id: 103, branch: 'Colombo', status: 'maintenance', type: 'Suite' },
    { id: 104, branch: 'Colombo', status: 'available', type: 'Deluxe Room' }, 
    { id: 105, branch: 'Colombo', status: 'occupied', type: 'Presidential Suite' },
    { id: 201, branch: 'Kandy', status: 'available', type: 'Deluxe Room' }, 
    { id: 202, branch: 'Kandy', status: 'occupied', type: 'Suite' }, 
    { id: 203, branch: 'Kandy', status: 'occupied', type: 'Deluxe Room' },
    { id: 301, branch: 'Galle', status: 'maintenance', type: 'Suite' }, 
    { id: 302, branch: 'Galle', status: 'available', type: 'Deluxe Room' },
];

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>{children}</div>
);

export default function RoomsPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-500/10 text-red-400';
      case 'available': return 'bg-green-500/10 text-green-400';
      case 'maintenance': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };
  
  const filteredRooms = selectedBranch === 'all'
    ? allRoomsData
    : allRoomsData.filter(room => room.branch.toLowerCase() === selectedBranch);

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'pl-24' : 'pl-72'}`}>
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white font-l">Room Management</h1>
            <p className="text-gray-400">View and manage all rooms across the hotel branches.</p>
          </header>

          <div className="flex space-x-2 bg-[#181d28] p-1 rounded-lg mb-8 w-fit">
            <button onClick={() => setSelectedBranch('all')} className={`px-4 py-2 text-sm font-medium rounded-md ${selectedBranch === 'all' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>All</button>
            <button onClick={() => setSelectedBranch('colombo')} className={`px-4 py-2 text-sm font-medium rounded-md ${selectedBranch === 'colombo' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>Colombo</button>
            <button onClick={() => setSelectedBranch('kandy')} className={`px-4 py-2 text-sm font-medium rounded-md ${selectedBranch === 'kandy' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>Kandy</button>
            <button onClick={() => setSelectedBranch('galle')} className={`px-4 py-2 text-sm font-medium rounded-md ${selectedBranch === 'galle' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>Galle</button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Room ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Branch</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Room Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredRooms.map(room => (
                    <tr key={room.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{room.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{room.branch}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{room.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>{room.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

