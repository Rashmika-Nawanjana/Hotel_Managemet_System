'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, CheckCircle, Clock, User, Calendar, MapPin, Bed, Users, DollarSign, AlertCircle, LogOut, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

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
  isOverdueCheckout?: boolean
  isDueToday?: boolean
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

interface StaffUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  firstname?: string
  lastname?: string
  role: string
  staffRole?: 'MANAGEMENT' | 'FRONT_DESK'
  branchId?: string
  department?: string
  position?: string
  employeeId?: string
  permissions?: string[]
  branch?: {
    name?: string
    location?: string
    address?: string
    phone?: string
    email?: string
  }
}

export default function CheckOutPage() {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [extensionData, setExtensionData] = useState({
    newCheckOutDate: '',
    extensionReason: '',
    additionalCharges: 0
  })
  const [roomAvailability, setRoomAvailability] = useState<any>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBookings, setTotalBookings] = useState(0)
  const [currentSection, setCurrentSection] = useState<'all' | 'pending' | 'checked_in'>('all')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const router = useRouter()

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

  // Fetch bookings for check-out
  useEffect(() => {
    if (!staffUser) return

    const fetchBookings = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
          section: currentSection
        })
        
        const response = await fetch(`/api/staff/bookings/checkout?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch bookings')
        }
        const data = await response.json()
        setBookings(data.bookings || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalBookings(data.pagination?.total || 0)
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError('Failed to load bookings')
      } finally {
        setLoading(false)
        setIsLoadingMore(false)
      }
    }

    fetchBookings()
  }, [staffUser, currentPage, currentSection])

  // Handle section change
  const handleSectionChange = (section: 'all' | 'pending' | 'checked_in') => {
    setCurrentSection(section)
    setCurrentPage(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCheckOut = async (booking: Booking) => {
    try {
      setIsProcessing(true)
      setError('')
      setSuccessMessage('')

      const response = await fetch(`/api/staff/bookings/${booking.id}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: staffUser?.id,
          checkOutTime: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check out guest')
      }

      const result = await response.json()
      setSuccessMessage(`Successfully checked out ${booking.user.firstName} ${booking.user.lastName} from Room ${booking.room.roomNumber}`)
      
      // Update the booking in the list
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { ...b, status: 'CHECKED_OUT' }
          : b
      ))
      
      setSelectedBooking(null)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (err) {
      console.error('Check-out error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check out guest')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExtendBooking = async () => {
    if (!selectedBooking) return

    try {
      setIsProcessing(true)
      setError('')
      setSuccessMessage('')

      const response = await fetch(`/api/staff/bookings/${selectedBooking.id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newCheckOutDate: extensionData.newCheckOutDate,
          extensionReason: extensionData.extensionReason,
          additionalCharges: extensionData.additionalCharges
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to extend booking')
      }

      const result = await response.json()
      setSuccessMessage(`Successfully extended booking until ${new Date(extensionData.newCheckOutDate).toLocaleDateString()}`)
      
      // Update the booking in the list
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id 
          ? { 
              ...b, 
              checkOutDate: extensionData.newCheckOutDate,
              totalPrice: result.booking.newTotalPrice
            }
          : b
      ))
      
      setShowExtensionModal(false)
      setSelectedBooking(null)
      setExtensionData({
        newCheckOutDate: '',
        extensionReason: '',
        additionalCharges: 0
      })
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (err) {
      console.error('Extension error:', err)
      setError(err instanceof Error ? err.message : 'Failed to extend booking')
    } finally {
      setIsProcessing(false)
    }
  }

  const checkRoomAvailabilityForExtension = async (booking: Booking, newCheckOutDate: string) => {
    try {
      setCheckingAvailability(true)
      setError('')

      const response = await fetch(
        `/api/staff/rooms/availability?roomId=${booking.room.id}&checkInDate=${booking.checkOutDate}&checkOutDate=${newCheckOutDate}&excludeBookingId=${booking.id}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check room availability')
      }

      const result = await response.json()
      setRoomAvailability(result.availability)
      
    } catch (err) {
      console.error('Room availability check error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check room availability')
    } finally {
      setCheckingAvailability(false)
    }
  }

  const openExtensionModal = (booking: Booking) => {
    setSelectedBooking(booking)
    
    // Set default extension date to tomorrow or current check-out date, whichever is later
    const currentCheckOut = new Date(booking.checkOutDate)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultExtensionDate = currentCheckOut > tomorrow ? currentCheckOut : tomorrow
    
    setExtensionData({
      newCheckOutDate: defaultExtensionDate.toISOString().split('T')[0],
      extensionReason: '',
      additionalCharges: 0
    })
    setRoomAvailability(null)
    setShowExtensionModal(true)
  }

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase()
    return (
      booking.bookingReference.toLowerCase().includes(searchLower) ||
      booking.user.firstName.toLowerCase().includes(searchLower) ||
      booking.user.lastName.toLowerCase().includes(searchLower) ||
      booking.user.email.toLowerCase().includes(searchLower) ||
      booking.room.roomNumber.toLowerCase().includes(searchLower)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'CHECKED_IN': return 'bg-green-100 text-green-800'
      case 'CHECKED_OUT': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'REFUNDED': return 'bg-blue-100 text-blue-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading check-out data...</p>
        </div>
      </div>
    )
  }

  if (error && !staffUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/auth/staff-login" className="text-blue-600 hover:underline">
            Return to Login
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
            <div className="flex items-center space-x-4">
              <Link href="/staff/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Guest Check-Out</h1>
                <p className="text-sm text-gray-600">Process guest departures</p>
                <p className="text-xs text-blue-600 font-medium">
                  📍 {staffUser?.branch?.name || 'Branch Assignment Pending'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {staffUser?.firstName || staffUser?.firstname || 'Staff'} {staffUser?.lastName || staffUser?.lastname || ''}
              </p>
              <p className="text-xs text-gray-500">{staffUser?.employeeId || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Search Bar and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by booking reference, guest name, email, or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Filter:</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => handleSectionChange('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentSection === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Bookings ({totalBookings})
              </button>
              <button
                onClick={() => handleSectionChange('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentSection === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming Check-outs
              </button>
              <button
                onClick={() => handleSectionChange('checked_in')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentSection === 'checked_in'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ready for Check-out
              </button>
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentSection === 'all' && 'All Bookings'}
                  {currentSection === 'pending' && 'Upcoming Check-outs'}
                  {currentSection === 'checked_in' && 'Ready for Check-out'}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentSection === 'all' && 'All confirmed and checked-in bookings'}
                  {currentSection === 'pending' && 'Confirmed bookings - guests not yet checked in'}
                  {currentSection === 'checked_in' && 'Checked-in guests ready for check-out'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} • {filteredBookings.length} of {totalBookings} bookings
              </div>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <LogOut className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria' : 'No bookings found for check-out processing'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className={`p-6 hover:bg-gray-50 transition-colors ${
                  booking.isOverdueCheckout ? 'bg-red-50 border-l-4 border-red-500' : 
                  booking.isDueToday ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.user.firstName} {booking.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{booking.user.email}</p>
                          {booking.isOverdueCheckout && (
                            <p className="text-sm text-red-600 font-medium mt-1">
                              ⚠️ Overdue Check-out - {Math.ceil((new Date().getTime() - new Date(booking.checkOutDate).getTime()) / (1000 * 60 * 60 * 24))} days late
                            </p>
                          )}
                          {booking.isDueToday && !booking.isOverdueCheckout && (
                            <p className="text-sm text-yellow-600 font-medium mt-1">
                              ⏰ Due for check-out today
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                          {booking.isOverdueCheckout && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Check-in</p>
                            <p className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Check-out</p>
                            <p className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Bed className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Room</p>
                            <p className="font-medium">{booking.room.roomNumber} - Floor {booking.room.floor}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Guests</p>
                            <p className="font-medium">{booking.numberOfGuests}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Booking Reference:</span> {booking.bookingReference}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Room Type:</span> {booking.room.roomType.name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Total Price:</span> ${booking.totalPrice.toFixed(2)}
                        </p>
                        {booking.specialRequests && (
                          <p className="text-gray-600">
                            <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-6">
                      {booking.status === 'CHECKED_IN' ? (
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCheckOut(booking)}
                              disabled={isProcessing}
                              className={`px-4 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors ${
                                booking.isOverdueCheckout ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              <LogOut className="h-5 w-5" />
                              <span>{isProcessing ? 'Processing...' : 'Check Out'}</span>
                            </button>
                            <button
                              onClick={() => openExtensionModal(booking)}
                              disabled={isProcessing}
                              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                            >
                              <Clock className="h-5 w-5" />
                              <span>Extend</span>
                            </button>
                          </div>
                          {booking.isOverdueCheckout && (
                            <p className="text-xs text-red-600 text-center">
                              Urgent: Overdue check-out
                            </p>
                          )}
                        </div>
                      ) : booking.status === 'CONFIRMED' ? (
                        <div className="text-right">
                          <p className="text-sm text-blue-600 mb-1 font-medium">Awaiting Check-in</p>
                          <p className="text-xs text-gray-500">
                            Guest needs to check in first
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Cannot check out</p>
                          <p className="text-xs text-gray-500">
                            {booking.status === 'CHECKED_OUT' ? 'Already checked out' : 'Invalid status'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === totalPages
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalBookings)} of {totalBookings} results
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extension Modal */}
      {showExtensionModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Extend Booking
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest
                </label>
                <p className="text-sm text-gray-900">
                  {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  Room {selectedBooking.room.roomNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Check-out Date
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Check-out Date *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={extensionData.newCheckOutDate}
                    onChange={(e) => {
                      setExtensionData(prev => ({ ...prev, newCheckOutDate: e.target.value }))
                      setRoomAvailability(null) // Clear previous availability check
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => checkRoomAvailabilityForExtension(selectedBooking, extensionData.newCheckOutDate)}
                    disabled={checkingAvailability || !extensionData.newCheckOutDate || extensionData.newCheckOutDate <= selectedBooking.checkOutDate}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingAvailability ? 'Checking...' : 'Check'}
                  </button>
                </div>
                
                {roomAvailability && (
                  <div className="mt-2 text-sm">
                    {roomAvailability.isAvailable ? (
                      <p className="text-green-600">
                        ✓ Room available for extension
                      </p>
                    ) : (
                      <div className="text-red-600">
                        <p>✗ Room not available for extension</p>
                        {roomAvailability.conflicts.length > 0 && (
                          <div className="mt-1 text-xs">
                            <p>Conflicts with:</p>
                            <ul className="list-disc list-inside ml-2">
                              {roomAvailability.conflicts.map((conflict: any, index: number) => (
                                <li key={index}>
                                  {conflict.guestName} ({conflict.bookingReference})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extension Reason
                </label>
                <textarea
                  value={extensionData.extensionReason}
                  onChange={(e) => setExtensionData(prev => ({ ...prev, extensionReason: e.target.value }))}
                  placeholder="Reason for extension..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Charges (LKR)
                </label>
                <input
                  type="number"
                  value={extensionData.additionalCharges}
                  onChange={(e) => setExtensionData(prev => ({ ...prev, additionalCharges: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowExtensionModal(false)
                  setSelectedBooking(null)
                  setExtensionData({
                    newCheckOutDate: '',
                    extensionReason: '',
                    additionalCharges: 0
                  })
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendBooking}
                disabled={isProcessing || !extensionData.newCheckOutDate || (roomAvailability && !roomAvailability.isAvailable)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Extend Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
