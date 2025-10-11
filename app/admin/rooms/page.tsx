'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface RoomType {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  basePrice: number | string
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
  }>
  amenities: Array<{
    id: string
    name: string
    icon: string
    category: string
  }>
  availableRooms: number
  createdAt: string
}

export default function AdminRoomsPage() {
  const router = useRouter()
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/admin/rooms', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch room types')
      }

      const data = await response.json()
      setRoomTypes(data.data)
    } catch (err) {
      console.error('Error fetching room types:', err)
      setError('Failed to load room types')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete room type')
      }

      alert('Room type deleted successfully')
      fetchRoomTypes()
    } catch (err: any) {
      alert(err.message || 'Failed to delete room type')
    }
  }

  const formatPrice = (price: number | string) => {
    return Number(price).toFixed(2)
  }

  const filteredRoomTypes = roomTypes.filter((room) => {
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus
    const matchesSearch =
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: roomTypes.length,
    active: roomTypes.filter((r) => r.status === 'active').length,
    inactive: roomTypes.filter((r) => r.status === 'inactive').length,
    featured: roomTypes.filter((r) => r.isFeatured).length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Types</h1>
          <p className="text-gray-600">Manage room categories and configurations</p>
        </div>
        <Link
          href="/admin/rooms/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Create Room Type
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🏨</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Room Types</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.featured}</p>
          <p className="text-sm text-gray-600">Featured</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
          <p className="text-sm text-gray-600">Inactive</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search room types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Room Types Grid */}
      {filteredRoomTypes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No room types found</p>
          <Link
            href="/admin/rooms/create"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Create Your First Room Type
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRoomTypes.map((room) => {
            // Safely get primary image
            const primaryImage = room.images && room.images.length > 0 
              ? room.images.find((img) => img.isPrimary) || room.images[0]
              : null

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">🏨</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {room.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        room.status === 'active'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-black/60 text-white text-sm font-semibold rounded-full">
                      LKR {formatPrice(room.basePrice)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                      <p className="text-sm text-gray-600">{room.branch?.name || 'Unknown Branch'}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {room.shortDescription || room.description}
                  </p>

                  {/* Room Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-600">Occupancy</p>
                      <p className="font-semibold text-gray-900">
                        👥 {room.maxOccupancy} guests
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Bed Type</p>
                      <p className="font-semibold text-gray-900">
                        🛏️ {room.bedType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Size</p>
                      <p className="font-semibold text-gray-900">
                        📐 {room.roomSize} m²
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Available</p>
                      <p className="font-semibold text-gray-900">
                        🚪 {room.availableRooms || 0} rooms
                      </p>
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities && room.amenities.length > 0 ? (
                        <>
                          {room.amenities.slice(0, 4).map((amenity) => (
                            <span
                              key={amenity.id}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                              title={amenity.name}
                            >
                              {amenity.icon || '✓'}
                            </span>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{room.amenities.length - 4}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">No amenities</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/rooms/${room.id}`}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center text-sm"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/rooms/${room.id}/edit`}
                      className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium text-center text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(room.id, room.name)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}