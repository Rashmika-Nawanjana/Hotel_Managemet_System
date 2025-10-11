'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Bed,
  Maximize,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Check,
  Wifi,
  Coffee,
  Tv,
  Wind,
  Shield,
  Phone,
  Mail,
} from 'lucide-react'

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
  isFeatured: boolean
  popularityScore: number
  status: string
  branch: {
    id: string
    name: string
    slug: string
    location: string
    address: string
    phone: string
    email: string
  }
  images: Array<{
    id: string
    url: string
    caption: string | null
    isPrimary: boolean
  }>
  amenitiesByCategory: Record<
    string,
    Array<{
      id: string
      name: string
      icon: string
      description: string | null
    }>
  >
  availableRooms: number
  rooms: Array<{
    id: string
    roomNumber: string
    floor: number
    status: string
  }>
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<RoomType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  useEffect(() => {
    if (params.slug) {
      fetchRoom()
    }
  }, [params.slug])

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.slug}`)
      if (!response.ok) {
        throw new Error('Room not found')
      }

      const data = await response.json()
      setRoom(data.data)
    } catch (err) {
      console.error('Error fetching room:', err)
      setError('Failed to load room details')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  const nextImage = () => {
    if (room && room.images) {
      setSelectedImageIndex((prev) => (prev + 1) % room.images.length)
    }
  }

  const prevImage = () => {
    if (room && room.images) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? room.images.length - 1 : prev - 1
      )
    }
  }

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates')
      return
    }
    // TODO: Navigate to booking page with params
    alert(`Booking for ${guests} guest(s) from ${checkIn} to ${checkOut}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The room you are looking for does not exist.'}</p>
          <Link
            href="/rooms"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Browse All Rooms
          </Link>
        </div>
      </div>
    )
  }

  const primaryImage = room.images?.find((img) => img.isPrimary) || room.images?.[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/rooms"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Rooms
            </Link>
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{room.name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {room.branch.name}, {room.branch.location}
                </span>
                {room.isFeatured && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-4 h-4" fill="currentColor" />
                    Featured
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Starting from</p>
              <p className="text-3xl font-bold text-blue-600">
                LKR {formatPrice(room.basePrice)}
              </p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {room.images && room.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div
                    className="relative h-96 cursor-pointer"
                    onClick={() => setShowLightbox(true)}
                  >
                    <img
                      src={room.images[selectedImageIndex]?.url || primaryImage?.url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    {room.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            prevImage()
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            nextImage()
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {room.images.length}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {room.images.length > 1 && (
                    <div className="p-4 bg-gray-50 flex gap-3 overflow-x-auto">
                      {room.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition ${
                            selectedImageIndex === index
                              ? 'border-blue-500'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`${room.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">🏨</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Room</h2>
              {room.shortDescription && (
                <p className="text-lg text-gray-700 mb-4 font-medium">
                  {room.shortDescription}
                </p>
              )}
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>

            {/* Room Specifications */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Max Occupancy</p>
                    <p className="text-gray-600">{room.maxOccupancy} guests</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bed className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Bed Configuration</p>
                    <p className="text-gray-600">
                      {room.numberOfBeds} {room.bedType} Bed{room.numberOfBeds > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Maximize className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Room Size</p>
                    <p className="text-gray-600">{room.roomSize} m²</p>
                  </div>
                </div>

                {room.viewType && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🌅</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">View</p>
                      <p className="text-gray-600">{room.viewType}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {room.amenitiesByCategory &&
              Object.keys(room.amenitiesByCategory).length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
                  <div className="space-y-6">
                    {Object.entries(room.amenitiesByCategory).map(
                      ([category, amenities]) => (
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
                                  <p className="font-medium text-gray-900">
                                    {amenity.name}
                                  </p>
                                  {amenity.description && (
                                    <p className="text-xs text-gray-600">
                                      {amenity.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Branch Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Branch</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {room.branch.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="text-gray-700">{room.branch.address}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <a
                      href={`tel:${room.branch.phone}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      {room.branch.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <a
                      href={`mailto:${room.branch.email}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {room.branch.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Price per night</p>
                  <p className="text-3xl font-bold text-blue-600">
                    LKR {formatPrice(room.basePrice)}
                  </p>
                </div>

                {/* Availability */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="flex items-center gap-2 text-green-700 font-semibold">
                    <Check className="w-5 h-5" />
                    {room.availableRooms > 0
                      ? `${room.availableRooms} room${room.availableRooms > 1 ? 's' : ''} available`
                      : 'Currently unavailable'}
                  </p>
                </div>

                {/* Booking Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: room.maxOccupancy }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num} Guest{num > 1 ? 's' : ''}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <button
                    onClick={handleBookNow}
                    disabled={room.availableRooms === 0}
                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {room.availableRooms > 0 ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Free cancellation up to 24 hours
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    No payment required today
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Confirmation is immediate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && room.images && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="max-w-6xl w-full">
            <img
              src={room.images[selectedImageIndex]?.url}
              alt={room.name}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            {room.images[selectedImageIndex]?.caption && (
              <p className="text-white text-center mt-4">
                {room.images[selectedImageIndex].caption}
              </p>
            )}
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedImageIndex + 1} / {room.images.length}
          </div>
        </div>
      )}
    </div>
  )
}