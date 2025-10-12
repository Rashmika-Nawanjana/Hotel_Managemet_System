// app/guest/room-details/[id]/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import GuestNavbar from '@/app/components/GuestNavbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, MapPin, BedDouble, Users, Ruler, Wifi, Wind, Tv, Utensils, Bath, Shield, Clock, Info } from 'lucide-react'
import { Label } from '@/components/ui/label'
import CustomDatePicker2 from '@/app/components/CustomDatePicker2'

export default function RoomDetailsPage() {
  const params = useParams()
  const roomId = params.id

  const [selectedImage, setSelectedImage] = useState(0)
  const [checkIn, setCheckIn] = useState<Date | undefined>()
  const [checkOut, setCheckOut] = useState<Date | undefined>()
  const [guests, setGuests] = useState(2)

  // Mock room data - in a real app, fetch from API based on roomId
  const room = {
    id: roomId,
    name: 'Deluxe Ocean View Suite',
    branchLocation: 'Galle Fort, Southern Province',
    price: 200,
    originalPrice: 250,
    rating: 4.8,
    reviews: 127,
    size: '55 sqm',
    beds: 'King Size Bed',
    capacity: 3,
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
    ],
    description: 'Experience luxury and comfort in our Deluxe Ocean View Suite. This spacious room features stunning views of the Indian Ocean, modern amenities, and elegant furnishings. Perfect for couples or small families seeking a memorable stay in historic Galle.',
    amenities: [
      { icon: Wifi, name: 'Free High-Speed WiFi' },
      { icon: Wind, name: 'Air Conditioning' },
      { icon: Tv, name: '55" Smart TV' },
      { icon: Utensils, name: 'Coffee/Tea Maker' },
      { icon: Bath, name: 'Luxury Bathroom' },
      { icon: Shield, name: 'Electronic Safe' },
    ],
    cancellationPolicy: 'Free cancellation up to 5 days before check-in. Cancellations within 1-4 days incur a 1-night charge.',
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    available: 4
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const diff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const nights = calculateNights()
  const totalPrice = nights * room.price

  return (
    <div className="min-h-screen bg-gradient-to-t from-amber-700/30 to-amber-50">
      <GuestNavbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Room Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-l">{room.name}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="flex items-center"><Star size={16} className="text-amber-500 mr-1.5"/> {room.rating} ({room.reviews} reviews)</span>
            <span className="flex items-center"><MapPin size={16} className="text-gray-500 mr-1.5"/> {room.branchLocation}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 mb-8 h-[500px]">
          <div className="col-span-2 row-span-2 rounded-l-xl overflow-hidden">
            <Image src={room.images[0]} alt={room.name} width={800} height={800} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"/>
          </div>
          <div className="overflow-hidden"><Image src={room.images[1]} alt={`${room.name} 2`} width={400} height={400} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/></div>
          <div className="rounded-tr-xl overflow-hidden"><Image src={room.images[2]} alt={`${room.name} 3`} width={400} height={400} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/></div>
          <div className="overflow-hidden"><Image src={room.images[3]} alt={`${room.name} 4`} width={400} height={400} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/></div>
          <div className="rounded-br-xl overflow-hidden"><Image src={room.images[0]} alt={`${room.name} 5`} width={400} height={400} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl">
              <CardHeader><CardTitle className="text-2xl font-bold text-gray-900 font-l">Room Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6 text-center">
                  <div className="p-4 bg-amber-50/50 rounded-lg"><Ruler className="mx-auto mb-1 text-amber-700"/><p className="font-semibold text-gray-900">{room.size}</p></div>
                  <div className="p-4 bg-amber-50/50 rounded-lg"><BedDouble className="mx-auto mb-1 text-amber-700"/><p className="font-semibold text-gray-900">{room.beds}</p></div>
                  <div className="p-4 bg-amber-50/50 rounded-lg"><Users className="mx-auto mb-1 text-amber-700"/><p className="font-semibold text-gray-900">Up to {room.capacity} guests</p></div>
                </div>
                <p className="text-gray-700 leading-relaxed font-l">{room.description}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl">
              <CardHeader><CardTitle className="text-2xl font-bold text-gray-900 font-l">Amenities</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {room.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <amenity.icon size={20} className="text-amber-700 flex-shrink-0"/>
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl">
              <CardHeader><CardTitle className="text-2xl font-bold text-gray-900 font-l">Hotel Policies</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                    <Clock size={20} className="text-gray-500 mt-1 flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold text-gray-800">Check-in & Check-out</h4>
                        <p className="text-gray-600">Check-in: {room.checkInTime} | Check-out: {room.checkOutTime}</p>
                    </div>
                </div>
                 <div className="flex items-start space-x-3">
                    <Info size={20} className="text-gray-500 mt-1 flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold text-gray-800">Cancellation Policy</h4>
                        <p className="text-gray-600">{room.cancellationPolicy}</p>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl shadow-xl p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">${room.price}</span>
                  <span className="text-gray-600">/ night</span>
                </div>
                {room.originalPrice > room.price && (
                  <div className="flex items-center space-x-2"><span className="text-gray-500 line-through">${room.originalPrice}</span><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">Save ${room.originalPrice - room.price}</span></div>
                )}
              </div>

              {room.available <= 5 && (
                <div className="mb-4 p-3 bg-red-100/50 border border-red-200 rounded-lg"><p className="text-red-700 text-sm font-medium">⚠️ Only {room.available} rooms left at this price!</p></div>
              )}

              <form className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Check-in</Label>
                  <CustomDatePicker2 value={checkIn} onChange={setCheckIn} placeholder="Select check-in date" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Check-out</Label>
                  <CustomDatePicker2 value={checkOut} onChange={setCheckOut} placeholder="Select check-out date" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Guests</Label>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    {[1, 2, 3].map(num => <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>)}
                  </select>
                </div>

                {nights > 0 && (
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700"><span>${room.price} × {nights} night{nights > 1 ? 's' : ''}</span><span>${totalPrice}</span></div>
                    <div className="flex justify-between text-gray-700"><span>Service fee</span><span>${Math.round(totalPrice * 0.1)}</span></div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg text-gray-900"><span>Total</span><span>${totalPrice + Math.round(totalPrice * 0.1)}</span></div>
                  </div>
                )}

                <Button size="lg" className="w-full font-bold">Reserve Now</Button>
                <p className="text-center text-sm text-gray-500">You won't be charged yet</p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
