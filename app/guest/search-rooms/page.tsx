'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

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
  branch: {
    id: string
    name: string
    location: string
    address: string
  }
  images: Array<{
    id: string
    url: string
    caption: string
    order: number
  }>
  amenities: Array<{
    id: string
    name: string
    icon: string
    category: string
  }>
}

interface Branch {
  id: string
  name: string
  location: string
  address: string
}

function SearchRoomsContent() {
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    branch: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: '',
    priceRange: 'all'
  })

  const [branches, setBranches] = useState<Branch[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    // Process URL parameters first
    const branchParam = searchParams.get('branch')
    const checkInParam = searchParams.get('checkIn')
    const checkOutParam = searchParams.get('checkOut')
    const guestsParam = searchParams.get('guests')
    const roomTypeParam = searchParams.get('roomType')
    const priceRangeParam = searchParams.get('priceRange')

    console.log('URL parameters on mount:', { branchParam, checkInParam, checkOutParam, guestsParam, roomTypeParam, priceRangeParam })

    if (branchParam || checkInParam || checkOutParam || guestsParam || roomTypeParam || priceRangeParam) {
      setFilters(prev => ({
        ...prev,
        branch: branchParam || prev.branch,
        checkIn: checkInParam || prev.checkIn,
        checkOut: checkOutParam || prev.checkOut,
        guests: guestsParam ? parseInt(guestsParam) : prev.guests,
        roomType: roomTypeParam || prev.roomType,
        priceRange: priceRangeParam || prev.priceRange
      }))
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    console.log('Filters changed:', filters)
    console.log('Branches loaded:', branches.length)
    console.log('Room types loaded:', roomTypes.length)
    
    if (branches.length > 0 || roomTypes.length > 0) {
      fetchAvailableRooms()
    }
  }, [filters, branches, roomTypes])

  // Refresh data when page becomes visible (user returns from booking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && (branches.length > 0 || roomTypes.length > 0)) {
        fetchAvailableRooms()
      }
    }

    const handleFocus = () => {
      if (branches.length > 0 || roomTypes.length > 0) {
        fetchAvailableRooms()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [branches.length, roomTypes.length])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch branches
      const branchesRes = await fetch('/api/branches')
      const branchesData = await branchesRes.json()
      if (branchesRes.ok) {
        setBranches(branchesData.data || [])
      }

      // Fetch room types
      const roomsRes = await fetch('/api/rooms')
      const roomsData = await roomsRes.json()
      if (roomsRes.ok) {
        setRoomTypes(roomsData.roomTypes || [])
      }
    } catch (err) {
      setError('Failed to load room data')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableRooms = async () => {
    try {
      const params = new URLSearchParams()
      
      if (filters.branch) params.append('branchId', filters.branch)
      if (filters.checkIn) params.append('checkIn', filters.checkIn)
      if (filters.checkOut) params.append('checkOut', filters.checkOut)
      if (filters.guests) params.append('guests', filters.guests.toString())
      if (filters.roomType) params.append('roomType', filters.roomType)
      if (filters.priceRange !== 'all') params.append('priceRange', filters.priceRange)

      console.log('Fetching rooms with filters:', filters)
      console.log('API URL:', `/api/rooms/search?${params.toString()}`)

      const res = await fetch(`/api/rooms/search?${params.toString()}`)
      const data = await res.json()
      
      console.log('API response:', data)
      
      if (res.ok) {
        setAvailableRooms(data.roomTypes || [])
      } else {
        setAvailableRooms([])
      }
    } catch (err) {
      console.error('Error fetching rooms:', err)
      setAvailableRooms([])
    }
  }

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const getPriceRangeFilter = (room: RoomType) => {
    const price = room.basePrice
    switch (filters.priceRange) {
      case 'budget':
        return price < 150
      case 'mid':
        return price >= 150 && price <= 250
      case 'luxury':
        return price > 250
      default:
        return true
    }
  }

  const filteredRooms = availableRooms.filter(room => {
    const matchesBranch = !filters.branch || room.branch?.id === filters.branch
    const matchesRoomType = !filters.roomType || room.id === filters.roomType
    const matchesGuests = room.maxOccupancy >= filters.guests
    const matchesPriceRange = getPriceRangeFilter(room)
    
    return matchesBranch && matchesRoomType && matchesGuests && matchesPriceRange
  })

  const sortRooms = (rooms: RoomType[], sortBy: string) => {
    switch (sortBy) {
      case 'price-low':
        return [...rooms].sort((a, b) => a.basePrice - b.basePrice)
      case 'price-high':
        return [...rooms].sort((a, b) => b.basePrice - a.basePrice)
      case 'name':
        return [...rooms].sort((a, b) => a.name.localeCompare(b.name))
      default:
        return rooms
    }
  }

  const [sortBy, setSortBy] = useState('recommended')
  const sortedRooms = sortRooms(filteredRooms, sortBy)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rooms...</p>
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
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Sky Nest</span>
                <p className="text-xs text-gray-500 -mt-1">Find Your Perfect Room</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchAvailableRooms()}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
                title="Refresh room availability"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <Link href="/guest/my-bookings" className="text-gray-600 hover:text-blue-600 transition">My Bookings</Link>
              <Link href="/guest/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Branch</label>
              <select
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Locations</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Check-in</label>
              <input
                type="date"
                value={filters.checkIn}
                onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                min="2025-10-02"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Check-out</label>
              <input
                type="date"
                value={filters.checkOut}
                onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                min={filters.checkIn || "2025-10-02"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Guests</label>
              <select
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Room Type</label>
              <select
                value={filters.roomType}
                onChange={(e) => handleFilterChange('roomType', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {roomTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-700">Price Range:</span>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All Prices' },
                { value: 'budget', label: 'Under $150' },
                { value: 'mid', label: '$150 - $250' },
                { value: 'luxury', label: '$250+' }
              ].map(range => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange('priceRange', range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filters.priceRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Available Rooms</h1>
            <p className="text-gray-600">{sortedRooms.length} rooms found</p>
          </div>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="recommended">Sort by: Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {/* Room Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {sortedRooms.map(room => (
            <div key={room.id} className={`bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden ${
              room.availableRooms === 0 ? 'opacity-75' : ''
            }`}>
              <div className="md:flex">
                <div className="md:w-2/5 relative">
                  <img 
                    src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'} 
                    alt={room.name}
                    className={`w-full h-64 md:h-full object-cover ${
                      room.availableRooms === 0 ? 'grayscale' : ''
                    }`}
                  />
                  {room.availableRooms === 0 && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Fully Booked
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-800">{room.roomSize} sqm</span>
                  </div>
                  {room.availableRooms !== undefined && (
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      room.availableRooms === 0
                        ? 'bg-red-600 text-white'
                        : room.availableRooms > 5 
                        ? 'bg-green-500 text-white' 
                        : room.availableRooms > 2 
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {room.availableRooms === 0
                        ? 'Fully Booked'
                        : room.availableRooms > 5 
                        ? `${room.availableRooms} rooms available`
                        : room.availableRooms > 2 
                        ? `Only ${room.availableRooms} left`
                        : `Only ${room.availableRooms} left!`
                      }
                    </div>
                  )}
                </div>
                
                <div className="md:w-3/5 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-1">📍</span>
                        {room.branch?.name}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-b">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="mr-1">🛏️</span>
                        {room.bedType}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">👥</span>
                        Up to {room.maxOccupancy} guests
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities?.slice(0, 4).map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {amenity.name}
                        </span>
                      ))}
                      {room.amenities && room.amenities.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${room.basePrice}</span>
                      <span className="text-gray-600 text-sm ml-1">/ night</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/guest/room-details/${room.id}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                      >
                        View Details
                      </Link>
                      {room.availableRooms > 0 ? (
                        <Link 
                          href={`/guest/booking?roomId=${room.id}&checkIn=${filters.checkIn}&checkOut=${filters.checkOut}&guests=${filters.guests}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Book Now
                        </Link>
                      ) : (
                        <button 
                          disabled
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium"
                          title="This room type is fully booked for the selected dates"
                        >
                          Fully Booked
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {sortedRooms.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more options</p>
            <button 
              onClick={() => setFilters({ branch: '', checkIn: '', checkOut: '', guests: 1, roomType: '', priceRange: 'all' })}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchRoomsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search page...</p>
        </div>
      </div>
    }>
      <SearchRoomsContent />
    </Suspense>
  )
}