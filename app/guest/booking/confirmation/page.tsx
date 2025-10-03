'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Show confetti only on client side after mount
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Mock booking data - in real app, fetch from API
  const booking = {
    id: bookingId || 'BK-2025-12345',
    confirmationNumber: 'SKN-GLE-2025-12345',
    status: 'Confirmed',
    room: 'Deluxe Ocean View Suite',
    branch: 'Sky Nest Galle',
    branchAddress: 'Fort Road, Galle Fort, Galle 80000, Sri Lanka',
    branchPhone: '+94 91 234 5678',
    checkIn: '2025-11-10',
    checkOut: '2025-11-14',
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    guests: 2,
    nights: 4,
    roomPrice: 200,
    total: 976,
    paidAmount: 976,
    paymentMethod: 'Credit Card',
    paymentDate: '2025-10-02',
    guest: {
      name: 'Rashmika Nawanjana',
      email: 'rashmika@example.com',
      phone: '+94 77 123 4567'
    },
    specialRequests: 'High floor, quiet room',
    amenities: ['Free WiFi', 'Ocean View', 'Breakfast Included', 'Free Parking', 'Spa Access']
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    alert('PDF download will be implemented')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">SN</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800">Sky Nest</span>
              <p className="text-xs text-gray-500 -mt-1">Booking Confirmed</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
            <span className="text-5xl">✓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you, {booking.guest.name}! Your reservation is confirmed.
          </p>
          <p className="text-gray-600">
            Confirmation number: <span className="font-semibold text-blue-600">{booking.confirmationNumber}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 print:hidden">
          <Link
            href="/guest/my-bookings"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View My Bookings
          </Link>
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            🖨️ Print Confirmation
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            📄 Download PDF
          </button>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{booking.room}</h2>
                <p className="text-blue-100">{booking.branch}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold">{booking.status}</span>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Check-in */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">📅</span>
                  <h3 className="text-lg font-semibold text-gray-900">Check-in</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{booking.checkIn}</p>
                <p className="text-gray-600">From {booking.checkInTime}</p>
              </div>

              {/* Check-out */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">📅</span>
                  <h3 className="text-lg font-semibold text-gray-900">Check-out</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{booking.checkOut}</p>
                <p className="text-gray-600">Before {booking.checkOutTime}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Guests</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.guests} guests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Nights</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.nights} nights</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.id}</p>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{booking.guest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{booking.guest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{booking.guest.phone}</p>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                  <p className="font-medium text-gray-900">{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>${booking.roomPrice} × {booking.nights} nights</span>
                  <span>${booking.roomPrice * booking.nights}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Service fee</span>
                  <span>${Math.round(booking.roomPrice * booking.nights * 0.1)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxes</span>
                  <span>${Math.round(booking.roomPrice * booking.nights * 0.12)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-xl">
                  <span>Total Paid</span>
                  <span className="text-green-600">${booking.total}</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-green-900">
                      Paid via {booking.paymentMethod} on {booking.paymentDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">{booking.branchAddress}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">{booking.branchPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Included Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {booking.amenities.map((amenity, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">ℹ️</span>
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>• A confirmation email has been sent to {booking.guest.email}</li>
            <li>• Please bring a valid ID and this confirmation number at check-in</li>
            <li>• Early check-in and late check-out are subject to availability</li>
            <li>• Free cancellation up to 5 days before check-in date</li>
            <li>• Contact the property directly for any special arrangements</li>
          </ul>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✓ <strong>Free cancellation</strong> until November 5, 2025 (5 days before check-in)</p>
            <p>⚠️ <strong>Partial refund</strong> (minus 1 night charge) for cancellations between November 6-9, 2025</p>
            <p>✗ <strong>No refund</strong> for same-day cancellations or no-shows</p>
          </div>
          <div className="mt-4">
            <Link 
              href={`/guest/my-bookings/${booking.id}`}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Manage this booking →
            </Link>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 print:hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/guest/services" className="group">
              <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
                <span className="text-4xl mb-3 block">🛎️</span>
                <h4 className="font-semibold text-gray-900 mb-2">Add Services</h4>
                <p className="text-sm text-gray-600">Pre-book spa, dining, or other services</p>
              </div>
            </Link>
            
            <Link href="/guest/profile/preferences" className="group">
              <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
                <span className="text-4xl mb-3 block">🌟</span>
                <h4 className="font-semibold text-gray-900 mb-2">Set Preferences</h4>
                <p className="text-sm text-gray-600">Update your room preferences</p>
              </div>
            </Link>
            
            <Link href="/guest/help/contact" className="group">
              <div className="text-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
                <span className="text-4xl mb-3 block">💬</span>
                <h4 className="font-semibold text-gray-900 mb-2">Contact Us</h4>
                <p className="text-sm text-gray-600">Questions? We're here to help</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center print:hidden">
          <p className="text-gray-600 mb-4">
            Need help? Contact us at <a href="tel:+94912345678" className="text-blue-600 hover:underline">+94 91 234 5678</a>
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