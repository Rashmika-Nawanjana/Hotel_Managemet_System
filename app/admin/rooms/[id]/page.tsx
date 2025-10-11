'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Users, Bed, Maximize, MapPin, DollarSign } from 'lucide-react'

interface RoomType {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  basePrice: number
  maxOccupancy: number
  bedType: string
  numberOfBeds: number
  roomSize: number
  viewType: string
  status: string
  isFeatured: boolean
  popularityScore: number
  branch: {
    id: string
    name: string
    location: string
  }
  images: Array<{
    id: string
    url: string
    isPrimary: boolean
    caption: string | null
  }>
  amenities: Array<{
    id: string
    name: string
    icon: string
    category: string
    description: string | null
  }>
  totalRooms: number
  roomsByStatus: Record<string, Array<{
    id: string
    roomNumber: string
    floor: number
    status: string
  }>>
}

export default function ViewRoomTypePage() {
  const params = useParams()
  const router = useRouter()
  const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchRoomType()
    }
  }, [params.id])

  const fetchRoomType = async () => {
    try {
      const response = await fetch(`/api/admin/rooms/${params.id}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch room type')
      }

      const data = await response.json()
      setRoomType(data.data)
    } catch (err) {
      console.error('Error fetching room type:', err)
      setError('Failed to load room type')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/rooms/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete room type')
      }

      alert('Room type deleted successfully')
      router.push('/admin/rooms')
    } catch (err: any) {
      alert(err.message || 'Failed to delete room type')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (error || !roomType) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700 text-lg mb-4">{error || 'Room type not found'}</p>
          <Link
            href="/admin/rooms"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to Room Types
          </Link>
        </div>
      </div>
    )
  }

  const primaryImage = roomType.images?.find((img) => img.isPrimary) || roomType.images?.[0]
  const availableRooms = roomType.roomsByStatus?.['AVAILABLE']?.length || 0
  const occupiedRooms = roomType.roomsByStatus?.['OCCUPIED']?.length || 0
  const maintenanceRooms = roomType.roomsByStatus?.['MAINTENANCE']?.length || 0
  const cleaningRooms = roomType.roomsByStatus?.['CLEANING']?.length || 0
  const outOfServiceRooms = roomType.roomsByStatus?.['OUT_OF_SERVICE']?.length || 0
  
  const occupancyRate = roomType.totalRooms > 0 
    ? Math.round((occupiedRooms / roomType.totalRooms) * 100) 
    : 0

  // Group amenities by category
  const amenitiesByCategory = roomType.amenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = []
    }
    acc[amenity.category].push(amenity)
    return acc
  }, {} as Record<string, typeof roomType.amenities>)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/rooms"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{roomType.name}</h1>
            <p className="text-gray-600 mt-1">{roomType.branch.name}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/admin/rooms/${roomType.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          {primaryImage && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={primaryImage.url}
                alt={roomType.name}
                className="w-full h-96 object-cover"
              />
              {primaryImage.caption && (
                <div className="p-4 bg-gray-50">
                  <p className="text-sm text-gray-600">{primaryImage.caption}</p>
                </div>
              )}
            </div>
          )}

          {/* Image Gallery */}
          {roomType.images && roomType.images.length > 1 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Gallery</h2>
              <div className="grid grid-cols-3 gap-4">
                {roomType.images.map((image) => (
                  <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={roomType.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            {roomType.shortDescription && (
              <p className="text-lg text-gray-700 mb-4 font-medium">
                {roomType.shortDescription}
              </p>
            )}
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {roomType.description}
            </p>
          </div>

          {/* Room Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Room Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Max Occupancy</p>
                  <p className="font-semibold text-gray-900">{roomType.maxOccupancy} guests</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bed Configuration</p>
                  <p className="font-semibold text-gray-900">
                    {roomType.numberOfBeds} {roomType.bedType}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Maximize className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Room Size</p>
                  <p className="font-semibold text-gray-900">{roomType.roomSize} m²</p>
                </div>
              </div>

              {roomType.viewType && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">View</p>
                    <p className="font-semibold text-gray-900">{roomType.viewType}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Base Price</p>
                  <p className="font-semibold text-gray-900">LKR {roomType.basePrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Branch</p>
                  <p className="font-semibold text-gray-900">{roomType.branch.name}</p>
                  <p className="text-sm text-gray-600">{roomType.branch.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {Object.keys(amenitiesByCategory).length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="space-y-6">
                {Object.entries(amenitiesByCategory).map(([category, amenities]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                      {category.replace('_', ' ')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {amenities.map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-2xl">{amenity.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{amenity.name}</p>
                            {amenity.description && (
                              <p className="text-xs text-gray-600">{amenity.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Room Type Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    roomType.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {roomType.status}
                </span>
              </div>
              {roomType.isFeatured && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Featured</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    ⭐ Yes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Room Statistics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Room Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Occupancy Rate</span>
                  <span className="font-semibold text-gray-900">{occupancyRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Total Rooms</span>
                  <span className="font-semibold text-gray-900">{roomType.totalRooms}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">{availableRooms}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Occupied</span>
                  <span className="font-semibold text-blue-600">{occupiedRooms}</span>
                </div>
                {cleaningRooms > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Cleaning</span>
                    <span className="font-semibold text-yellow-600">{cleaningRooms}</span>
                  </div>
                )}
                {maintenanceRooms > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-semibold text-orange-600">{maintenanceRooms}</span>
                  </div>
                )}
                {outOfServiceRooms > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Out of Service</span>
                    <span className="font-semibold text-red-600">{outOfServiceRooms}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/rooms/instances?roomTypeId=${roomType.id}`}
                className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center"
              >
                View Room Instances
              </Link>
              <Link
                href={`/admin/rooms/instances/create?roomTypeId=${roomType.id}`}
                className="block w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-center"
              >
                Create New Room Instance
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Room Type?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{roomType.name}"? This action cannot be undone.
              {roomType.totalRooms > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: This room type has {roomType.totalRooms} room instances that must be deleted first.
                </span>
              )}
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
                disabled={roomType.totalRooms > 0}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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