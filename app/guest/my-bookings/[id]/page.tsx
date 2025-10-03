'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function BookingDetailsPage() {
  const params = useParams()
  const bookingId = params.id

  const [showCancelModal, setShowCancelModal] = useState(false)

  // Mock booking data - in real app, fetch from API based on bookingId
  const booking = {
    id: bookingId,
    confirmationNumber: 'SKN-GLE-2025-12345',
    status: 'Confirmed',
    room: {
      name: 'Deluxe Ocean View Suite',
      type: 'Suite',
      size: '55 sqm',
      beds: 'King Size Bed',
      capacity: 3,
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['Free WiFi', 'Ocean View', 'Mini Bar', 'Air Conditioning', 'Balcony', 'Room Service']
    },
    branch: {
      name: 'Sky Nest Galle',
      id: 'galle',
      address: 'Fort Road, Galle Fort, Galle 80000, Sri Lanka',
      phone: '+94 91 234 5678',
      email: 'galle@skynest.lk'
    },
    dates: {
      checkIn: '2025-11-10',
      checkOut: '2025-11-14',
      checkInTime: '2:00 PM',
      checkOutTime: '12:00 PM',
      nights: 4
    },
    guest: {
      name: 'Rashmika Nawanjana',
      email: 'rashmika@example.com',
      phone: '+94 77 123 4567',
      guests: 2,
      idType: 'Passport',
      idNumber: 'N1234567'
    },
    payment: {
      roomPrice: 200,
      totalRoomCost: 800,
      serviceFee: 80,
      taxes: 96,
      totalAmount: 976,
      paidAmount: 976,
      pendingAmount: 0,
      paymentMethod: 'Credit Card',
      paymentDate: '2025-10-02',
      transactionId: 'TXN-2025-98765'
    },
    preferences: {
      roomPreference: 'High floor',
      arrivalTime: '3:00 PM',
      specialRequests: 'Quiet room away from elevator, extra pillows'
    },
    timeline: [
      { date: '2025-10-02 14:30', event: 'Booking Created', status: 'completed' },
      { date: '2025-10-02 14:32', event: 'Payment Confirmed', status: 'completed' },
      { date: '2025-11-10 14:00', event: 'Check-in', status: 'upcoming' },
      { date: '2025-11-14 12:00', event: 'Check-out', status: 'upcoming' }
    ],
    services: [
      { name: 'Airport Transfer', date: '2025-11-10', price: 50, status: 'Confirmed' },
      { name: 'Spa Treatment', date: '2025-11-11', price: 120, status: 'Pending' }
    ],
    cancellationPolicy: {
      canCancel: true,
      freeUntil: '2025-11-05',
      penaltyPeriod: '2025-11-06 to 2025-11-09',
      penaltyAmount: 200,
      noRefundAfter: '2025-11-09'
    },
    canModify: true,
    canCancel: true,
    canAddServices: true
  }

  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/guest/my-bookings" className="flex items-center text-gray-600 hover:text-blue-600 transition">
              <span className="mr-2">←</span>
              <span>Back to My Bookings</span>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">✓</span>
                <h1 className="text-2xl font-bold">Booking {booking.status}</h1>
              </div>
              <p className="text-green-100">Confirmation: {booking.confirmationNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">Booking ID</p>
              <p className="text-xl font-semibold">{booking.id}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative">
                <img 
                  src={booking.room.images[selectedImage]} 
                  alt={booking.room.name}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
                  {booking.room.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-3 h-3 rounded-full transition ${
                        selectedImage === idx ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{booking.room.name}</h2>
                <p className="text-gray-600 mb-4">{booking.branch.name}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Room Size</p>
                    <p className="font-semibold text-gray-900">{booking.room.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bed Type</p>
                    <p className="font-semibold text-gray-900">{booking.room.beds}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-semibold text-gray-900">{booking.room.capacity} guests</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Type</p>
                    <p className="font-semibold text-gray-900">{booking.room.type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Room Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {booking.room.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">📅</span>
                    <h3 className="font-semibold text-gray-900">Check-in</h3>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{booking.dates.checkIn}</p>
                  <p className="text-gray-600">From {booking.dates.checkInTime}</p>
                  {booking.preferences.arrivalTime && (
                    <p className="text-sm text-blue-600 mt-1">Expected arrival: {booking.preferences.arrivalTime}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">📅</span>
                    <h3 className="font-semibold text-gray-900">Check-out</h3>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{booking.dates.checkOut}</p>
                  <p className="text-gray-600">Before {booking.dates.checkOutTime}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">{booking.dates.nights} nights</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Number of Guests</p>
                    <p className="font-semibold text-gray-900">{booking.guest.guests} guests</p>
                  </div>
                  {booking.preferences.roomPreference && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Room Preference</p>
                      <p className="font-semibold text-gray-900">{booking.preferences.roomPreference}</p>
                    </div>
                  )}
                </div>
              </div>

              {booking.preferences.specialRequests && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
                  <p className="text-gray-700">{booking.preferences.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Guest Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">{booking.guest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{booking.guest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-900">{booking.guest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID Type</p>
                  <p className="font-semibold text-gray-900">{booking.guest.idType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID Number</p>
                  <p className="font-semibold text-gray-900">{booking.guest.idNumber}</p>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            {booking.services.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Services</h2>
                
                <div className="space-y-3">
                  {booking.services.map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${service.price}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          service.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {booking.canAddServices && (
                  <Link 
                    href="/guest/services"
                    className="mt-4 block text-center py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                  >
                    + Add More Services
                  </Link>
                )}
              </div>
            )}

            {/* Property Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Property Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🏨</span>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.branch.name}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-900">{booking.branch.address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${booking.branch.phone}`} className="text-blue-600 hover:underline">
                      {booking.branch.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${booking.branch.email}`} className="text-blue-600 hover:underline">
                      {booking.branch.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Timeline</h2>
              
              <div className="space-y-4">
                {booking.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status === 'completed' ? '✓' : '○'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.event}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>${booking.payment.roomPrice} × {booking.dates.nights} nights</span>
                    <span>${booking.payment.totalRoomCost}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service fee</span>
                    <span>${booking.payment.serviceFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Taxes</span>
                    <span>${booking.payment.taxes}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-blue-600">${booking.payment.totalAmount}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="font-semibold text-green-900">Fully Paid</p>
                      <p className="text-sm text-green-700">${booking.payment.paidAmount} paid on {booking.payment.paymentDate}</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Payment Method: {booking.payment.paymentMethod}</p>
                  <p>Transaction ID: {booking.payment.transactionId}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                    🖨️ Print Confirmation
                  </button>
                  
                  <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                    📄 Download Invoice
                  </button>

                  {booking.canModify && (
                    <Link 
                      href={`/guest/my-bookings/modify/${booking.id}`}
                      className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                    >
                      ✏️ Modify Booking
                    </Link>
                  )}

                  {booking.canCancel && (
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="w-full py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                    >
                      ✗ Cancel Booking
                    </button>
                  )}

                  <Link 
                    href="/guest/help/contact"
                    className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
                  >
                    💬 Contact Support
                  </Link>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Cancellation Policy</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <p className="text-gray-700">
                      <strong>Free cancellation</strong> until {booking.cancellationPolicy.freeUntil}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-600">⚠️</span>
                    <p className="text-gray-700">
                      <strong>${booking.cancellationPolicy.penaltyAmount} penalty</strong> for cancellations {booking.cancellationPolicy.penaltyPeriod}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-600">✗</span>
                    <p className="text-gray-700">
                      <strong>No refund</strong> after {booking.cancellationPolicy.noRefundAfter}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? Based on our cancellation policy, you will receive a full refund.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Keep Booking
              </button>
              <Link
                href={`/guest/my-bookings/cancel/${booking.id}`}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-center"
              >
                Cancel Booking
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}