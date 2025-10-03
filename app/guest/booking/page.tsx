'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function RoomDetailsPage() {
  const params = useParams()
  const roomId = params.id

  const [selectedImage, setSelectedImage] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  // Mock room data - in real app, fetch from API based on roomId
  const room = {
    id: roomId,
    name: 'Deluxe Ocean View Suite',
    branch: 'Sky Nest Galle',
    branchLocation: 'Galle Fort, Southern Province',
    price: 200,
    originalPrice: 250,
    rating: 4.8,
    reviews: 127,
    size: '55 sqm',
    beds: 'King Size Bed',
    capacity: 3,
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
    ],
    description: 'Experience luxury and comfort in our Deluxe Ocean View Suite. This spacious room features stunning views of the Indian Ocean, modern amenities, and elegant furnishings. Perfect for couples or small families seeking a memorable stay in historic Galle.',
    amenities: [
      { icon: '📶', name: 'Free High-Speed WiFi' },
      { icon: '❄️', name: 'Air Conditioning' },
      { icon: '📺', name: '55" Smart TV' },
      { icon: '☕', name: 'Coffee/Tea Maker' },
      { icon: '🛁', name: 'Luxury Bathroom' },
      { icon: '🌊', name: 'Ocean View' },
      { icon: '🪟', name: 'Private Balcony' },
      { icon: '🔒', name: 'Electronic Safe' },
      { icon: '👔', name: 'Iron & Board' },
      { icon: '💆', name: 'Complimentary Toiletries' },
      { icon: '🧊', name: 'Mini Bar' },
      { icon: '📞', name: '24/7 Room Service' }
    ],
    features: [
      'Daily housekeeping',
      'Complimentary breakfast',
      'Access to fitness center',
      'Spa access',
      'Free parking',
      'Beach access',
      'Concierge service',
      'Laundry service available'
    ],
    cancellationPolicy: 'Free cancellation up to 5 days before check-in. Cancellations within 1-4 days incur a 1-night charge. No refund for same-day cancellations or no-shows.',
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    available: 4
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const nights = calculateNights()
  const totalPrice = nights * room.price

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/guest/search-rooms" className="flex items-center text-gray-600 hover:text-blue-600 transition">
              <span className="mr-2">←</span>
              <span>Back to Search</span>
            </Link>
            
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Sky Nest</span>
            </Link>

            <Link href="/guest/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Room Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="flex items-center">
              <span className="text-yellow-500 mr-1">⭐</span>
              {room.rating} ({room.reviews} reviews)
            </span>
            <span className="flex items-center">
              <span className="mr-1">📍</span>
              {room.branchLocation}
            </span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-2 mb-8 rounded-2xl overflow-hidden">
          <div className="col-span-4 md:col-span-2 md:row-span-2">
            <img 
              src={room.images[selectedImage]} 
              alt={room.name}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
              onClick={() => setSelectedImage(0)}
            />
          </div>
          {room.images.slice(1, 5).map((image, idx) => (
            <div key={idx} className="col-span-2 md:col-span-1">
              <img 
                src={image} 
                alt={`${room.name} ${idx + 2}`}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                onClick={() => setSelectedImage(idx + 1)}
              />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Details</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📏</span>
                  <div>
                    <p className="text-sm text-gray-600">Room Size</p>
                    <p className="font-semibold text-gray-900">{room.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🛏️</span>
                  <div>
                    <p className="text-sm text-gray-600">Bed Type</p>
                    <p className="font-semibold text-gray-900">{room.beds}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-semibold text-gray-900">Up to {room.capacity} guests</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{room.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {room.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <span className="text-xl">{amenity.icon}</span>
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
              <ul className="grid md:grid-cols-2 gap-3">
                {room.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Check-in/out Times */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Check-in & Check-out</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🕐</span>
                    <span className="font-semibold text-gray-900">Check-in</span>
                  </div>
                  <p className="text-gray-700">{room.checkInTime}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🕛</span>
                    <span className="font-semibold text-gray-900">Check-out</span>
                  </div>
                  <p className="text-gray-700">{room.checkOutTime}</p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancellation Policy</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-gray-700">{room.cancellationPolicy}</p>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">${room.price}</span>
                  <span className="text-gray-600">/ night</span>
                </div>
                {room.originalPrice > room.price && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 line-through">${room.originalPrice}</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                      Save ${room.originalPrice - room.price}
                    </span>
                  </div>
                )}
              </div>

              {room.available <= 5 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ Only {room.available} rooms left at this price!
                  </p>
                </div>
              )}

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min="2025-10-02"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || "2025-10-02"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3].map(num => (
                      <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {nights > 0 && (
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>${room.price} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Service fee</span>
                      <span>${Math.round(totalPrice * 0.1)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Taxes</span>
                      <span>${Math.round(totalPrice * 0.12)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${totalPrice + Math.round(totalPrice * 0.1) + Math.round(totalPrice * 0.12)}</span>
                    </div>
                  </div>
                )}

                <Link
                  href={`/guest/booking?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold text-center"
                >
                  Reserve Now
                </Link>

                <p className="text-center text-sm text-gray-500">You won't be charged yet</p>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <span>🔒</span>
                  <span>Secure payment • Free cancellation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}