'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ServiceConfirmationPage() {
  const searchParams = useSearchParams()
  const requestId = searchParams.get('requestId')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Trigger success animation after mount
    setShowSuccess(true)
  }, [])

  // Mock service request data - in real app, fetch from API
  const serviceRequest = {
    id: requestId || 'SR-2025-001',
    status: 'Pending',
    service: {
      name: 'Spa Treatment',
      icon: '💆',
      description: 'Relaxing massages, facials, and wellness treatments'
    },
    details: {
      date: '2025-10-15',
      time: '2:00 PM',
      location: 'Spa Venue',
      numberOfPeople: 2,
      specialRequests: 'Swedish massage for both guests, extra essential oils'
    },
    guest: {
      name: 'Rashmika Nawanjana',
      email: 'rashmika@example.com',
      phone: '+94 77 123 4567',
      contactMethod: 'Email'
    },
    linkedBooking: {
      id: 'BK-2025-12345',
      room: 'Deluxe Ocean View Suite',
      branch: 'Sky Nest Galle'
    },
    pricing: {
      basePrice: 120,
      taxesAndFees: 18,
      total: 138
    },
    submittedAt: '2025-10-02 08:29:35',
    estimatedConfirmation: 'Within 1-2 hours',
    cancellationPolicy: 'Free cancellation up to 24 hours before scheduled time'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">SN</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800">Sky Nest</span>
              <p className="text-xs text-gray-500 -mt-1">Service Request Confirmed</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Message */}
        <div className={`text-center mb-12 transition-all duration-500 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
            <span className="text-5xl">✓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Service Request Submitted!</h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you, {serviceRequest.guest.name}! We've received your request.
          </p>
          <p className="text-gray-600">
            Request ID: <span className="font-semibold text-blue-600">{serviceRequest.id}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            href="/guest/services/my-requests"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View My Requests
          </Link>
          <Link
            href="/guest/services"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Browse More Services
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            🖨️ Print Details
          </button>
        </div>

        {/* Request Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                  {serviceRequest.service.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{serviceRequest.service.name}</h2>
                  <p className="text-green-100">{serviceRequest.service.description}</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold">{serviceRequest.status}</span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">📅</span>
                    <p className="text-sm text-gray-600">Date</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{serviceRequest.details.date}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">🕐</span>
                    <p className="text-sm text-gray-600">Time</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{serviceRequest.details.time}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">📍</span>
                    <p className="text-sm text-gray-600">Location</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{serviceRequest.details.location}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">👥</span>
                    <p className="text-sm text-gray-600">Number of People</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{serviceRequest.details.numberOfPeople}</p>
                </div>
              </div>

              {serviceRequest.details.specialRequests && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                  <p className="text-gray-900">{serviceRequest.details.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Guest Information */}
            <div className="border-t pt-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-semibold text-gray-900">{serviceRequest.guest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{serviceRequest.guest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">{serviceRequest.guest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Preferred Contact</p>
                  <p className="font-semibold text-gray-900">{serviceRequest.guest.contactMethod}</p>
                </div>
              </div>
            </div>

            {/* Linked Booking */}
            {serviceRequest.linkedBooking && (
              <div className="border-t pt-8 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Linked to Booking</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{serviceRequest.linkedBooking.room}</p>
                      <p className="text-sm text-gray-600">{serviceRequest.linkedBooking.branch}</p>
                    </div>
                    <Link 
                      href={`/guest/my-bookings/${serviceRequest.linkedBooking.id}`}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      View Booking →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated Pricing</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Base Price</span>
                  <span>${serviceRequest.pricing.basePrice}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxes & Service Fees</span>
                  <span>${serviceRequest.pricing.taxesAndFees}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-xl">
                  <span>Estimated Total</span>
                  <span className="text-blue-600">${serviceRequest.pricing.total}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                * Final pricing will be confirmed along with service availability. Charges will be added to your room account or paid at the time of service.
              </p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Request Review</h3>
                <p className="text-gray-600 text-sm">Our team will review your request and check availability for your preferred date and time.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Confirmation</h3>
                <p className="text-gray-600 text-sm">You'll receive a confirmation via {serviceRequest.guest.contactMethod.toLowerCase()} within {serviceRequest.estimatedConfirmation}.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Service Delivery</h3>
                <p className="text-gray-600 text-sm">On {serviceRequest.details.date} at {serviceRequest.details.time}, we'll provide your requested service.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Payment & Feedback</h3>
                <p className="text-gray-600 text-sm">Charges will be processed and you can provide feedback on your experience.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">ℹ️</span>
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li>• Request submitted: {serviceRequest.submittedAt}</li>
              <li>• Request ID: {serviceRequest.id}</li>
              <li>• Status updates will be sent via {serviceRequest.guest.contactMethod}</li>
              <li>• You can track this request in "My Requests"</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
              Cancellation Policy
            </h3>
            <p className="text-sm text-yellow-900 mb-2">{serviceRequest.cancellationPolicy}</p>
            <Link 
              href={`/guest/services/my-requests`}
              className="text-yellow-700 hover:underline text-sm font-medium"
            >
              Manage this request →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Need Something Else?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/guest/services" className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
              <span className="text-4xl mb-3 block">🛎️</span>
              <h4 className="font-semibold text-gray-900 mb-2">More Services</h4>
              <p className="text-sm text-gray-600">Browse all available services</p>
            </Link>

            <Link href="/guest/services/my-requests" className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
              <span className="text-4xl mb-3 block">📋</span>
              <h4 className="font-semibold text-gray-900 mb-2">My Requests</h4>
              <p className="text-sm text-gray-600">Track all your service requests</p>
            </Link>

            <Link href="/guest/help/contact" className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
              <span className="text-4xl mb-3 block">💬</span>
              <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600">24/7 assistance available</p>
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Questions? Contact us at <a href="tel:+94912345678" className="text-blue-600 hover:underline">+94 91 234 5678</a>
          </p>
          <Link 
            href="/guest/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}