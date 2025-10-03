'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ServiceRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('serviceId')

  const [formData, setFormData] = useState({
    serviceId: serviceId || '',
    bookingId: '',
    date: '',
    time: '',
    location: 'room',
    roomNumber: '',
    numberOfPeople: 1,
    specialRequests: '',
    contactMethod: 'email'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock services data
  const services = [
    { id: '1', name: 'Room Service', icon: '🍴', requiresTime: true, requiresPeople: true },
    { id: '2', name: 'Spa Treatment', icon: '💆', requiresTime: true, requiresPeople: true },
    { id: '3', name: 'Airport Transfer', icon: '✈️', requiresTime: true, requiresPeople: true },
    { id: '4', name: 'Swimming Pool', icon: '🏊', requiresTime: false, requiresPeople: false },
    { id: '5', name: 'Fitness Center', icon: '💪', requiresTime: false, requiresPeople: false },
    { id: '6', name: 'Fine Dining Restaurant', icon: '🍷', requiresTime: true, requiresPeople: true },
    { id: '7', name: 'Car Rental', icon: '🚙', requiresTime: true, requiresPeople: false },
    { id: '8', name: 'Laundry Service', icon: '👔', requiresTime: false, requiresPeople: false },
    { id: '9', name: 'Business Center', icon: '💼', requiresTime: true, requiresPeople: false },
    { id: '10', name: 'Yoga Classes', icon: '🧘', requiresTime: true, requiresPeople: true },
    { id: '11', name: 'Tour Packages', icon: '🗺️', requiresTime: true, requiresPeople: true },
    { id: '12', name: 'Babysitting Service', icon: '👶', requiresTime: true, requiresPeople: true }
  ]

  // Mock user bookings
  const myBookings = [
    { id: 'BK-2025-12345', room: 'Deluxe Ocean View Suite', branch: 'Sky Nest Galle', checkIn: '2025-11-10' },
    { id: 'BK-2025-12344', room: 'Presidential Suite', branch: 'Sky Nest Colombo', checkIn: '2025-10-01' }
  ]

  const selectedService = services.find(s => s.id === formData.serviceId)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.serviceId) newErrors.serviceId = 'Please select a service'
    if (!formData.date) newErrors.date = 'Date is required'
    if (selectedService?.requiresTime && !formData.time) newErrors.time = 'Time is required'
    if (formData.location === 'room' && !formData.roomNumber) {
      newErrors.roomNumber = 'Room number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Implement actual service request API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Redirect to confirmation page
      router.push('/guest/services/confirmation?requestId=SR-2025-001')
    } catch (err) {
      setErrors({ general: 'Failed to submit request. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/guest/services" className="flex items-center text-gray-600 hover:text-blue-600 transition">
              <span className="mr-2">←</span>
              <span>Back to Services</span>
            </Link>
            
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Sky Nest</span>
            </Link>

            <Link href="/guest/dashboard" className="text-gray-600 hover:text-blue-600 transition">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a Service</h1>
          <p className="text-gray-600">Fill out the form below and we'll process your request promptly</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Service Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Service *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => handleInputChange('serviceId', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.serviceId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose a service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.icon} {service.name}
                    </option>
                  ))}
                </select>
                {errors.serviceId && <p className="mt-1 text-sm text-red-600">{errors.serviceId}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link to Booking (Optional)
                </label>
                <select
                  value={formData.bookingId}
                  onChange={(e) => handleInputChange('bookingId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Not linked to a booking</option>
                  {myBookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.id} - {booking.room} ({booking.branch})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Link this service to an existing booking</p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">When do you need this service?</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min="2025-10-02"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              {selectedService?.requiresTime && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.time ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Location & Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Service Location</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Where should we deliver/provide this service?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="room"
                      checked={formData.location === 'room'}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700 font-medium">My Room</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="venue"
                      checked={formData.location === 'venue'}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700 font-medium">Service Venue (e.g., Spa, Restaurant)</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="other"
                      checked={formData.location === 'other'}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700 font-medium">Other Location</span>
                  </label>
                </div>
              </div>

              {formData.location === 'room' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.roomNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 305"
                  />
                  {errors.roomNumber && <p className="mt-1 text-sm text-red-600">{errors.roomNumber}</p>}
                </div>
              )}

              {selectedService?.requiresPeople && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of People
                  </label>
                  <select
                    value={formData.numberOfPeople}
                    onChange={(e) => handleInputChange('numberOfPeople', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requests or Instructions (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Dietary restrictions, allergies, specific preferences..."
                />
                <p className="mt-1 text-xs text-gray-500">Any additional details that will help us serve you better</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="email"
                      checked={formData.contactMethod === 'email'}
                      onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="sms"
                      checked={formData.contactMethod === 'sms'}
                      onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">SMS</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="phone"
                      checked={formData.contactMethod === 'phone'}
                      onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Phone Call</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                I understand that service availability is subject to confirmation and additional charges may apply. I will be notified before any charges are processed. *
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Submitting Request...
                </div>
              ) : (
                'Submit Service Request'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              You'll receive a confirmation once your request is processed
            </p>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Need Help?
          </h3>
          <p className="text-sm text-blue-900 mb-3">
            If you need immediate assistance or have questions about our services, please contact our concierge:
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="tel:+94912345678" className="text-blue-700 hover:underline font-medium">
              📞 +94 91 234 5678
            </a>
            <a href="mailto:concierge@skynest.lk" className="text-blue-700 hover:underline font-medium">
              ✉️ concierge@skynest.lk
            </a>
            <Link href="/guest/help/contact" className="text-blue-700 hover:underline font-medium">
              💬 Live Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}