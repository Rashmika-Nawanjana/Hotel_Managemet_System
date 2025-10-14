'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/app/components/AdminSidebar'

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
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  // Admin data
  const admin = {
    name: 'Rashmika Nawanjana',
    role: 'System Administrator',
  }

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toISOString().slice(0, 19).replace('T', ' ')
      setCurrentTime(formatted)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        localStorage.removeItem("user")
        localStorage.removeItem("auth-token")
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Logout error:", error)
      localStorage.clear()
      window.location.href = "/"
    }
  }

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
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setSidebarCollapsed}
        />
        <main className={`flex-1 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed}
      />
      
      <main className={`flex-1 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header - Exact same as dashboard */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SN</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">
                    Sky Nest Admin Portal
                  </span>
                  <p className="text-xs text-gray-300 -mt-1">
                    Room Management
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-300">System Time (UTC)</p>
                  <p className="font-semibold text-white">{currentTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{admin.name}</p>
                  <p className="font-semibold text-white">{admin.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header with Welcome Banner Style */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 mb-8 text-white shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Room Types Management</h1>
                  <p className="text-red-100">Manage room categories and configurations across all branches</p>
                </div>
                <Link
                  href="/admin/rooms/create"
                  className="px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 transition font-medium shadow-sm"
                >
                  + Create Room Type
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {/* Stats - Same style as dashboard */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏨</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Room Types</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.featured}</p>
                <p className="text-sm text-gray-600">Featured</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.inactive}</p>
                <p className="text-sm text-gray-600">Inactive</p>
              </div>
            </div>

            {/* Filters - Same style as dashboard Branch Overview */}
            <div className="bg-white rounded-xl shadow-md mb-8">
              <div className="p-6 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Filter & Search</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      filterStatus === 'all'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      filterStatus === 'active'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilterStatus('inactive')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      filterStatus === 'inactive'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
              <div className="p-6">
                <input
                  type="text"
                  placeholder="Search by room name or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </div>
            </div>

            {/* Room Types Grid */}
            {filteredRoomTypes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏨</span>
                </div>
                <p className="text-gray-500 text-lg mb-4">No room types found</p>
                <Link
                  href="/admin/rooms/create"
                  className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
                >
                  Create Your First Room Type
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoomTypes.map((room) => {
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
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-5xl">🏨</span>
                          </div>
                        )}

                        {/* Badges - Matching dashboard style */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          {room.isFeatured && (
                            <span className="px-2.5 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full shadow-sm">
                              ⭐ Featured
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                              room.status === 'active'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-500 text-white'
                            }`}
                          >
                            {room.status === "operational" ? "● Operational" : room.status}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1.5 bg-black/70 text-white text-sm font-bold rounded-full shadow-lg backdrop-blur-sm">
                            LKR {formatPrice(room.basePrice)}
                          </span>
                        </div>
                      </div>

                      {/* Content - Matching dashboard branch cards */}
                      <div className="p-5">
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                          <p className="text-sm text-gray-600">
                            📍 {room.branch?.name || 'Unknown Branch'}
                          </p>
                        </div>

                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                          {room.shortDescription || room.description}
                        </p>

                        {/* Room Details - Same grid style as dashboard */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Occupancy</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {room.maxOccupancy}
                            </p>
                            <p className="text-xs text-gray-500">👥 guests</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Available</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {room.availableRooms || 0}
                            </p>
                            <p className="text-xs text-gray-500">🚪 rooms</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Bed Type</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {room.bedType}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Room Size</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {room.roomSize} m²
                            </p>
                          </div>
                        </div>

                        {/* Amenities Preview */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-600 mb-2 font-semibold">Amenities</p>
                            <div className="flex flex-wrap gap-1.5">
                              {room.amenities.slice(0, 4).map((amenity) => (
                                <span
                                  key={amenity.id}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-200"
                                  title={amenity.name}
                                >
                                  {amenity.icon || '✓'}
                                </span>
                              ))}
                              {room.amenities.length > 4 && (
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                                  +{room.amenities.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions - Matching dashboard button styles */}
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/rooms/${room.id}`}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-center text-sm shadow-sm"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/admin/rooms/${room.id}/edit`}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-center text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(room.id, room.name)}
                            className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm shadow-sm"
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
        </div>
      </main>
    </div>
  )
}