'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  Filter, 
  Home, 
  Wrench, 
  CheckCircle, 
  Clock, 
  User,
  Calendar,
  Bed,
  Users,
  AlertCircle
} from 'lucide-react'

interface Room {
  id: string
  roomNumber: string
  floor: number
  status: 'AVAILABLE' | 'CLEANING' | 'OCCUPIED' | 'OUT_OF_SERVICE'
  lastCleaned: string | null
  lastMaintenance: string | null
  notes: string | null
  roomType: {
    id: string
    name: string
    basePrice: number
    maxOccupancy: number
    bedType: string
  }
  branch: {
    id: string
    name: string
    location: string
  }
  currentBooking: {
    id: string
    bookingReference: string
    checkInDate: string
    checkOutDate: string
    status: string
    guestName: string
  } | null
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

export default function RoomManagementPage() {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  
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

  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/staff/rooms')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch rooms')
      }

      const data = await response.json()
      setRooms(data.rooms)
    } catch (err) {
      console.error('Error fetching rooms:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (staffUser) {
      fetchRooms()
    }
  }, [staffUser])

  const updateRoomStatus = async (roomId: string, newStatus: string, notes?: string) => {
    try {
      setIsUpdating(roomId)
      setError('')
      setSuccessMessage('')

      const response = await fetch(`/api/staff/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update room status')
      }

      const result = await response.json()
      setSuccessMessage(result.message)
      
      // Update the room in the list
      setRooms(prev => prev.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              status: newStatus as any,
              notes: notes !== undefined ? notes : room.notes,
              lastCleaned: newStatus === 'AVAILABLE' ? new Date().toISOString() : room.lastCleaned
            }
          : room
      ))
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (err) {
      console.error('Room status update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update room status')
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'CLEANING':
        return 'bg-yellow-100 text-yellow-800'
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800'
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4" />
      case 'CLEANING':
        return <Wrench className="h-4 w-4" />
      case 'OCCUPIED':
        return <User className="h-4 w-4" />
      case 'OUT_OF_SERVICE':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.currentBooking?.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: rooms.length,
    AVAILABLE: rooms.filter(r => r.status === 'AVAILABLE').length,
    CLEANING: rooms.filter(r => r.status === 'CLEANING').length,
    OCCUPIED: rooms.filter(r => r.status === 'OCCUPIED').length,
    OUT_OF_SERVICE: rooms.filter(r => r.status === 'OUT_OF_SERVICE').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/staff/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
            </div>
            <button
              onClick={fetchRooms}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
              title="Refresh room status"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rooms, room types, or guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Rooms ({statusCounts.all})</option>
                <option value="AVAILABLE">Available ({statusCounts.AVAILABLE})</option>
                <option value="CLEANING">Cleaning ({statusCounts.CLEANING})</option>
                <option value="OCCUPIED">Occupied ({statusCounts.OCCUPIED})</option>
                <option value="OUT_OF_SERVICE">Out of Service ({statusCounts.OUT_OF_SERVICE})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Room Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Room {room.roomNumber}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(room.status)}`}>
                    {getStatusIcon(room.status)}
                    <span>{room.status}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Floor {room.floor} • {room.roomType.name}
                </p>
              </div>

              {/* Room Details */}
              <div className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{room.roomType.bedType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Max {room.roomType.maxOccupancy} guests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">$</span>
                    <span className="text-gray-600">${room.roomType.basePrice}/night</span>
                  </div>
                </div>

                {/* Current Booking */}
                {room.currentBooking && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Current Guest</p>
                    <p className="text-sm text-blue-800">{room.currentBooking.guestName}</p>
                    <p className="text-xs text-blue-600">
                      {room.currentBooking.bookingReference}
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-blue-600">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(room.currentBooking.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Last Cleaned */}
                {room.lastCleaned && (
                  <div className="mt-3 text-xs text-gray-500">
                    Last cleaned: {new Date(room.lastCleaned).toLocaleDateString()}
                  </div>
                )}

                {/* Status Update Actions */}
                <div className="mt-4 space-y-2">
                  {room.status === 'AVAILABLE' && (
                    <button
                      onClick={() => updateRoomStatus(room.id, 'CLEANING')}
                      disabled={isUpdating === room.id}
                      className="w-full px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Wrench className="h-4 w-4" />
                      <span>{isUpdating === room.id ? 'Updating...' : 'Mark as Cleaning'}</span>
                    </button>
                  )}
                  
                  {room.status === 'CLEANING' && (
                    <button
                      onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                      disabled={isUpdating === room.id}
                      className="w-full px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{isUpdating === room.id ? 'Updating...' : 'Mark as Available'}</span>
                    </button>
                  )}

                  {room.status === 'OCCUPIED' && (
                    <div className="text-center text-sm text-blue-600 bg-blue-50 py-2 rounded-lg">
                      <User className="h-4 w-4 mx-auto mb-1" />
                      <span>Occupied - Managed by Check-in/out</span>
                    </div>
                  )}

                  {room.status === 'OUT_OF_SERVICE' && (
                    <button
                      onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                      disabled={isUpdating === room.id}
                      className="w-full px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{isUpdating === room.id ? 'Updating...' : 'Mark as Available'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'No rooms match the selected filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
