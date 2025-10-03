'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminBranchesPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const currentTime = '2025-10-03 11:53:58'

  // Mock branches data
  const branches = [
    {
      id: 'colombo',
      name: 'Sky Nest Colombo',
      location: 'Colombo City Center',
      address: '123 Galle Road, Colombo 03, Sri Lanka',
      phone: '+94 11 234 5678',
      email: 'colombo@skynest.lk',
      manager: 'John Anderson',
      status: 'operational',
      totalRooms: 80,
      occupiedRooms: 68,
      occupancyRate: 85,
      totalStaff: 52,
      activeStaff: 48,
      revenue: 185340,
      bookingsToday: 12,
      avgRating: 4.8,
      totalReviews: 324,
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Conference Hall'],
      openedDate: '2020-03-15',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
    },
    {
      id: 'kandy',
      name: 'Sky Nest Kandy',
      location: 'Kandy Hills',
      address: '456 Peradeniya Road, Kandy, Sri Lanka',
      phone: '+94 81 234 5678',
      email: 'kandy@skynest.lk',
      manager: 'Sarah Kumar',
      status: 'operational',
      totalRooms: 60,
      occupiedRooms: 43,
      occupancyRate: 72,
      totalStaff: 45,
      activeStaff: 42,
      revenue: 142680,
      bookingsToday: 8,
      avgRating: 4.7,
      totalReviews: 267,
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Tea Garden'],
      openedDate: '2021-06-20',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400'
    },
    {
      id: 'galle',
      name: 'Sky Nest Galle',
      location: 'Galle Fort',
      address: '789 Fort Road, Galle Fort, Galle 80000, Sri Lanka',
      phone: '+94 91 234 5678',
      email: 'galle@skynest.lk',
      manager: 'David Silva',
      status: 'operational',
      totalRooms: 70,
      occupiedRooms: 53,
      occupancyRate: 76,
      totalStaff: 48,
      activeStaff: 45,
      revenue: 130900,
      bookingsToday: 10,
      avgRating: 4.9,
      totalReviews: 301,
      amenities: ['Beach Access', 'Pool', 'Spa', 'Restaurant', 'Water Sports'],
      openedDate: '2019-11-10',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'
    }
  ]

  const stats = {
    totalBranches: branches.length,
    operationalBranches: branches.filter(b => b.status === 'operational').length,
    totalRooms: branches.reduce((sum, b) => sum + b.totalRooms, 0),
    occupiedRooms: branches.reduce((sum, b) => sum + b.occupiedRooms, 0),
    totalStaff: branches.reduce((sum, b) => sum + b.totalStaff, 0),
    totalRevenue: branches.reduce((sum, b) => sum + b.revenue, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-700 border-green-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'closed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
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
                <span className="text-xl font-bold text-white">Branch Management</span>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Branch Management</h1>
            <p className="text-gray-600">Manage all Sky Nest hotel branches and their operations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            + Add New Branch
          </button>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏢</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBranches}</p>
            <p className="text-sm text-gray-600">Total Branches</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.operationalBranches}</p>
            <p className="text-sm text-gray-600">Operational</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏨</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
            <p className="text-sm text-gray-600">Total Rooms</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🛏️</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.occupiedRooms}</p>
            <p className="text-sm text-gray-600">Occupied</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👔</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalStaff}</p>
            <p className="text-sm text-gray-600">Total Staff</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-green-600">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
        </div>

        {/* Branches Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300">
              {/* Branch Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={branch.image} 
                  alt={branch.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm border font-semibold ${getStatusColor(branch.status)}`}>
                    {branch.status === 'operational' ? '● Operational' : branch.status}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-2xl font-bold text-white">{branch.name}</h3>
                  <p className="text-white/90 text-sm">{branch.location}</p>
                </div>
              </div>

              {/* Branch Info */}
              <div className="p-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className={`text-2xl font-bold ${getOccupancyColor(branch.occupancyRate)}`}>
                      {branch.occupancyRate}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Occupancy</p>
                    <p className="text-xs text-gray-500">{branch.occupiedRooms}/{branch.totalRooms} rooms</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">${(branch.revenue / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-gray-600 mt-1">Revenue</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 pb-4 border-b">
                  <div className="flex items-start space-x-2 text-sm">
                    <span className="text-gray-400">📍</span>
                    <p className="text-gray-700">{branch.address}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">📞</span>
                    <a href={`tel:${branch.phone}`} className="text-blue-600 hover:underline">{branch.phone}</a>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">✉️</span>
                    <a href={`mailto:${branch.email}`} className="text-blue-600 hover:underline">{branch.email}</a>
                  </div>
                </div>

                {/* Manager & Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Manager</p>
                    <p className="font-semibold text-gray-900">{branch.manager}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Staff</p>
                    <p className="font-semibold text-gray-900">{branch.activeStaff}/{branch.totalStaff}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Bookings Today</p>
                    <p className="font-semibold text-gray-900">{branch.bookingsToday}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Rating</p>
                    <p className="font-semibold text-gray-900">⭐ {branch.avgRating} ({branch.totalReviews})</p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {branch.amenities.slice(0, 4).map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                    {branch.amenities.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{branch.amenities.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/branches/${branch.id}`}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-center text-sm"
                  >
                    View Details
                  </Link>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm">
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Branch Comparison Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Branch Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Branch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Rooms</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Occupancy</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Staff</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branches.map(branch => (
                  <tr key={branch.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{branch.name}</p>
                        <p className="text-sm text-gray-600">{branch.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(branch.status)}`}>
                        {branch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-semibold text-gray-900">{branch.totalRooms}</p>
                      <p className="text-xs text-gray-600">{branch.occupiedRooms} occupied</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className={`text-lg font-bold ${getOccupancyColor(branch.occupancyRate)}`}>
                        {branch.occupancyRate}%
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-semibold text-gray-900">{branch.totalStaff}</p>
                      <p className="text-xs text-gray-600">{branch.activeStaff} active</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-green-600">${branch.revenue.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold text-gray-900">{branch.avgRating}</span>
                      </div>
                      <p className="text-xs text-gray-600">{branch.totalReviews} reviews</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <Link
                          href={`/admin/branches/${branch.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-xs font-medium"
                        >
                          View
                        </Link>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-xs font-medium">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Add New Branch</h3>
            <p className="text-gray-600 mb-6">Branch creation form will be implemented here with all necessary fields.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                Create Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}