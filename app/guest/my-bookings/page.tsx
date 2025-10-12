// app/guest/my-bookings/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import GuestNavbar from '@/app/components/GuestNavbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BedDouble, MapPin } from 'lucide-react'

// Mock Data (can be easily replaced with API calls)
const bookings = [
  {
    id: 'BK-2025-12345',
    status: 'Upcoming',
    room: 'Deluxe Ocean View Suite',
    branch: 'Sky Nest Galle',
    checkIn: '2025-11-10',
    checkOut: '2025-11-14',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=300',
    canModify: true
  },
  {
    id: 'BK-2025-12343',
    status: 'Past',
    room: 'Suite',
    branch: 'Sky Nest Kandy',
    checkIn: '2025-09-15',
    checkOut: '2025-09-18',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=300',
    canModify: false
  },
  {
    id: 'BK-2025-12342',
    status: 'Cancelled',
    room: 'Deluxe Room',
    branch: 'Sky Nest Galle',
    checkIn: '2025-08-20',
    checkOut: '2025-08-23',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300',
    canModify: false
  }
];

const getStatusColor = (status: string) => {
    if (status === 'Upcoming') return 'bg-blue-100 text-blue-700';
    if (status === 'Past') return 'bg-gray-100 text-gray-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
};

export default function MyBookingsPage() {
  const [filter, setFilter] = useState('Upcoming');

  const filteredBookings = bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-t from-amber-700/40 to-amber-50 text-gray-800">
      <GuestNavbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 font-l">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your upcoming, past, and cancelled reservations.</p>
        </header>

        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 mb-8">
          <button onClick={() => setFilter('Upcoming')} className={`px-4 py-2 font-semibold transition-colors ${filter === 'Upcoming' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500 hover:text-gray-800'}`}>Upcoming</button>
          <button onClick={() => setFilter('Past')} className={`px-4 py-2 font-semibold transition-colors ${filter === 'Past' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500 hover:text-gray-800'}`}>Past</button>
          <button onClick={() => setFilter('Cancelled')} className={`px-4 py-2 font-semibold transition-colors ${filter === 'Cancelled' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500 hover:text-gray-800'}`}>Cancelled</button>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => (
              <Card key={booking.id} className="shadow-lg bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                <div className="flex">
                  <div className="w-1/3 hidden md:block">
                    <div className="relative h-full">
                      <Image src={booking.image} alt={booking.room} fill className="object-cover" />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">{booking.room}</CardTitle>
                          <CardDescription className="flex items-center text-sm mt-1">
                            <MapPin size={12} className="mr-1.5"/> 
                            {booking.branch.split(' ')[2]}
                          </CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>{booking.status}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <BedDouble size={16} className="mr-3 text-gray-500" />
                          <p className="font-medium text-gray-800">{booking.room}</p>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-3 text-gray-500" />
                          <p className="font-medium text-gray-800">{booking.checkIn} – {booking.checkOut}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex space-x-3">
                        <Button variant="outline">View Details</Button>
                        {booking.canModify && <Button>Modify Booking</Button>}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600">You have no {filter.toLowerCase()} bookings.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

