// app/admin/users/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/app/components/AdminSidebar'
import { Search, UserPlus, Trash2, Edit, CheckCircle, XCircle, Clock } from 'lucide-react'

// Mock data (can be easily replaced with API calls)
const users = [
    { id: 1, name: 'Rashmika Nawanjana', email: 'rashmika@example.com', role: 'guest', status: 'active', joinedDate: '2023-06-15', lastLogin: '2025-10-03 11:30' },
    { id: 2, name: 'Sarah Kumar', email: 'sarah.kumar@skynest.lk', role: 'staff', status: 'active', joinedDate: '2024-03-10', lastLogin: '2025-10-03 08:30' },
    { id: 5, name: 'Admin User', email: 'admin@skynest.lk', role: 'admin', status: 'active', joinedDate: '2023-01-01', lastLogin: '2025-10-03 08:41' },
    { id: 6, name: 'Emma Wilson', email: 'emma.wilson@example.com', role: 'guest', status: 'inactive', joinedDate: '2024-02-14', lastLogin: '2024-12-15 10:20' },
    { id: 7, name: 'Michael Chen', email: 'michael.chen@skynest.lk', role: 'staff', status: 'suspended', joinedDate: '2024-07-20', lastLogin: '2025-09-25 16:30' },
];

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>{children}</div>
);

const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-500/10 text-green-400';
    if (status === 'inactive') return 'bg-gray-500/10 text-gray-400';
    if (status === 'suspended') return 'bg-red-500/10 text-red-400';
    return 'bg-gray-500/10 text-gray-400';
};

const getRoleBadge = (role: string) => {
    if (role === 'admin') return 'bg-red-500/10 text-red-400';
    if (role === 'staff') return 'bg-blue-500/10 text-blue-400';
    if (role === 'guest') return 'bg-purple-500/10 text-purple-400';
    return 'bg-gray-500/10 text-gray-400';
};

export default function AdminUsersPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredUsers = users.filter(user => 
    (filterRole === 'all' || user.role === filterRole) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'pl-24' : 'pl-72'}`}>
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-l">User Management</h1>
              <p className="text-gray-400">Manage all system users including guests, staff, and administrators.</p>
            </div>
             <button className="flex items-center space-x-2 px-4 py-2 bg-amber-400 text-black font-semibold rounded-md hover:bg-amber-500 transition-colors">
              <UserPlus size={16} />
              <span>Add User</span>
            </button>
          </header>

          <Card>
            <div className="p-6 flex flex-wrap gap-4 items-center justify-between border-b border-gray-800">
                <div className="flex space-x-2 bg-[#10141c] p-1 rounded-md">
                    <button onClick={() => setFilterRole('all')} className={`px-3 py-1 text-sm font-medium rounded ${filterRole === 'all' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>All</button>
                    <button onClick={() => setFilterRole('guest')} className={`px-3 py-1 text-sm font-medium rounded ${filterRole === 'guest' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>Guests</button>
                    <button onClick={() => setFilterRole('staff')} className={`px-3 py-1 text-sm font-medium rounded ${filterRole === 'staff' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>Staff</button>
                    <button onClick={() => setFilterRole('admin')} className={`px-3 py-1 text-sm font-medium rounded ${filterRole === 'admin' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>Admins</button>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#10141c] border border-gray-700 rounded-md pl-10 pr-4 py-2 focus:ring-amber-400 focus:border-amber-400" />
                </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">User</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Role</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Last Login</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>{user.role}</span></td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>{user.status}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-400">{user.lastLogin}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                           <button className="p-2 text-gray-400 hover:text-amber-400"><Edit size={16}/></button>
                           <button className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16}/></button>
                        </div>
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
  )
}
