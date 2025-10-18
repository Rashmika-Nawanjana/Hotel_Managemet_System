'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = searchParams.get('roomId')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')

  const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    checkInDate: checkIn || '',
    checkOutDate: checkOut || '',
    numberOfGuests: guests ? parseInt(guests) : 1,
    branchId: '',
    roomTypeId: roomId || '',
    specialRequests: '',
    // Guest Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Credit Card Information (not charged immediately)
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: ''
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch branches
      const branchesRes = await fetch('/api/branches')
      const branchesData = await branchesRes.json()
      if (branchesRes.ok) {
        setBranches(branchesData.branches || [])
        if (branchesData.branches?.length > 0) {
          setFormData(prev => ({ ...prev, branchId: branchesData.branches[0].id }))
        }
      }

      // Fetch room type if roomId is provided
      if (roomId) {
        const roomRes = await fetch(`/api/rooms/${roomId}`)
        const roomData = await roomRes.json()
        if (roomRes.ok) {
          setRoomType(roomData.roomType)
          setFormData(prev => ({ 
            ...prev, 
            roomTypeId: roomData.roomType.id,
            branchId: roomData.roomType.branch?.id || prev.branchId
          }))
        }
      }
    } catch (err) {
      setError('Failed to load booking data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateTotalPrice = () => {
    if (!roomType || !formData.checkInDate || !formData.checkOutDate) return 0
    
    const checkIn = new Date(formData.checkInDate)
    const checkOut = new Date(formData.checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    return nights * roomType.basePrice
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Validate required fields
      const requiredFields = [
        'checkInDate', 'checkOutDate', 'branchId', 'roomTypeId',
        'firstName', 'lastName', 'email', 'phone',
        'cardNumber', 'cardExpiry', 'cardCvv', 'cardName',
        'billingAddress', 'billingCity', 'billingPostalCode', 'billingCountry'
      ]

      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`)
        setSubmitting(false)
        return
      }

      // Validate dates
      const checkIn = new Date(formData.checkInDate)
      const checkOut = new Date(formData.checkOutDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (checkIn < today) {
        setError('Check-in date cannot be in the past')
        setSubmitting(false)
        return
      }

      if (checkOut <= checkIn) {
        setError('Check-out date must be after check-in date')
        setSubmitting(false)
        return
      }

      // Create booking
      const bookingData = {
        ...formData,
        totalPrice: calculateTotalPrice(),
        // Credit card info is stored but not charged immediately
        paymentInfo: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardExpiry: formData.cardExpiry,
          cardCvv: formData.cardCvv,
          cardName: formData.cardName,
          billingAddress: formData.billingAddress,
          billingCity: formData.billingCity,
          billingPostalCode: formData.billingPostalCode,
          billingCountry: formData.billingCountry
        }
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking')
      }

      // Redirect to confirmation page
      router.push(`/guest/booking/confirmation?bookingId=${result.booking.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking form...</p>
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
            <Link href="/guest/search-rooms" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Sky Nest</span>
                <p className="text-xs text-gray-500 -mt-1">Book Your Stay</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/guest/my-bookings" className="text-gray-600 hover:text-blue-600 transition">My Bookings</Link>
              <Link href="/guest/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Complete Your Booking</h1>
            <p className="text-blue-100 mt-1">Your credit card information will be securely stored but not charged until check-in</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Booking Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                      <input
                        type="date"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                      <input
                        type="date"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        onChange={handleInputChange}
                        min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                      <select
                        name="numberOfGuests"
                        value={formData.numberOfGuests}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                      <select
                        name="branchId"
                        value={formData.branchId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special requests or notes..."
                    />
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Credit Card Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                  <p className="text-sm text-gray-600 mb-4">Your card will be securely stored but not charged until check-in</p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        name="cardCvv"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="billingPostalCode"
                        value={formData.billingPostalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
                  
                  {roomType ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        {roomType.images?.[0] && (
                          <img 
                            src={roomType.images[0].url} 
                            alt={roomType.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{roomType.name}</h3>
                          <p className="text-sm text-gray-600">{roomType.branch?.name}</p>
                          <p className="text-sm text-gray-600">{roomType.bedType} • {roomType.maxOccupancy} guests</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between text-sm">
                          <span>Check-in:</span>
                          <span>{formData.checkInDate || 'Select date'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Check-out:</span>
                          <span>{formData.checkOutDate || 'Select date'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Guests:</span>
                          <span>{formData.numberOfGuests}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Nights:</span>
                          <span>
                            {formData.checkInDate && formData.checkOutDate 
                              ? Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                              : 0
                            }
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Price per night:</span>
                          <span>${roomType.basePrice}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span>${calculateTotalPrice()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Select a room type to see pricing</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Payment Policy</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your card will be securely stored but not charged</li>
                    <li>• Payment will be processed at check-in</li>
                    <li>• Free cancellation up to 24 hours before check-in</li>
                    <li>• All prices include taxes and fees</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !roomType || !formData.checkInDate || !formData.checkOutDate}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Creating Booking...' : 'Complete Booking'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
}