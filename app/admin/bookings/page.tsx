'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/app/components/AdminSidebar'
import { Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'

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

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>
    {children}
  </div>
)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500/10 text-yellow-400'
    case 'CONFIRMED':
      return 'bg-green-500/10 text-green-400'
    case 'CHECKED_IN':
      return 'bg-blue-500/10 text-blue-400'
    case 'CHECKED_OUT':
      return 'bg-gray-500/10 text-gray-400'
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-400'
    default:
      return 'bg-gray-500/10 text-gray-400'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500/10 text-yellow-400'
    case 'PAID':
      return 'bg-green-500/10 text-green-400'
    case 'REFUNDED':
      return 'bg-blue-500/10 text-blue-400'
    case 'FAILED':
      return 'bg-red-500/10 text-red-400'
    default:
      return 'bg-gray-500/10 text-gray-400'
  }
}

export default function AdminBookingsPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Fetch bookings
  const fetchBookings = async (p: number = 1) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings?page=${p}&limit=10`, { credentials: 'include' })
      if (!res.ok) throw new Error('Unauthorized or failed to fetch bookings')
      const data = await res.json()
      setBookings(data.bookings || [])
      setTotal(data.total || 0)
      setPage(data.page || p)
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(page)
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / 10))

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    fetchBookings(p)
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status.toLowerCase() === filterStatus.toLowerCase()
    const matchesPaymentStatus = filterPaymentStatus === 'all' || booking.paymentStatus.toLowerCase() === filterPaymentStatus.toLowerCase()
    const matchesSearch = searchQuery === '' || 
      booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesPaymentStatus && matchesSearch
  })

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      
      if (!res.ok) throw new Error('Failed to update booking')
      
      // Refresh bookings
      await fetchBookings(page)
    } catch (err: any) {
      setError(err.message || 'Failed to update booking')
    }
  }

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!res.ok) throw new Error('Failed to delete booking')
      
      // Refresh bookings
      await fetchBookings(page)
    } catch (err: any) {
      setError(err.message || 'Failed to delete booking')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      <main
        className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'pl-24' : 'pl-72'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-l">
                Booking Management
              </h1>
              <p className="text-gray-400">
                Manage all hotel bookings, check-ins, and payments.
              </p>
            </div>
          </header>

          <Card>
            <div className="p-6 flex flex-wrap gap-4 items-center justify-between border-b border-gray-800">
              <div className="flex space-x-2 bg-[#10141c] p-1 rounded-md">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterStatus === 'all'
                      ? 'bg-amber-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterStatus === 'pending'
                      ? 'bg-amber-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('confirmed')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterStatus === 'confirmed'
                      ? 'bg-amber-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setFilterStatus('checked_in')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterStatus === 'checked_in'
                      ? 'bg-amber-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  Checked In
                </button>
                <button
                  onClick={() => setFilterStatus('cancelled')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterStatus === 'cancelled'
                      ? 'bg-amber-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  Cancelled
                </button>
              </div>

              <div className="flex space-x-2 bg-[#10141c] p-1 rounded-md">
                <button
                  onClick={() => setFilterPaymentStatus('all')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterPaymentStatus === 'all'
                      ? 'bg-amber-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  All Payments
                </button>
                <button
                  onClick={() => setFilterPaymentStatus('pending')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterPaymentStatus === 'pending'
                      ? 'bg-amber-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  Payment Pending
                </button>
                <button
                  onClick={() => setFilterPaymentStatus('paid')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterPaymentStatus === 'paid'
                      ? 'bg-amber-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  Paid
                </button>
              </div>

              <div className="relative w-full max-w-xs">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#10141c] border border-gray-700 rounded-md pl-10 pr-4 py-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-400">
                  Loading bookings...
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-400">{error}</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">Booking</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">Guest</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">Room</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">Dates</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">Payment</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-400">Total</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">
                            {booking.bookingReference}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(booking.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">
                            {booking.user.firstName} {booking.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{booking.user.email}</p>
                          <p className="text-sm text-gray-500">{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">
                            {booking.room.roomType.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Room {booking.room.roomNumber} • {booking.room.branch.name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">
                            {formatDate(booking.checkInDate)}
                          </p>
                          <p className="text-sm text-gray-500">
                            to {formatDate(booking.checkOutDate)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">
                            ${booking.totalPrice}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="p-2 text-gray-400 hover:text-blue-400"
                              onClick={() => window.open(`/guest/booking/confirmation?bookingId=${booking.id}`, '_blank')}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {booking.status === 'PENDING' && (
                              <button
                                className="p-2 text-gray-400 hover:text-green-400"
                                onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                title="Confirm Booking"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            
                            {booking.status === 'CONFIRMED' && (
                              <button
                                className="p-2 text-gray-400 hover:text-blue-400"
                                onClick={() => updateBookingStatus(booking.id, 'CHECKED_IN')}
                                title="Check In"
                              >
                                <Clock size={16} />
                              </button>
                            )}
                            
                            {booking.status === 'CHECKED_IN' && (
                              <button
                                className="p-2 text-gray-400 hover:text-gray-400"
                                onClick={() => updateBookingStatus(booking.id, 'CHECKED_OUT')}
                                title="Check Out"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                            
                            <button
                              className="p-2 text-gray-400 hover:text-red-400"
                              onClick={() => deleteBooking(booking.id)}
                              title="Delete Booking"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-6 py-3">
              <div className="text-sm text-gray-400">
                Page {page} of {totalPages} • {total} total bookings
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}