'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Room {
  id: string
  roomNumber: string
  floor: number
  status: string
  notes: string | null
  lastCleaned: string | null
  lastMaintenance: string | null
  createdAt: string
  updatedAt: string
  roomType: {
    id: string
    name: string
    description: string
    basePrice: number
    maxOccupancy: number
    bedType: string
    numberOfBeds: number
    roomSize: number
    viewType: string
    amenities: Array<{
      amenity: {
        id: string
        name: string
        icon: string
        category: string
      }
    }>
    images: Array<{
      id: string
      url: string
      isPrimary: boolean
    }>
  }
  branch: {
    id: string
    name: string
    location: string
    address: string
  }
}

export default function ViewRoomInstancePage() {
  const router = useRouter()
  const params = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchRoom()
    }
  }, [params.id])

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/admin/rooms/instances/${params.id}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch room')
      }

      const data = await response.json()
      setRoom(data.data)
      setNewStatus(data.data.status)
      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching room:', err)
      setError('Failed to load room')
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    try {
      const updateData: any = { status: newStatus }
      
      if (newStatus === 'AVAILABLE') {
        updateData.lastCleaned = new Date().toISOString()
      }
      
      if (newStatus === 'MAINTENANCE') {
        updateData.lastMaintenance = new Date().toISOString()
      }

      const response = await fetch(`/api/admin/rooms/instances/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update room status')
      }

      alert('Room status updated successfully!')
      setShowStatusModal(false)
      fetchRoom()
    } catch (err) {
      alert('Failed to update room status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/rooms/instances/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete room')
      }

      alert('Room deleted successfully')
      router.push('/admin/rooms/instances')
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert('Failed to delete room')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'CLEANING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '✓'
      case 'OCCUPIED':
        return '🔒'
      case 'CLEANING':
        return '🧹'
      case 'MAINTENANCE':
        return '🔧'
      case 'OUT_OF_SERVICE':
        return '❌'
      default:
        return '❓'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700 text-lg mb-4">{error || 'Room not found'}</p>
          <Link
            href="/admin/rooms/instances"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to Room Instances
          </Link>
        </div>
      </div>
    )
  }

  const primaryImage = room.roomType.images?.find((img) => img.isPrimary) || room.roomType.images?.[0]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/rooms/instances"
            className="text-blue-600 hover:text-blue-500 flex items-center mb-2"
          >
            ← Back to Room Instances
          </Link>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">Room {room.roomNumber}</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                room.status
              )}`}
            >
              {getStatusIcon(room.status)} {room.status}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {room.roomType.name} • Floor {room.floor} • {room.branch.name}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Update Status
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Delete Room
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Room Type Image */}
          {primaryImage && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={primaryImage.url}
                alt={room.roomType.name}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Room Type Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Room Type Details</h2>
            <p className="text-gray-700 mb-6">{room.roomType.description}</p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Bed Type</p>
                <p className="font-semibold text-gray-900">🛏️ {room.roomType.bedType}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Max Occupancy</p>
                <p className="font-semibold text-gray-900">👥 {room.roomType.maxOccupancy} guests</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Room Size</p>
                <p className="font-semibold text-gray-900">📐 {room.roomType.roomSize} m²</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Number of Beds</p>
                <p className="font-semibold text-gray-900">{room.roomType.numberOfBeds}</p>
              </div>
              {room.roomType.viewType && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">View</p>
                  <p className="font-semibold text-gray-900">🌅 {room.roomType.viewType}</p>
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Base Price</p>
                <p className="font-semibold text-gray-900">LKR {room.roomType.basePrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {room.roomType.amenities && room.roomType.amenities.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {room.roomType.amenities.map((ra) => (
                  <div
                    key={ra.amenity.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-2xl">{ra.amenity.icon}</span>
                    <span className="font-medium text-gray-900">{ra.amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {room.notes && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-line">{room.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setNewStatus('AVAILABLE')
                  setShowStatusModal(true)
                }}
                className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-left"
              >
                ✓ Mark as Available
              </button>
              <button
                onClick={() => {
                  setNewStatus('CLEANING')
                  setShowStatusModal(true)
                }}
                className="w-full py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium text-left"
              >
                🧹 Mark for Cleaning
              </button>
              <button
                onClick={() => {
                  setNewStatus('MAINTENANCE')
                  setShowStatusModal(true)
                }}
                className="w-full py-2 px-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition font-medium text-left"
              >
                🔧 Mark for Maintenance
              </button>
              <button
                onClick={() => {
                  setNewStatus('OUT_OF_SERVICE')
                  setShowStatusModal(true)
                }}
                className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-left"
              >
                ❌ Out of Service
              </button>
            </div>
          </div>

          {/* Room Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Room Information</h2>
            <div className="space-y-4">
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600 mb-1">Room Number</p>
                <p className="font-bold text-gray-900 text-lg">{room.roomNumber}</p>
              </div>
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600 mb-1">Floor</p>
                <p className="font-semibold text-gray-900">Floor {room.floor}</p>
              </div>
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                    room.status
                  )}`}
                >
                  {getStatusIcon(room.status)} {room.status}
                </span>
              </div>
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600 mb-1">Last Cleaned</p>
                <p className="text-gray-900">
                  {room.lastCleaned
                    ? new Date(room.lastCleaned).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600 mb-1">Last Maintenance</p>
                <p className="text-gray-900">
                  {room.lastMaintenance
                    ? new Date(room.lastMaintenance).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Branch Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Branch</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-semibold text-gray-900">{room.branch.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="text-gray-700">{room.branch.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="text-gray-700 text-sm">{room.branch.address}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Created</p>
                <p className="text-gray-900">
                  {new Date(room.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Last Updated</p>
                <p className="text-gray-900">
                  {new Date(room.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Room ID</p>
                <p className="text-gray-900 font-mono text-xs break-all">{room.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Room Status</h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="AVAILABLE">✓ Available</option>
                <option value="OCCUPIED">🔒 Occupied</option>
                <option value="CLEANING">🧹 Cleaning</option>
                <option value="MAINTENANCE">🔧 Maintenance</option>
                <option value="OUT_OF_SERVICE">❌ Out of Service</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Room?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete Room {room.roomNumber}? This action cannot be
              undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}