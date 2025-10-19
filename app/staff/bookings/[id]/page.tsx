'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface StaffUser {
  id: string
  firstname: string
  lastname: string
  email: string
  role: string
  staffRole: string
  branchId: string
  branchName: string
}

interface Booking {
  id: string
  bookingReference: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  status: string
  paymentStatus: string
  specialRequests?: string
  createdAt: string
  updatedAt: string
  firstname: string
  lastname: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  idType: string
  idNumber: string
  address: string
  city: string
  postalCode: string
  roomNumber: string
  room_type_name: string
  room_price: number
  branch_name: string
  branch_address: string
}

export default function BookingDetailPage() {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id

  // Fetch staff user data
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch('/api/auth/staff-me')
        if (!response.ok) {
          throw new Error('Failed to fetch staff data')
        }
        const data = await response.json()
        
        if (data.user.role !== 'STAFF') {
          router.push('/auth/staff-login')
          return
        }
        
        setStaffUser(data.user)
      } catch (err) {
        console.error('Error fetching staff data:', err)
        setError('Failed to load staff data')
        router.push('/auth/staff-login')
      }
    }

    fetchStaffData()
  }, [router])

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || !staffUser) return

      try {
        setLoading(true)
        setError('')

        const response = await fetch(`/api/staff/bookings/${bookingId}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch booking')
        }

        const data = await response.json()
        setBooking(data.booking)
        
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch booking')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, staffUser])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'CHECKED_IN':
        return 'bg-green-100 text-green-800'
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
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !staffUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!staffUser) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/staff/bookings"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Booking Not Found</div>
          <Link
            href="/staff/bookings"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="mt-1 text-sm text-gray-500">
                {booking.bookingReference}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/staff/bookings"
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Back to Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Reference</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.bookingReference}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(booking.checkInDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(booking.checkOutDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.numberOfGuests}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Price</label>
                  <p className="mt-1 text-sm text-gray-900">${booking.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTime(booking.createdAt)}</p>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Guest Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.firstname} {booking.lastname}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(booking.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.nationality}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Type</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.idType.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Number</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.idNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.address}<br />
                    {booking.city}, {booking.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Room Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Room Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Number</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.roomNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Type</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.room_type_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                  <p className="mt-1 text-sm text-gray-900">${booking.room_price.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.branch_name}</p>
                  <p className="mt-1 text-sm text-gray-500">{booking.branch_address}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {booking.status === 'PENDING' && (
                  <Link
                    href={`/staff/check-in?booking=${booking.id}`}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-center block hover:bg-green-700"
                  >
                    Confirm Booking
                  </Link>
                )}
                {booking.status === 'CONFIRMED' && (
                  <Link
                    href={`/staff/check-in?booking=${booking.id}`}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-center block hover:bg-blue-700"
                  >
                    Check In Guest
                  </Link>
                )}
                {booking.status === 'CHECKED_IN' && (
                  <Link
                    href={`/staff/check-out?booking=${booking.id}`}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-md text-center block hover:bg-orange-700"
                  >
                    Check Out Guest
                  </Link>
                )}
                <Link
                  href="/staff/bookings"
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-center block hover:bg-gray-700"
                >
                  Back to All Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
