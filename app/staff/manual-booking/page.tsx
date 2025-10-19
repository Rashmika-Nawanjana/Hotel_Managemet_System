'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

interface Room {
  id: string
  roomNumber: string
  status: string
  room_type_id: string
  room_type_name: string
  description: string
  price_per_night: number
  max_guests: number
  amenities: string[]
  branch_name: string
  branch_address: string
}

interface RoomType {
  id: string
  name: string
  description: string
  price_per_night: number
  max_guests: number
  amenities: string[]
}

export default function ManualBookingPage() {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form states
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [guests, setGuests] = useState(1)
  const [roomTypeId, setRoomTypeId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  
  // Guest information
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [nationality, setNationality] = useState('')
  const [idType, setIdType] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  
  // Data states
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const router = useRouter()

  // Set default dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setCheckInDate(today)
    setCheckOutDate(tomorrow)
  }, [])

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
      } finally {
        setLoading(false)
      }
    }

    fetchStaffData()
  }, [router])

  // Fetch available rooms when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && staffUser) {
      fetchAvailableRooms()
    }
  }, [checkInDate, checkOutDate, roomTypeId, staffUser])

  const fetchAvailableRooms = async () => {
    try {
      setLoadingRooms(true)
      setError('')
      
      const params = new URLSearchParams({
        checkInDate,
        checkOutDate
      })
      
      if (roomTypeId) {
        params.append('roomTypeId', roomTypeId)
      }
      
      console.log('Fetching available rooms with params:', {
        checkInDate,
        checkOutDate,
        roomTypeId,
        url: `/api/staff/rooms/available?${params}`
      })
      
      const response = await fetch(`/api/staff/rooms/available?${params}`)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to fetch available rooms')
      }
      
      const data = await response.json()
      console.log('Success response:', data)
      setRooms(data.rooms)
      setRoomTypes(data.roomTypes)
      
      // Reset selected room if it's no longer available
      if (selectedRoomId && !data.rooms.find((r: Room) => r.id === selectedRoomId)) {
        setSelectedRoomId('')
      }
      
    } catch (err) {
      console.error('Error fetching rooms:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch available rooms')
      setRooms([])
    } finally {
      setLoadingRooms(false)
    }
  }

  const calculateTotalPrice = () => {
    if (!selectedRoomId || !checkInDate || !checkOutDate) return 0
    
    const selectedRoom = rooms.find(r => r.id === selectedRoomId)
    if (!selectedRoom) return 0
    
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    return selectedRoom.price_per_night * nights
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRoomId) {
      setError('Please select a room')
      return
    }
    
    if (!firstname || !lastname || !email || !phone || !dateOfBirth || !nationality || !idType || !idNumber || !address || !city || !postalCode) {
      setError('Please fill in all required guest information')
      return
    }
    
    try {
      setSubmitting(true)
      setError('')
      setSuccessMessage('')
      
      const response = await fetch('/api/staff/bookings/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          phone,
          dateOfBirth,
          nationality,
          idType,
          idNumber,
          address,
          city,
          postalCode,
          roomId: selectedRoomId,
          checkInDate,
          checkOutDate,
          guests,
          specialRequests: specialRequests || null,
          totalPrice: calculateTotalPrice(),
          paymentMethod: 'CASH'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }
      
      const data = await response.json()
      setSuccessMessage(data.message)
      
      // Reset form
      setFirstname('')
      setLastname('')
      setEmail('')
      setPhone('')
      setDateOfBirth('')
      setNationality('')
      setIdType('')
      setIdNumber('')
      setAddress('')
      setCity('')
      setPostalCode('')
      setSpecialRequests('')
      setSelectedRoomId('')
      setGuests(1)
      
      // Refresh available rooms
      fetchAvailableRooms()
      
    } catch (err) {
      console.error('Error creating booking:', err)
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manual Booking</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create bookings for walk-in guests at {staffUser.branchName}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/staff/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Date Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Booking Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Room Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Available Rooms</h2>
              <div className="flex space-x-4">
                <select
                  value={roomTypeId}
                  onChange={(e) => setRoomTypeId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Room Types</option>
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} - ${rt.price_per_night}/night
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={fetchAvailableRooms}
                  disabled={loadingRooms}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingRooms ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {loadingRooms ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading available rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No rooms available for the selected dates
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRoomId === room.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">Room {room.roomNumber}</h3>
                      <span className="text-sm font-medium text-green-600">Available</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{room.room_type_name}</p>
                    <p className="text-sm text-gray-500 mb-2">{room.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        ${room.price_per_night}/night
                      </span>
                      <span className="text-sm text-gray-500">
                        Max {room.max_guests} guests
                      </span>
                    </div>
                    {selectedRoomId === room.id && (
                      <div className="mt-2 text-sm text-blue-600 font-medium">
                        Selected ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guest Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h2>
            
            {/* Personal Details */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-3">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., American, British, Sri Lankan"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Identification */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-3">Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Type *
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select ID Type</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="NATIONAL_ID">National ID</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter ID number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-3">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter street address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter postal code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requests or notes..."
              />
            </div>
          </div>

          {/* Booking Summary */}
          {selectedRoomId && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">
                    {rooms.find(r => r.id === selectedRoomId)?.roomNumber} - {rooms.find(r => r.id === selectedRoomId)?.room_type_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{checkOutDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">Cash (Walk-in)</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Price:</span>
                    <span className="text-blue-600">${calculateTotalPrice()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/staff/dashboard')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedRoomId || submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
