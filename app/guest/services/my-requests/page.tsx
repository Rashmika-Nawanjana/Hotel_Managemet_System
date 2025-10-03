'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MyServiceRequestsPage() {
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock service requests data - in real app, fetch from API
  const serviceRequests = [
    {
      id: 'SR-2025-001',
      service: {
        name: 'Spa Treatment',
        icon: '💆',
        category: 'Spa & Wellness'
      },
      status: 'Pending',
      date: '2025-10-15',
      time: '2:00 PM',
      location: 'Spa Venue',
      numberOfPeople: 2,
      submittedAt: '2025-10-02 08:29:35',
      estimatedPrice: 138,
      canCancel: true,
      canModify: true
    },
    {
      id: 'SR-2025-002',
      service: {
        name: 'Airport Transfer',
        icon: '✈️',
        category: 'Transport'
      },
      status: 'Confirmed',
      date: '2025-11-10',
      time: '1:00 PM',
      location: 'Hotel Lobby',
      numberOfPeople: 2,
      submittedAt: '2025-10-01 14:22:18',
      confirmedAt: '2025-10-01 15:10:42',
      estimatedPrice: 50,
      canCancel: true,
      canModify: false,
      notes: 'Driver will meet you at the lobby. Flight details noted.'
    },
    {
      id: 'SR-2025-003',
      service: {
        name: 'Room Service',
        icon: '🍴',
        category: 'Dining'
      },
      status: 'Completed',
      date: '2025-09-28',
      time: '7:30 PM',
      location: 'Room 305',
      numberOfPeople: 2,
      submittedAt: '2025-09-28 19:15:22',
      completedAt: '2025-09-28 20:05:10',
      finalPrice: 45,
      canCancel: false,
      canModify: false,
      rating: 5
    },
    {
      id: 'SR-2025-004',
      service: {
        name: 'Fine Dining Restaurant',
        icon: '🍷',
        category: 'Dining'
      },
      status: 'In Progress',
      date: '2025-10-02',
      time: '7:00 PM',
      location: 'Ocean View Restaurant',
      numberOfPeople: 2,
      submittedAt: '2025-10-01 10:30:15',
      confirmedAt: '2025-10-01 11:45:22',
      estimatedPrice: 95,
      canCancel: false,
      canModify: false,
      notes: 'Table reserved by the window. Chef\'s special menu prepared.'
    },
    {
      id: 'SR-2025-005',
      service: {
        name: 'Laundry Service',
        icon: '👔',
        category: 'Other Services'
      },
      status: 'Cancelled',
      date: '2025-09-25',
      time: 'N/A',
      location: 'Room 305',
      numberOfPeople: 1,
      submittedAt: '2025-09-24 16:40:11',
      cancelledAt: '2025-09-25 08:15:33',
      canCancel: false,
      canModify: false,
      cancellationReason: 'Changed plans - leaving hotel earlier'
    }
  ]

  const filteredRequests = filterStatus === 'all' 
    ? serviceRequests 
    : serviceRequests.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase().replace('-', ' '))

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'in progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✓'
      case 'in progress':
        return '🔄'
      case 'completed':
        return '✓✓'
      case 'cancelled':
        return '✗'
      default:
        return '•'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/guest/services" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Sky Nest</span>
                <p className="text-xs text-gray-500 -mt-1">My Service Requests</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/guest/services" className="text-gray-600 hover:text-blue-600 transition">
                Browse Services
              </Link>
              <Link href="/guest/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Service Requests</h1>
          <p className="text-gray-600">Track and manage all your service requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Requests ({serviceRequests.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({serviceRequests.filter(r => r.status === 'Pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed ({serviceRequests.filter(r => r.status === 'Confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('in-progress')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'in-progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress ({serviceRequests.filter(r => r.status === 'In Progress').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({serviceRequests.filter(r => r.status === 'Completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled ({serviceRequests.filter(r => r.status === 'Cancelled').length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-6">
            {filteredRequests.map(request => (
              <div key={request.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
                        {request.service.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{request.service.name}</h3>
                        <p className="text-sm text-gray-600">{request.service.category}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                      <span className="text-sm font-semibold flex items-center">
                        <span className="mr-1">{getStatusIcon(request.status)}</span>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Request ID</p>
                      <p className="font-semibold text-gray-900">{request.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <p className="font-semibold text-gray-900">{request.date}</p>
                      <p className="text-sm text-gray-600">{request.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="font-semibold text-gray-900">{request.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">People</p>
                      <p className="font-semibold text-gray-900">{request.numberOfPeople}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <span>📅</span>
                      <span>Submitted: {request.submittedAt}</span>
                    </div>
                    {request.confirmedAt && (
                      <div className="flex items-center space-x-2 text-sm text-green-600 mb-2">
                        <span>✓</span>
                        <span>Confirmed: {request.confirmedAt}</span>
                      </div>
                    )}
                    {request.completedAt && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <span>✓✓</span>
                        <span>Completed: {request.completedAt}</span>
                      </div>
                    )}
                    {request.cancelledAt && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 mb-2">
                        <span>✗</span>
                        <span>Cancelled: {request.cancelledAt}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes or Cancellation Reason */}
                  {request.notes && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Note:</strong> {request.notes}
                      </p>
                    </div>
                  )}
                  {request.cancellationReason && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-900">
                        <strong>Cancellation Reason:</strong> {request.cancellationReason}
                      </p>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        {request.finalPrice ? 'Final Price' : 'Estimated Price'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${request.finalPrice || request.estimatedPrice}
                      </p>
                      {request.status === 'Completed' && request.rating && (
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500">{'⭐'.repeat(request.rating)}</span>
                          <span className="text-sm text-gray-600 ml-2">Your rating</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link 
                        href={`/guest/services/request-details/${request.id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        View Details
                      </Link>

                      {request.canModify && (
                        <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium">
                          Modify
                        </button>
                      )}

                      {request.canCancel && (
                        <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium">
                          Cancel
                        </button>
                      )}

                      {request.status === 'Completed' && !request.rating && (
                        <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium">
                          ⭐ Rate Service
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">🛎️</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No service requests found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't requested any services yet."
                : `You don't have any ${filterStatus.replace('-', ' ')} service requests.`}
            </p>
            <Link 
              href="/guest/services"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Browse Services
            </Link>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">ℹ️</span>
            Service Request Status Guide
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-900">
            <div>
              <p><strong>⏳ Pending:</strong> Request submitted, awaiting staff review</p>
              <p><strong>✓ Confirmed:</strong> Service scheduled and confirmed</p>
              <p><strong>🔄 In Progress:</strong> Service is currently being delivered</p>
            </div>
            <div>
              <p><strong>✓✓ Completed:</strong> Service delivered successfully</p>
              <p><strong>✗ Cancelled:</strong> Request was cancelled</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link href="/guest/services" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
            <span className="text-4xl mb-3 block">🛎️</span>
            <h4 className="font-semibold text-gray-900 mb-2">Request New Service</h4>
            <p className="text-sm text-gray-600">Browse our service catalog</p>
          </Link>

          <Link href="/guest/help/contact" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
            <span className="text-4xl mb-3 block">💬</span>
            <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
            <p className="text-sm text-gray-600">Questions about your requests?</p>
          </Link>

          <Link href="/guest/dashboard" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
            <span className="text-4xl mb-3 block">🏠</span>
            <h4 className="font-semibold text-gray-900 mb-2">Back to Dashboard</h4>
            <p className="text-sm text-gray-600">Return to main dashboard</p>
          </Link>
        </div>
      </div>
    </div>
  )
}