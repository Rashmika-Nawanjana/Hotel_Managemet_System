// app/guest/search-rooms/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import GuestNavbar from '@/app/components/GuestNavbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BedDouble, Users, Star, ArrowRight } from 'lucide-react'

// Mock Data
const availableRooms = [
    { id: 1, name: 'Deluxe Room, City View', branch: 'Sky Nest Colombo', price: 120, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', rating: 4.7, amenities: ['Free WiFi', 'Mini Bar'], capacity: 2, beds: 'King Size Bed' },
    { id: 2, name: 'Ocean View Suite', branch: 'Sky Nest Galle', price: 200, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400', rating: 4.9, amenities: ['Balcony', 'Living Area'], capacity: 3, beds: 'King Size Bed' },
    { id: 3, name: 'Presidential Suite', branch: 'Sky Nest Kandy', price: 350, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', rating: 5.0, amenities: ['Private Terrace', 'Jacuzzi'], capacity: 4, beds: 'King Size Bed + Sofa Bed' },
];

export default function SearchRoomsPage() {
  const [priceRange, setPriceRange] = useState([50, 500])

  return (
    <div className="min-h-screen bg-gradient-to-t from-amber-700/30 to-amber-50 text-gray-800">
      <GuestNavbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28">
              <Card className="shadow-lg bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 font-l">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="text-sm font-semibold text-gray-700 block mb-2">Price Range</Label>
                        <Slider defaultValue={[50, 500]} max={1000} step={10} onValueChange={(value) => setPriceRange(value)} />
                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>
                     <div>
                        <Label className="text-sm font-semibold text-gray-700 block mb-2">Amenities</Label>
                        <div className="space-y-2">
                           <div className="flex items-center space-x-2"><Checkbox id="pool"/><Label htmlFor="pool" className="text-sm">Swimming Pool</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="spa"/><Label htmlFor="spa" className="text-sm">Spa & Wellness</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="gym"/><Label htmlFor="gym" className="text-sm">Fitness Center</Label></div>
                        </div>
                    </div>
                    <div>
                      <Button className="w-full font-bold">Apply Filters</Button>
                    </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Room Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-l">Available Rooms</h1>
                <p className="text-gray-600">{availableRooms.length} rooms found</p>
              </div>
              <Select>
                <SelectTrigger className="w-[180px] bg-white/50 border-gray-300">
                    <SelectValue placeholder="Sort by: Recommended" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-6">
              {availableRooms.map(room => (
                <Card key={room.id} className="shadow-lg bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden group">
                   <div className="flex">
                      <div className="w-1/3 relative overflow-hidden">
                         <Image src={room.image} alt={room.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                      </div>
                      <div className="w-2/3">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-900">{room.name}</CardTitle>
                                    <CardDescription>{room.branch}</CardDescription>
                                </div>
                                <div className="flex items-center space-x-1 text-amber-600 font-bold">
                                    <Star size={16}/><span>{room.rating}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-600 flex space-x-4 mb-4">
                                <span className="flex items-center"><Users size={14} className="mr-1.5"/> Up to {room.capacity} guests</span>
                                <span className="flex items-center"><BedDouble size={14} className="mr-1.5"/> {room.beds}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                               {room.amenities.map(amenity => (
                                   <span key={amenity} className="px-2 py-1 bg-amber-100/50 text-amber-800 text-xs rounded-full">{amenity}</span>
                               ))}
                            </div>
                            <div className="flex items-end justify-between">
                               <div>
                                   <p className="text-2xl font-bold text-gray-900">${room.price}<span className="text-sm font-normal text-gray-600">/night</span></p>
                               </div>
                               <Link href={`/guest/room-details/${room.id}`} passHref>
                                  <Button className="font-bold group-hover:bg-amber-600">
                                      View Details <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/>
                                  </Button>
                                </Link>
                            </div>
                        </CardContent>
                      </div>
                   </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

