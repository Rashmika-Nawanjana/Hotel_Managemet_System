'use client'

import Link from 'next/link'

export default function GuestDashboardPage() {
  // Example static data; in real app, fetch from API
  const upcomingBooking = {
    hotel: 'Sky Nest Kandy',
    room: 'Suite',
    checkIn: '2025-11-10',
    checkOut: '2025-11-14',
    status: 'Confirmed'
  }

  const lastServices = [
    { name: 'Spa Treatment', date: '2025-07-20', status: 'Completed' },
    { name: 'Room Service', date: '2025-07-19', status: 'Completed' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">SN</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Sky Nest</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/guest/profile" className="text-gray-600 hover:text-blue-600 transition">My Profile</Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 transition">Sign Out</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome back!</h1>
        
        {/* Upcoming Booking */}
        <div className="bg-white rounded-xl shadow p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Booking</h2>
            <Link href="/guest/my-bookings" className="text-blue-600 hover:underline text-sm">View all</Link>
          </div>
          {upcomingBooking ? (
            <div className="grid md:grid-cols-4 gap-6 items-center">
              <div>
                <span className="block text-gray-500 text-xs">Hotel</span>
                <span className="block text-lg font-medium">{upcomingBooking.hotel}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Room</span>
                <span className="block text-lg font-medium">{upcomingBooking.room}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Dates</span>
                <span className="block text-lg font-medium">{upcomingBooking.checkIn} – {upcomingBooking.checkOut}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Status</span>
                <span className="block text-lg font-medium text-green-600">{upcomingBooking.status}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">You have no upcoming bookings.</p>
          )}
          <div className="mt-6 flex space-x-4">
            <Link href="/guest/booking" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Make a new booking</Link>
            <Link href="/guest/my-bookings" className="bg-gray-100 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition">Manage bookings</Link>
          </div>
        </div>

        {/* Recent Services */}
        <div className="bg-white rounded-xl shadow p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Services</h2>
            <Link href="/guest/services/my-requests" className="text-blue-600 hover:underline text-sm">View all</Link>
          </div>
          {lastServices.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {lastServices.map((service, idx) => (
                <li key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">{service.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{service.date}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${service.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {service.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recent service requests.</p>
          )}
          <div className="mt-6 flex space-x-4">
            <Link href="/guest/services/request" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Request a service</Link>
            <Link href="/guest/services" className="bg-gray-100 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition">Browse services</Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link href="/guest/billing" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
            <span className="text-3xl mb-2">💳</span>
            <span className="font-semibold text-gray-800">My Bills</span>
            <span className="text-xs text-blue-600 mt-1">View & pay</span>
          </Link>
          <Link href="/guest/profile/preferences" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
            <span className="text-3xl mb-2">🌟</span>
            <span className="font-semibold text-gray-800">Preferences</span>
            <span className="text-xs text-blue-600 mt-1">Update</span>
          </Link>
          <Link href="/guest/help" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
            <span className="text-3xl mb-2">❓</span>
            <span className="font-semibold text-gray-800">Help Center</span>
            <span className="text-xs text-blue-600 mt-1">Support</span>
          </Link>
          <Link href="/guest/services" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
            <span className="text-3xl mb-2">🛎️</span>
            <span className="font-semibold text-gray-800">Order Services</span>
            <span className="text-xs text-blue-600 mt-1">Spa, Dining, More</span>
          </Link>
        </div>
      </div>
    </div>
  )
}