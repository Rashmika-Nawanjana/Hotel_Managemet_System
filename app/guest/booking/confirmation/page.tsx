'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  room: {
    id: string
    roomNumber: string
    floor: number
    status: string
    roomType: {
      id: string
      name: string
      slug: string
      description: string
      basePrice: number
      maxOccupancy: number
      bedType: string
      numberOfBeds: number
      roomSize: number
      viewType: string
      images?: Array<{
        id: string
        url: string
        caption: string
        altText: string
        isPrimary: boolean
        order: number
      }>
      amenities?: Array<{
        id: string
        name: string
        icon: string
        category: string
      }>
    }
    branch: {
      id: string
      name: string
      location: string
      address: string
    }
  }
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('bookingId')

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    } else {
      setError('No booking ID provided')
      setLoading(false)
    }
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch booking')
      }

      setBooking(result.booking)
    } catch (err: any) {
      setError(err.message || 'Failed to load booking details')
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

  const calculateNights = () => {
    if (!booking) return 0
    const checkIn = new Date(booking.checkInDate)
    const checkOut = new Date(booking.checkOutDate)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking confirmation...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
          <Link 
            href="/guest/search-rooms"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search Rooms
          </Link>
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
                <p className="text-xs text-gray-500 -mt-1">Booking Confirmation</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/guest/my-bookings" className="text-gray-600 hover:text-blue-600 transition">My Bookings</Link>
              <Link href="/guest/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your reservation has been successfully created</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booking Reference</label>
                  <p className="text-lg font-mono font-semibold text-blue-600">{booking.bookingReference}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <p className="text-gray-900">{formatDate(booking.checkInDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                  <p className="text-gray-900">{formatDate(booking.checkOutDate)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                  <p className="text-gray-900">{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Room Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Details</h2>
              
              <div className="flex items-start space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {booking.room.roomType.images?.[0] ? (
                    <img 
                      src={booking.room.roomType.images[0].url} 
                      alt={booking.room.roomType.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-2xl">🏨</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{booking.room.roomType.name}</h3>
                  <p className="text-gray-600 mb-2">{booking.room.branch.name}</p>
                  <p className="text-sm text-gray-600 mb-2">Room {booking.room.roomNumber} • Floor {booking.room.floor}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>🛏️ {booking.room.roomType.bedType}</span>
                    <span>👥 Up to {booking.room.roomType.maxOccupancy} guests</span>
                    <span>📐 {booking.room.roomType.roomSize} sqm</span>
                    {booking.room.roomType.viewType && <span>🌅 {booking.room.roomType.viewType}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{booking.user.firstName} {booking.user.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{booking.user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{booking.user.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                  <p className="text-gray-900">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Price per night:</span>
                  <span>${booking.room.roomType.basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Number of nights:</span>
                  <span>{calculateNights()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span>${booking.totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Payment Information</h3>
                <p className="text-sm text-blue-800">
                  Your credit card has been securely stored and will be charged at check-in. 
                  You can cancel this booking up to 24 hours before your check-in date.
                </p>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Information</h2>
              
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Check-in time: 3:00 PM</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Check-out time: 11:00 AM</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Free cancellation up to 24 hours before check-in</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Please bring a valid ID for check-in</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Contact the hotel for any special arrangements</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href="/guest/my-bookings"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition text-center block"
              >
                View All Bookings
              </Link>
              <Link 
                href="/guest/search-rooms"
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition text-center block"
              >
                Book Another Room
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}