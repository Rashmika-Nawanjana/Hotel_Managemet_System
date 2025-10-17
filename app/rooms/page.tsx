'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Users, Maximize, Bed, MapPin, Star } from 'lucide-react'

interface RoomType {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  basePrice: number | string // Allow both types
  maxOccupancy: number
  bedType: string
  numberOfBeds: number
  roomSize: number
  viewType: string
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
}

interface Branch {
  id: string
  name: string
  location: string
}

export default function BrowseRoomsPage() {
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [filteredRooms, setFilteredRooms] = useState<RoomType[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedBedType, setSelectedBedType] = useState('all')
  const [minOccupancy, setMinOccupancy] = useState('')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchRooms()
    fetchBranches()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [rooms, searchQuery, selectedBranch, minPrice, maxPrice, selectedBedType, minOccupancy, showFeaturedOnly, sortBy])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms?status=active')
      if (!response.ok) throw new Error('Failed to fetch rooms')
      
      const data = await response.json()
      setRooms(data.data || [])
      setFilteredRooms(data.data || [])
    } catch (err) {
      console.error('Error fetching rooms:', err)
      setError('Failed to load rooms')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches')
      if (response.ok) {
        const data = await response.json()
        setBranches(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching branches:', err)
    }
  }

  // Helper function to convert price to number
  const getPrice = (price: number | string): number => {
    return typeof price === 'string' ? parseFloat(price) : price
  }

  // Helper function to format price
  const formatPrice = (price: number | string): string => {
    return getPrice(price).toFixed(2)
  }

  const applyFilters = () => {
    let filtered = [...rooms]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.branch.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Branch filter
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(room => room.branch.id === selectedBranch)
    }

    // Price filter
    if (minPrice) {
      filtered = filtered.filter(room => getPrice(room.basePrice) >= parseFloat(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter(room => getPrice(room.basePrice) <= parseFloat(maxPrice))
    }

    // Bed type filter
    if (selectedBedType !== 'all') {
      filtered = filtered.filter(room => room.bedType === selectedBedType)
    }

    // Occupancy filter
    if (minOccupancy) {
      filtered = filtered.filter(room => room.maxOccupancy >= parseInt(minOccupancy))
    }

    // Featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(room => room.isFeatured)
    }

    // Sort
    switch (sortBy) {
      case 'featured':
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return b.popularityScore - a.popularityScore
        })
        break
      case 'price-low':
        filtered.sort((a, b) => getPrice(a.basePrice) - getPrice(b.basePrice))
        break
      case 'price-high':
        filtered.sort((a, b) => getPrice(b.basePrice) - getPrice(a.basePrice))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'size':
        filtered.sort((a, b) => b.roomSize - a.roomSize)
        break
    }

    setFilteredRooms(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBranch('all')
    setMinPrice('')
    setMaxPrice('')
    setSelectedBedType('all')
    setMinOccupancy('')
    setShowFeaturedOnly(false)
    setSortBy('featured')
  }

  const getPrimaryImage = (room: RoomType) => {
    if (!room.images || room.images.length === 0) {
      return '/placeholder-room.jpg'
    }
    const primary = room.images.find(img => img.isPrimary)
    return primary?.url || room.images[0]?.url || '/placeholder-room.jpg'
  }

  const bedTypes = ['Single', 'Twin', 'Double', 'Queen', 'King', 'California King']

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Our Rooms</h1>
              <p className="text-gray-600 mt-1">
                Discover luxury accommodations across Sri Lanka
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Branch Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range (LKR)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Bed Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Bed className="w-4 h-4 inline mr-1" />
                  Bed Type
                </label>
                <select
                  value={selectedBedType}
                  onChange={(e) => setSelectedBedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {bedTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Occupancy */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Min Guests
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Number of guests"
                  value={minOccupancy}
                  onChange={(e) => setMinOccupancy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFeaturedOnly}
                    onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <Star className="w-4 h-4 inline text-yellow-500" /> Featured only
                  </span>
                </label>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredRooms.length}</span> rooms
            found
          </p>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
              <option value="size">Room Size</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRooms.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.slug}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getPrimaryImage(room)}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {room.isFeatured && (
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" fill="white" />
                      Featured
                    </span>
                  )}
                  {room.availableRooms <= 3 && room.availableRooms > 0 && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      Only {room.availableRooms} left
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-3 py-1 bg-black/60 text-white text-sm font-semibold rounded-full">
                    LKR {formatPrice(room.basePrice)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {room.branch.name}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {room.shortDescription || room.description}
                </p>

                {/* Room Details */}
                <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b">
                  <div className="text-center">
                    <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">
                      {room.maxOccupancy} guests
                    </p>
                  </div>
                  <div className="text-center">
                    <Bed className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">{room.bedType}</p>
                  </div>
                  <div className="text-center">
                    <Maximize className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">{room.roomSize} m²</p>
                  </div>
                </div>

                {/* Amenities Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {room.amenities && room.amenities.length > 0 ? (
                      <>
                        {room.amenities.slice(0, 4).map((amenity) => (
                          <span
                            key={amenity.id}
                            className="text-lg"
                            title={amenity.name}
                          >
                            {amenity.icon || '🏨'}
                          </span>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{room.amenities.length - 4}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">No amenities</span>
                    )}
                  </div>
                  <span className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}