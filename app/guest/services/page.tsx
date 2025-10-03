'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GuestServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Services', icon: '🛎️' },
    { id: 'dining', name: 'Dining', icon: '🍽️' },
    { id: 'spa', name: 'Spa & Wellness', icon: '💆' },
    { id: 'recreation', name: 'Recreation', icon: '🏊' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'other', name: 'Other Services', icon: '✨' }
  ]

  const services = [
    {
      id: 1,
      name: 'Room Service',
      category: 'dining',
      description: '24/7 in-room dining service with extensive menu options',
      price: 'From $15',
      availability: 'Available 24/7',
      icon: '🍴',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      features: ['24/7 Available', 'Full Menu', 'Fast Delivery'],
      popular: true
    },
    {
      id: 2,
      name: 'Spa Treatment',
      category: 'spa',
      description: 'Relaxing massages, facials, and wellness treatments',
      price: 'From $80',
      availability: '9:00 AM - 9:00 PM',
      icon: '💆',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
      features: ['Professional Staff', 'Premium Products', 'Private Rooms'],
      popular: true
    },
    {
      id: 3,
      name: 'Airport Transfer',
      category: 'transport',
      description: 'Comfortable airport pickup and drop-off service',
      price: '$50 per trip',
      availability: 'On Request',
      icon: '✈️',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
      features: ['Professional Driver', 'Luxury Vehicle', 'Meet & Greet'],
      popular: true
    },
    {
      id: 4,
      name: 'Swimming Pool',
      category: 'recreation',
      description: 'Infinity pool with ocean views and poolside service',
      price: 'Complimentary',
      availability: '6:00 AM - 10:00 PM',
      icon: '🏊',
      image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400',
      features: ['Infinity Pool', 'Poolside Bar', 'Towel Service']
    },
    {
      id: 5,
      name: 'Fitness Center',
      category: 'recreation',
      description: 'Fully-equipped gym with modern fitness equipment',
      price: 'Complimentary',
      availability: '24/7',
      icon: '💪',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      features: ['24/7 Access', 'Modern Equipment', 'Personal Trainer Available']
    },
    {
      id: 6,
      name: 'Fine Dining Restaurant',
      category: 'dining',
      description: 'Gourmet cuisine with local and international specialties',
      price: 'From $40',
      availability: '6:00 PM - 11:00 PM',
      icon: '🍷',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      features: ['Ocean View', 'Chef Specials', 'Wine Pairing']
    },
    {
      id: 7,
      name: 'Car Rental',
      category: 'transport',
      description: 'Rent a vehicle to explore Sri Lanka at your own pace',
      price: 'From $60/day',
      availability: 'On Request',
      icon: '🚙',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      features: ['Various Models', 'GPS Included', 'Insurance Coverage']
    },
    {
      id: 8,
      name: 'Laundry Service',
      category: 'other',
      description: 'Professional laundry and dry cleaning service',
      price: 'From $10',
      availability: 'Same-day service',
      icon: '👔',
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
      features: ['Same Day', 'Express Service', 'Eco-Friendly']
    },
    {
      id: 9,
      name: 'Business Center',
      category: 'business',
      description: 'Meeting rooms, printing, and office services',
      price: 'From $25/hour',
      availability: '8:00 AM - 8:00 PM',
      icon: '💼',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      features: ['High-Speed WiFi', 'Printing Services', 'Private Rooms']
    },
    {
      id: 10,
      name: 'Yoga Classes',
      category: 'spa',
      description: 'Morning and evening yoga sessions with certified instructors',
      price: '$30 per session',
      availability: '7:00 AM & 6:00 PM',
      icon: '🧘',
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
      features: ['Certified Instructor', 'All Levels', 'Beach or Indoor']
    },
    {
      id: 11,
      name: 'Tour Packages',
      category: 'recreation',
      description: 'Guided tours to local attractions and cultural sites',
      price: 'From $100',
      availability: 'Daily',
      icon: '🗺️',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
      features: ['Expert Guides', 'Transportation', 'Lunch Included']
    },
    {
      id: 12,
      name: 'Babysitting Service',
      category: 'other',
      description: 'Professional childcare service for your peace of mind',
      price: '$20/hour',
      availability: 'On Request',
      icon: '👶',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
      features: ['Certified Staff', 'Activities Included', 'Flexible Hours']
    }
  ]

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/guest/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Sky Nest</span>
                <p className="text-xs text-gray-500 -mt-1">Services & Amenities</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/guest/services/my-requests" className="text-gray-600 hover:text-blue-600 transition">
                My Requests
              </Link>
              <Link href="/guest/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hotel Services & Amenities</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhance your stay with our premium services. From dining to wellness, we're here to make your experience unforgettable.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredServices.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 group">
              <div className="relative overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
                />
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ Popular
                  </div>
                )}
                <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                  {service.icon}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{service.description}</p>

                <div className="space-y-2 mb-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="font-bold text-gray-900">{service.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Availability</span>
                    <span className="text-sm text-blue-600 font-medium">{service.availability}</span>
                  </div>
                </div>

                <Link
                  href={`/guest/services/request?serviceId=${service.id}`}
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-center"
                >
                  Request Service
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">Try selecting a different category</p>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View All Services
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">ℹ️</span>
              How to Request Services
            </h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li>• Browse our service catalog and select what you need</li>
              <li>• Fill out the request form with your preferences</li>
              <li>• Receive confirmation and updates via email/SMS</li>
              <li>• Services will be delivered to your room or scheduled location</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Service Tips
            </h3>
            <ul className="space-y-2 text-sm text-green-900">
              <li>• Book spa treatments in advance for preferred time slots</li>
              <li>• Room service is complimentary for suite guests</li>
              <li>• Airport transfers require 24-hour advance booking</li>
              <li>• Contact concierge for custom service arrangements</li>
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Need Assistance?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/guest/services/my-requests" className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
              <span className="text-4xl mb-3 block">📋</span>
              <h4 className="font-semibold text-gray-900 mb-2">My Requests</h4>
              <p className="text-sm text-gray-600">Track your service requests</p>
            </Link>

            <Link href="/guest/help/contact" className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
              <span className="text-4xl mb-3 block">💬</span>
              <h4 className="font-semibold text-gray-900 mb-2">Contact Concierge</h4>
              <p className="text-sm text-gray-600">24/7 support available</p>
            </Link>

            <Link href="/guest/help" className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
              <span className="text-4xl mb-3 block">❓</span>
              <h4 className="font-semibold text-gray-900 mb-2">Help Center</h4>
              <p className="text-sm text-gray-600">FAQs and support</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}