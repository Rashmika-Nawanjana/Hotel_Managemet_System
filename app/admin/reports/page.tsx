'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedReport, setSelectedReport] = useState('overview')
  const currentTime = '2025-10-03 11:51:25'

  // Mock data for charts and reports
  const revenueData = {
    daily: [12500, 13200, 14800, 11900, 15400, 16200, 14500],
    weekly: [85000, 92000, 88000, 95000],
    monthly: [320000, 345000, 380000, 420000, 458000, 490000, 512000, 545000, 580000, 615000, 650000, 685000],
    labels: {
      daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weekly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  }

  const occupancyData = {
    colombo: { occupied: 68, total: 80, percentage: 85 },
    kandy: { occupied: 43, total: 60, percentage: 72 },
    galle: { occupied: 53, total: 70, percentage: 76 }
  }

  const topPerformers = {
    staff: [
      { name: 'Sarah Kumar', branch: 'Kandy', rating: 4.9, services: 245 },
      { name: 'David Silva', branch: 'Colombo', rating: 4.8, services: 238 },
      { name: 'Mike Johnson', branch: 'Galle', rating: 4.7, services: 220 }
    ],
    rooms: [
      { room: '501 - Presidential Suite', branch: 'Galle', bookings: 28, revenue: 10500 },
      { room: '305 - Deluxe Ocean View', branch: 'Galle', bookings: 32, revenue: 9800 },
      { room: '410 - Suite', branch: 'Colombo', bookings: 30, revenue: 9200 }
    ]
  }

  const recentBookings = [
    { id: 'BK-2025-12465', guest: 'Alice Cooper', room: '410', branch: 'Colombo', amount: 976, date: '2025-10-03', status: 'Confirmed' },
    { id: 'BK-2025-12464', guest: 'Robert Taylor', room: '506', branch: 'Kandy', amount: 840, date: '2025-10-03', status: 'Confirmed' },
    { id: 'BK-2025-12463', guest: 'Lisa Anderson', room: '312', branch: 'Galle', amount: 732, date: '2025-10-02', status: 'Confirmed' },
    { id: 'BK-2025-12462', guest: 'James Wilson', room: '208', branch: 'Colombo', amount: 658, date: '2025-10-02', status: 'Completed' },
    { id: 'BK-2025-12461', guest: 'Emma Brown', room: '501', branch: 'Galle', amount: 1400, date: '2025-10-02', status: 'Confirmed' }
  ]

  const stats = {
    totalRevenue: 458920,
    totalBookings: 1247,
    avgBookingValue: 368,
    occupancyRate: 78,
    totalGuests: 3542,
    repeatGuests: 1205,
    avgRating: 4.7,
    totalReviews: 892
  }

  const branches = [
    { id: 'all', name: 'All Branches' },
    { id: 'colombo', name: 'Sky Nest Colombo' },
    { id: 'kandy', name: 'Sky Nest Kandy' },
    { id: 'galle', name: 'Sky Nest Galle' }
  ]

  const reportTypes = [
    { id: 'overview', name: 'Business Overview', icon: '📊' },
    { id: 'revenue', name: 'Revenue Report', icon: '💰' },
    { id: 'occupancy', name: 'Occupancy Report', icon: '🏨' },
    { id: 'guests', name: 'Guest Analytics', icon: '👥' },
    { id: 'staff', name: 'Staff Performance', icon: '👔' },
    { id: 'services', name: 'Service Analytics', icon: '🛎️' }
  ]

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
                <span className="text-xl font-bold text-white">Reports & Analytics</span>
                <p className="text-xs text-gray-300 -mt-1">{currentTime}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                📥 Export PDF
              </button>
              <Link 
                href="/auth/admin-login"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {reportTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <span className="text-sm text-blue-600 font-medium">+8.3%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏨</span>
              </div>
              <span className="text-sm text-purple-600 font-medium">+5.2%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.occupancyRate}%</p>
            <p className="text-sm text-gray-600">Occupancy Rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">+0.3</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.avgRating}</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition">
                  Daily
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition">
                  Weekly
                </button>
                <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">
                  Monthly
                </button>
              </div>
            </div>

            {/* Simple Bar Chart Representation */}
            <div className="space-y-4">
              {revenueData.monthly.slice(0, 6).map((value, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 w-12">{revenueData.labels.monthly[idx]}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full flex items-center justify-end pr-4"
                      style={{ width: `${(value / 700000) * 100}%` }}
                    >
                      <span className="text-white text-sm font-semibold">${(value / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">${stats.avgBookingValue}</p>
                <p className="text-sm text-gray-600">Avg Booking Value</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
                <p className="text-sm text-gray-600">Total Guests</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round((stats.repeatGuests / stats.totalGuests) * 100)}%</p>
                <p className="text-sm text-gray-600">Repeat Rate</p>
              </div>
            </div>
          </div>

          {/* Occupancy by Branch */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Branch Occupancy</h2>
            
            <div className="space-y-6">
              {Object.entries(occupancyData).map(([key, data]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {key === 'colombo' ? 'Colombo' : key === 'kandy' ? 'Kandy' : 'Galle'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{data.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        data.percentage >= 80 ? 'bg-green-500' : 
                        data.percentage >= 60 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{data.occupied}/{data.total} rooms occupied</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Stay Duration</span>
                  <span className="font-semibold text-gray-900">3.2 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in Rate</span>
                  <span className="font-semibold text-gray-900">94%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cancellation Rate</span>
                  <span className="font-semibold text-gray-900">6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Staff</h2>
            <div className="space-y-4">
              {topPerformers.staff.map((staff, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{staff.name}</p>
                      <p className="text-sm text-gray-600">{staff.branch} • {staff.services} services</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-bold text-gray-900">{staff.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Revenue Rooms</h2>
            <div className="space-y-4">
              {topPerformers.rooms.map((room, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{room.room}</p>
                      <p className="text-sm text-gray-600">{room.branch} • {room.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${room.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Guest</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Room</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Branch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{booking.guest}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{booking.room}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{booking.branch}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">${booking.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}