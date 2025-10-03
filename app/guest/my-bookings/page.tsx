'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MyBookingsPage() {
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock bookings data - in real app, fetch from API
  const bookings = [
    {
      id: 'BK-2025-12345',
      confirmationNumber: 'SKN-GLE-2025-12345',
      status: 'Confirmed',
      room: 'Deluxe Ocean View Suite',
      branch: 'Sky Nest Galle',
      branchId: 'galle',
      checkIn: '2025-11-10',
      checkOut: '2025-11-14',
      nights: 4,
      guests: 2,
      totalAmount: 976,
      paidAmount: 976,
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=300',
      canCancel: true,
      canModify: true
    },
    {
      id: 'BK-2025-12344',
      confirmationNumber: 'SKN-COL-2025-12344',
      status: 'Checked-In',
      room: 'Presidential Suite',
      branch: 'Sky Nest Colombo',
      branchId: 'colombo',
      checkIn: '2025-10-01',
      checkOut: '2025-10-05',
      nights: 4,
      guests: 3,
      totalAmount: 1680,
      paidAmount: 1680,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300',
      canCancel: false,
      canModify: false
    },
    {
      id: 'BK-2025-12343',
      confirmationNumber: 'SKN-KND-2025-12343',
      status: 'Completed',
      room: 'Suite',
      branch: 'Sky Nest Kandy',
      branchId: 'kandy',
      checkIn: '2025-09-15',
      checkOut: '2025-09-18',
      nights: 3,
      guests: 2,
      totalAmount: 732,
      paidAmount: 732,
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=300',
      canCancel: false,
      canModify: false
    },
    {
      id: 'BK-2025-12342',
      confirmationNumber: 'SKN-GLE-2025-12342',
      status: 'Cancelled',
      room: 'Deluxe Room',
      branch: 'Sky Nest Galle',
      branchId: 'galle',
      checkIn: '2025-08-20',
      checkOut: '2025-08-23',
      nights: 3,
      guests: 2,
      totalAmount: 439,
      paidAmount: 439,
      refundAmount: 439,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300',
      canCancel: false,
      canModify: false
    }
  ]

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status.toLowerCase() === filterStatus.toLowerCase())

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'checked-in':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '✓'
      case 'checked-in':
        return '🏨'
      case 'completed':
        return '✓✓'
      case 'cancelled':
        return '✗'
      case 'pending':
        return '⏳'
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
            <Link href="/guest/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Sky Nest</span>
                <p className="text-xs text-gray-500 -mt-1">My Bookings</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/guest/search-rooms" className="text-gray-600 hover:text-blue-600 transition">
                New Booking
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage and track all your reservations</p>
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
              All Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed ({bookings.filter(b => b.status === 'Confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('checked-in')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'checked-in'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Checked-In ({bookings.filter(b => b.status === 'Checked-In').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({bookings.filter(b => b.status === 'Completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled ({bookings.filter(b => b.status === 'Cancelled').length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-1/3 relative">
                    <img 
                      src={booking.image} 
                      alt={booking.room}
                      className="w-full h-64 md:h-full object-cover"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                      <span className="text-sm font-semibold flex items-center">
                        <span className="mr-1">{getStatusIcon(booking.status)}</span>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{booking.room}</h3>
                        <p className="text-gray-600 flex items-center">
                          <span className="mr-1">📍</span>
                          {booking.branch}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Booking ID</p>
                        <p className="font-semibold text-gray-900">{booking.id}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Check-in</p>
                        <p className="font-semibold text-gray-900">{booking.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Check-out</p>
                        <p className="font-semibold text-gray-900">{booking.checkOut}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Duration</p>
                        <p className="font-semibold text-gray-900">{booking.nights} night{booking.nights > 1 ? 's' : ''}, {booking.guests} guest{booking.guests > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">${booking.totalAmount}</p>
                        {booking.paidAmount === booking.totalAmount ? (
                          <p className="text-sm text-green-600 font-medium">✓ Fully Paid</p>
                        ) : (
                          <p className="text-sm text-orange-600 font-medium">⚠️ ${booking.totalAmount - booking.paidAmount} pending</p>
                        )}
                        {booking.refundAmount && (
                          <p className="text-sm text-blue-600 font-medium">↩️ ${booking.refundAmount} refunded</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link 
                          href={`/guest/my-bookings/${booking.id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                          View Details
                        </Link>
                        
                        {booking.canModify && (
                          <Link 
                            href={`/guest/my-bookings/modify/${booking.id}`}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
                          >
                            Modify
                          </Link>
                        )}

                        {booking.canCancel && (
                          <Link 
                            href={`/guest/my-bookings/cancel/${booking.id}`}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                          >
                            Cancel
                          </Link>
                        )}

                        {booking.status === 'Completed' && (
                          <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium">
                            ⭐ Rate Stay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">🏨</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't made any bookings yet. Start planning your next trip!"
                : `You don't have any ${filterStatus} bookings.`}
            </p>
            <Link 
              href="/guest/search-rooms"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Browse Rooms
            </Link>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">ℹ️</span>
            Booking Information
          </h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>• You can modify your booking up to 5 days before check-in</li>
            <li>• Free cancellation is available until 5 days before check-in</li>
            <li>• For bookings within 1-4 days of check-in, a 1-night penalty applies</li>
            <li>• Contact customer support for any special requests or assistance</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link href="/guest/search-rooms" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
            <span className="text-4xl mb-3 block">🔍</span>
            <h4 className="font-semibold text-gray-900 mb-2">New Booking</h4>
            <p className="text-sm text-gray-600">Search and book your next stay</p>
          </Link>

          <Link href="/guest/services" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
            <span className="text-4xl mb-3 block">🛎️</span>
            <h4 className="font-semibold text-gray-900 mb-2">Add Services</h4>
            <p className="text-sm text-gray-600">Enhance your upcoming stays</p>
          </Link>

          <Link href="/guest/help/contact" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
            <span className="text-4xl mb-3 block">💬</span>
            <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
            <p className="text-sm text-gray-600">We're here to help 24/7</p>
          </Link>
        </div>
      </div>
    </div>
  )
}