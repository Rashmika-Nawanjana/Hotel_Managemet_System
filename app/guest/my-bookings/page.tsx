'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch bookings')

      const data = await response.json()
      setBookings(data.data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (!response.ok) throw new Error('Failed to cancel booking')

      alert('Booking cancelled successfully')
      fetchBookings()
    } catch (err) {
      alert('Failed to cancel booking')
    }
  }

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status.toLowerCase() === filterStatus.toLowerCase())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '✓'
      case 'PENDING':
        return '⏳'
      case 'CANCELLED':
        return '✗'
      case 'COMPLETED':
        return '✓✓'
      default:
        return '•'
    }
  }

  const canCancel = (booking: any) => {
    const checkInDate = new Date(booking.checkInDate)
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return booking.status === 'CONFIRMED' && daysUntilCheckIn >= 5
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Rest of your existing JSX remains the same until the bookings map... */}
      
      {/* Replace the bookings map with this: */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map(booking => {
            const primaryImage = booking.room?.roomType?.images?.find((img: any) => img.isPrimary)
            const nights = Math.ceil(
              (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 
              (1000 * 60 * 60 * 24)
            )

            return (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-1/3 relative">
                    <img 
                      src={primaryImage?.url || '/placeholder-room.jpg'} 
                      alt={booking.room?.roomType?.name}
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
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {booking.room?.roomType?.name}
                        </h3>
                        <p className="text-gray-600 flex items-center">
                          <span className="mr-1">📍</span>
                          {booking.room?.branch?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Booking Ref</p>
                        <p className="font-semibold text-gray-900">{booking.bookingReference}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Check-in</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Check-out</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Duration</p>
                        <p className="font-semibold text-gray-900">
                          {nights} night{nights > 1 ? 's' : ''}, {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">LKR {booking.totalPrice.toFixed(2)}</p>
                        {booking.paymentStatus === 'PAID' ? (
                          <p className="text-sm text-green-600 font-medium">✓ Fully Paid</p>
                        ) : (
                          <p className="text-sm text-orange-600 font-medium">⚠️ Payment Pending</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link 
                          href={`/guest/booking/confirmation?bookingId=${booking.id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                          View Details
                        </Link>

                        {canCancel(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                          >
                            Cancel
                          </button>
                        )}

                        {booking.status === 'COMPLETED' && (
                          <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium">
                            ⭐ Rate Stay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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
            href="/rooms"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Browse Rooms
          </Link>
        </div>
      )}
    </div>
  )
}