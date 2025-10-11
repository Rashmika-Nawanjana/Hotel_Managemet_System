'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('roomId')
  const roomSlug = searchParams.get('roomSlug')

  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '1'))
  const [specialRequests, setSpecialRequests] = useState('')

  useEffect(() => {
    if (roomSlug) {
      fetchRoom()
    }
  }, [roomSlug])

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomSlug}`)
      if (!response.ok) throw new Error('Failed to fetch room')
      
      const data = await response.json()
      setRoom(data.data)
    } catch (err) {
      console.error('Error fetching room:', err)
      setError('Failed to load room details')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Find an available room instance
      const availableRoom = room.rooms?.find((r: any) => r.status === 'AVAILABLE')
      
      if (!availableRoom) {
        throw new Error('No rooms available for the selected dates')
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          roomId: availableRoom.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guests,
          specialRequests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      // Redirect to payment page
      router.push(`/guest/booking/payment?bookingId=${data.data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Room not found</p>
          <Link href="/rooms" className="text-blue-600 hover:underline">
            Browse rooms
          </Link>
        </div>
      </div>
    )
  }

  const nights = calculateNights()
  const basePrice = typeof room.basePrice === 'string' ? parseFloat(room.basePrice) : room.basePrice
  const totalPrice = nights * basePrice
  const serviceFee = Math.round(totalPrice * 0.1)
  const taxes = Math.round(totalPrice * 0.12)
  const grandTotal = totalPrice + serviceFee + taxes

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/rooms/${roomSlug}`} className="flex items-center text-gray-600 hover:text-blue-600 transition">
              <span className="mr-2">←</span>
              <span>Back to Room</span>
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleBooking} className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Room Details</h2>
              <div className="flex gap-4">
                {room.images && room.images[0] && (
                  <img
                    src={room.images[0].url}
                    alt={room.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                  <p className="text-gray-600">{room.branch.name}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {room.maxOccupancy} guests • {room.bedType} • {room.roomSize}m²
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: room.maxOccupancy }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} Guest{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requirements?"
                />
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Cancellation Policy</h3>
              <p className="text-sm text-blue-900">
                Free cancellation up to 5 days before check-in. Cancellations within 1-4 days incur a 1-night charge. 
                No refund for same-day cancellations or no-shows.
              </p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>

              {nights > 0 && (
                <>
                  <div className="space-y-3 mb-4 pb-4 border-b">
                    <div className="flex justify-between text-gray-700">
                      <span>LKR {basePrice.toFixed(2)} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>LKR {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Service fee</span>
                      <span>LKR {serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Taxes</span>
                      <span>LKR {taxes.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-bold text-xl mb-6">
                    <span>Total</span>
                    <span className="text-blue-600">LKR {grandTotal.toFixed(2)}</span>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting || nights === 0}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                    Processing...
                  </span>
                ) : (
                  'Continue to Payment'
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                You won't be charged yet
              </p>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span>✓</span>
                  Free cancellation up to 5 days
                </p>
                <p className="flex items-center gap-2">
                  <span>✓</span>
                  Instant confirmation
                </p>
                <p className="flex items-center gap-2">
                  <span>✓</span>
                  Secure payment
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}