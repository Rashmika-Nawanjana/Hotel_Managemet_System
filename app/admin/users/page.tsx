'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [filterRole, setFilterRole] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentTime] = useState('2025-10-03 11:48:53')

  // Mock users data
  const users = [
    {
      id: 1,
      name: 'Rashmika Nawanjana',
      email: 'rashmika@example.com',
      role: 'guest',
      status: 'active',
      branch: 'N/A',
      joinedDate: '2023-06-15',
      lastLogin: '2025-10-03 11:30:22',
      totalBookings: 12,
      totalSpent: 5420
    },
    {
      id: 2,
      name: 'Sarah Kumar',
      email: 'sarah.kumar@skynest.lk',
      role: 'staff',
      status: 'active',
      branch: 'Kandy',
      employeeId: 'EMP-2025-052',
      joinedDate: '2024-03-10',
      lastLogin: '2025-10-03 08:30:15',
      department: 'Front Desk'
    },
    {
      id: 3,
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'guest',
      status: 'active',
      branch: 'N/A',
      joinedDate: '2024-08-22',
      lastLogin: '2025-10-02 15:45:30',
      totalBookings: 5,
      totalSpent: 2150
    },
    {
      id: 4,
      name: 'David Silva',
      email: 'david.silva@skynest.lk',
      role: 'staff',
      status: 'active',
      branch: 'Colombo',
      employeeId: 'EMP-2025-033',
      joinedDate: '2023-11-05',
      lastLogin: '2025-10-03 09:15:42',
      department: 'Housekeeping'
    },
    {
      id: 5,
      name: 'Admin User',
      email: 'admin@skynest.lk',
      role: 'admin',
      status: 'active',
      branch: 'All',
      joinedDate: '2023-01-01',
      lastLogin: '2025-10-03 08:41:33',
      permissions: 'Full Access'
    },
    {
      id: 6,
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      role: 'guest',
      status: 'inactive',
      branch: 'N/A',
      joinedDate: '2024-02-14',
      lastLogin: '2024-12-15 10:20:00',
      totalBookings: 3,
      totalSpent: 890
    },
    {
      id: 7,
      name: 'Michael Chen',
      email: 'michael.chen@skynest.lk',
      role: 'staff',
      status: 'suspended',
      branch: 'Galle',
      employeeId: 'EMP-2025-088',
      joinedDate: '2024-07-20',
      lastLogin: '2025-09-25 16:30:00',
      department: 'Maintenance'
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      role: 'guest',
      status: 'active',
      branch: 'N/A',
      joinedDate: '2025-01-10',
      lastLogin: '2025-10-01 20:15:30',
      totalBookings: 2,
      totalSpent: 720
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'suspended': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700'
      case 'staff': return 'bg-blue-100 text-blue-700'
      case 'guest': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    guests: users.filter(u => u.role === 'guest').length,
    staff: users.filter(u => u.role === 'staff').length,
    admins: users.filter(u => u.role === 'admin').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center text-gray-300 hover:text-white transition">
              <span className="mr-2">←</span>
              <span>Back to Dashboard</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">User Management</span>
                <p className="text-xs text-gray-300 -mt-1">{currentTime}</p>
              </div>
            </div>

            <Link 
              href="/auth/admin-login"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage all system users including guests, staff, and administrators</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👥</span>
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-gray-600">All Users</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✓</span>
              <span className="text-sm text-gray-600">Status</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎫</span>
              <span className="text-sm text-gray-600">Role</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.guests}</p>
            <p className="text-sm text-gray-600">Guests</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👔</span>
              <span className="text-sm text-gray-600">Role</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.staff}</p>
            <p className="text-sm text-gray-600">Staff</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔐</span>
              <span className="text-sm text-gray-600">Role</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRole === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setFilterRole('guest')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRole === 'guest' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Guests ({stats.guests})
              </button>
              <button
                onClick={() => setFilterRole('staff')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRole === 'staff' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Staff ({stats.staff})
              </button>
              <button
                onClick={() => setFilterRole('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRole === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admins ({stats.admins})
              </button>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
              />
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                + Add User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Branch/Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Login</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{user.branch}</p>
                        {user.employeeId && <p className="text-gray-600">{user.employeeId}</p>}
                        {user.department && <p className="text-gray-600">{user.department}</p>}
                        {user.totalBookings !== undefined && (
                          <p className="text-gray-600">{user.totalBookings} bookings</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                        >
                          View
                        </Link>
                        <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium">
                          Edit
                        </button>
                        {user.status !== 'suspended' ? (
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium">
                            Suspend
                          </button>
                        ) : (
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium">
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
              <button 
                onClick={() => {
                  setFilterRole('all')
                  setSearchQuery('')
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination (Mock) */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                Previous
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New User</h3>
            <p className="text-gray-600 mb-6">User creation form will be implemented here.</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}