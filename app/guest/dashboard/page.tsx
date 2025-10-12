// app/guest/dashboard/page.tsx
'use client'

import Link from 'next/link'
import GuestNavbar from '@/app/components/GuestNavbar'; // Import the new GuestNavbar
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ConciergeBell, Star, CreditCard } from 'lucide-react';

export default function GuestDashboardPage() {
  // Example static data; in a real app, fetch from an API
  const upcomingBooking = {
    hotel: 'Sky Nest Kandy',
    room: 'Highland Retreat Suite',
    checkIn: '2025-11-10',
    checkOut: '2025-11-14',
    status: 'Confirmed'
  };

  const lastServices = [
    { name: 'Spa Treatment', date: '2025-07-20', status: 'Completed' },
    { name: 'Room Service Dinner', date: '2025-07-19', status: 'Completed' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-t from-amber-700/30 to-amber-50">
      <GuestNavbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-8 font-l">Welcome back!</h1>
        
        {/* Upcoming Booking */}
        <Card className="mb-5 shadow-xl bg-gradient-to-b from-white/80 to-white/10 backdrop-blur-lg border border-gray-200/80 rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Upcoming Booking</CardTitle>
                    <CardDescription>Your next luxury escape is confirmed.</CardDescription>
                </div>
                <Link href="/guest/my-bookings" passHref><Button variant="outline">View all</Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBooking ? (
              <div className="grid md:grid-cols-4 gap-6 items-center">
                <div><p className="text-gray-500 text-xs uppercase font-semibold">Hotel</p><p className="text-lg font-medium text-gray-900">{upcomingBooking.hotel}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold">Room</p><p className="text-lg font-medium text-gray-900">{upcomingBooking.room}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold">Dates</p><p className="text-lg font-medium text-gray-900">{upcomingBooking.checkIn} – {upcomingBooking.checkOut}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold">Status</p><p className="text-lg font-medium text-green-600">{upcomingBooking.status}</p></div>
              </div>
            ) : (
              <p className="text-gray-600">You have no upcoming bookings.</p>
            )}
            <div className="mt-6 flex space-x-4">
              <Link href="/guest/booking" passHref><Button>Make a new booking</Button></Link>
              <Link href="/guest/my-bookings" passHref><Button variant="secondary">Manage bookings</Button></Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Services & Quick Links */}
        <div className="grid md:grid-cols-2 gap-5">
            <Card className="shadow-xl bg-gradient-to-b from-white/80 to-white/10 backdrop-blur-lg border border-gray-200/80 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">Recent Services</CardTitle>
                    <CardDescription>A look at your recently enjoyed amenities.</CardDescription>
                </CardHeader>
                <CardContent>
                    {lastServices.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {lastServices.map((service, idx) => (
                        <li key={idx} className="py-3 flex items-center justify-between">
                            <div>
                                <span className="font-medium text-gray-800">{service.name}</span>
                                <span className="ml-2 text-xs text-gray-500">{service.date}</span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">{service.status}</span>
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-gray-600">No recent service requests.</p>
                    )}
                </CardContent>
            </Card>
            
            <Card className="shadow-xl bg-gradient-to-b from-white/80 to-white/10 backdrop-blur-lg border border-gray-200/80 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">Quick Links</CardTitle>
                    <CardDescription>Access your guest portal features.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <Link href="/guest/billing" className="bg-white/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-amber-50/80 transition-colors hover:shadow-lg">
                        <CreditCard className="w-8 h-8 mb-2 text-amber-600"/>
                        <span className="font-semibold text-gray-800">My Bills</span>
                        <span className="text-xs text-gray-600">View & pay</span>
                    </Link>
                    <Link href="/guest/profile/preferences" className="bg-white/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-amber-50/80 transition-colors hover:shadow-lg">
                        <Star className="w-8 h-8 mb-2 text-amber-600"/>
                        <span className="font-semibold text-gray-800">Preferences</span>
                        <span className="text-xs text-gray-600">Update your stay</span>
                    </Link>
                    <Link href="/guest/services" className="bg-white/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-amber-50/80 transition-colors hover:shadow-lg">
                        <ConciergeBell className="w-8 h-8 mb-2 text-amber-600"/>
                        <span className="font-semibold text-gray-800">Order Services</span>
                        <span className="text-xs text-gray-600">Spa, Dining, More</span>
                    </Link>
                    <Link href="/guest/my-bookings" className="bg-white/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-amber-50/80 transition-colors hover:shadow-lg">
                        <CalendarDays className="w-8 h-8 mb-2 text-amber-600"/>
                        <span className="font-semibold text-gray-800">My Bookings</span>
                        <span className="text-xs text-gray-600">View all trips</span>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  )
}

