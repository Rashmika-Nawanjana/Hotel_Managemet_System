'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Booking {
  id: string
  bookingReference: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  status: string
  paymentStatus: string
  specialRequests: string
  createdAt: string
  room: {
    id: string
    roomNumber: string
    floor: number
    status: string
    roomType: {
      id: string
      name: string
      slug: string
      basePrice: number
      maxOccupancy: number
      bedType: string
    }
    branch: {
      id: string
      name: string
      location: string
    }
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookings')
      }

      setBookings(result.bookings || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800'
      case 'CHECKED_OUT':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel booking')
      }

      // Refresh bookings
      await fetchBookings()
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/guest/search-rooms" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Sky Nest</span>
                <p className="text-xs text-gray-500 -mt-1">My Bookings</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/guest/search-rooms" className="text-gray-600 hover:text-blue-600 transition">Search Rooms</Link>
              <Link href="/guest/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Dashboard</Link>
            </div>
          </div>
                    </div>
                  </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your hotel reservations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">You haven't made any reservations yet</p>
            <Link 
              href="/guest/search-rooms"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Search Rooms
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                      <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {booking.room.roomType.name}
                        </h3>
                      <p className="text-gray-600 mb-2">
                        {booking.room.branch.name} • Room {booking.room.roomNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        Booking Reference: <span className="font-mono font-semibold">{booking.bookingReference}</span>
                        </p>
                      </div>
                      <div className="text-right">
                      <div className="flex space-x-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">${booking.totalPrice}</p>
                      </div>
                    </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                      <p className="text-gray-900">{formatDate(booking.checkInDate)}</p>
                      </div>
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                      <p className="text-gray-900">{formatDate(booking.checkOutDate)}</p>
                      </div>
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                      <p className="text-gray-900">{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</p>
                    </div>
                    </div>

                  {booking.specialRequests && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.specialRequests}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Booked on {formatDate(booking.createdAt)}
                    </div>
                    <div className="flex space-x-3">
                        <Link 
                          href={`/guest/booking/confirmation?bookingId=${booking.id}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                        >
                          View Details
                        </Link>
                      {booking.status === 'PENDING' && (
                          <button
                          onClick={() => cancelBooking(booking.id)}
                          className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                        >
                          Cancel Booking
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      </div>
    </div>
  )
}