'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SearchRoomsPage() {
  const [filters, setFilters] = useState({
    branch: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: '',
    priceRange: 'all'
  })

  const branches = [
    { id: 'colombo', name: 'Sky Nest Colombo', location: 'Colombo City Center' },
    { id: 'kandy', name: 'Sky Nest Kandy', location: 'Kandy Hills' },
    { id: 'galle', name: 'Sky Nest Galle', location: 'Galle Fort' }
  ]

  const roomTypes = [
    { id: 'deluxe', name: 'Deluxe Room' },
    { id: 'suite', name: 'Suite' },
    { id: 'presidential', name: 'Presidential Suite' }
  ]

  // Mock available rooms data
  const availableRooms = [
    {
      id: 1,
      name: 'Deluxe Room',
      branch: 'Sky Nest Colombo',
      price: 120,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
      size: '35 sqm',
      beds: 'King Size Bed',
      capacity: 2,
      amenities: ['Free WiFi', 'City View', 'Mini Bar', 'Air Conditioning'],
      available: 5
    },
    {
      id: 2,
      name: 'Suite',
      branch: 'Sky Nest Colombo',
      price: 200,
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400',
      size: '55 sqm',
      beds: 'King Size Bed',
      capacity: 3,
      amenities: ['Free WiFi', 'Ocean View', 'Living Area', 'Balcony', 'Mini Bar'],
      available: 3
    },
    {
      id: 3,
      name: 'Presidential Suite',
      branch: 'Sky Nest Kandy',
      price: 350,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      size: '85 sqm',
      beds: 'King Size Bed + Sofa Bed',
      capacity: 4,
      amenities: ['Free WiFi', 'Mountain View', 'Private Terrace', 'Jacuzzi', 'Butler Service'],
      available: 2
    },
    {
      id: 4,
      name: 'Deluxe Room',
      branch: 'Sky Nest Galle',
      price: 130,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
      size: '35 sqm',
      beds: 'Queen Size Bed',
      capacity: 2,
      amenities: ['Free WiFi', 'Beach View', 'Mini Bar', 'Air Conditioning'],
      available: 8
    },
    {
      id: 5,
      name: 'Suite',
      branch: 'Sky Nest Kandy',
      price: 210,
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400',
      size: '55 sqm',
      beds: 'King Size Bed',
      capacity: 3,
      amenities: ['Free WiFi', 'Garden View', 'Living Area', 'Balcony', 'Tea Garden Access'],
      available: 4
    },
    {
      id: 6,
      name: 'Presidential Suite',
      branch: 'Sky Nest Galle',
      price: 380,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      size: '90 sqm',
      beds: 'King Size Bed + Sofa Bed',
      capacity: 4,
      amenities: ['Free WiFi', 'Ocean View', 'Private Pool', 'Butler Service', 'Dining Area'],
      available: 1
    }
  ]

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [field]: value }))
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
            <p className="text-gray-600">{availableRooms.length} rooms found</p>
          </div>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>Sort by: Recommended</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating: High to Low</option>
          </select>
        </div>

        {/* Room Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {availableRooms.map(room => (
            <div key={room.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/5 relative">
                  <img 
                    src={room.image} 
                    alt={room.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-800">{room.size}</span>
                  </div>
                  {room.available <= 3 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold">Only {room.available} left!</span>
                    </div>
                  )}
                </div>
                
                <div className="md:w-3/5 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-1">📍</span>
                        {room.branch}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-b">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="mr-1">🛏️</span>
                        {room.beds}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">👥</span>
                        Up to {room.capacity} guests
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 4).map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${room.price}</span>
                      <span className="text-gray-600 text-sm ml-1">/ night</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/guest/room-details/${room.id}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                      >
                        View Details
                      </Link>
                      <Link 
                        href={`/guest/booking?roomId=${room.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {availableRooms.length === 0 && (
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