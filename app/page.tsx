'use client'

import { useState, useEffect } from 'react'
import { Phone, Shield, Clock, Award, LogOut, User, Search, MapPin } from 'lucide-react'
import Link from 'next/link'
import NavBar from './components/NavBar'
import BookingBar from './components/BookingBar'
import ExperienceTiles from './components/ExperienceTiles'
import Image from 'next/image'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch current user from API (checks HTTP-only cookie)
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = async () => {
    try {
      // Call logout API to clear HTTP-only cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        // Clear user state
        setUser(null)
        setShowUserMenu(false)

        // Clear localStorage
        localStorage.removeItem('user')
        localStorage.removeItem('auth-token')

        // Force page reload to clear all state
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
      
      // Even if API fails, clear client-side data
      setUser(null)
      setShowUserMenu(false)
      localStorage.clear()
      window.location.href = '/'
    }
  }

  const branches = [
    { id: 'colombo', name: 'Sky Nest Colombo', location: 'Colombo City Center', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', features: ['Business District', 'Shopping Malls', 'Airport Access'], rooms: '150 Rooms' },
    { id: 'kandy', name: 'Sky Nest Kandy', location: 'Kandy Hills', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', features: ['Mountain Views', 'Cultural Sites', 'Tea Gardens'], rooms: '120 Rooms' },
    { id: 'galle', name: 'Sky Nest Galle', location: 'Galle Fort', image: 'https://images.unsplash.com/photo-1578774204375-51839d9fde3d?w=400', features: ['Beach Access', 'Historic Fort', 'Ocean Views'], rooms: '80 Rooms' },
  ]

  const roomCategories = [
    { type: 'Deluxe Room', price: 'From $120/night', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', amenities: ['King Size Bed', 'City View', 'Free WiFi', 'Mini Bar'], size: '35 sqm' },
    { type: 'Suite', price: 'From $200/night', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400', amenities: ['Separate Living Area', 'Ocean/Mountain View', 'Premium Amenities', 'Balcony'], size: '55 sqm' },
    { type: 'Presidential Suite', price: 'From $350/night', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', amenities: ['Private Terrace', 'Butler Service', 'Jacuzzi', 'Dining Area'], size: '85 sqm' },
  ]

  return (
    <div className={`overflow-clip min-h-screen bg-[#10141c] text-gray-300`}>
      {/* Enhanced NavBar with User Menu */}
      <nav className="fixed top-0 w-full z-50 bg-[#10141c]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/SNC.png" alt="Sky Nest Logo" width={150} height={40} className="brightness-110" />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#rooms" className="text-gray-300 hover:text-amber-400 font-medium transition">
              Rooms
            </a>
            <a href="#branches" className="text-gray-300 hover:text-amber-400 font-medium transition">
              Branches
            </a>
            <a href="#services" className="text-gray-300 hover:text-amber-400 font-medium transition">
              Services
            </a>
            <Link href="/guest/help" className="text-gray-300 hover:text-amber-400 font-medium transition">
              Help
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/auth/staff-login"
              className="text-gray-300 hover:text-amber-400 font-medium hidden md:block transition"
            >
              Staff Portal
            </Link>

            {isLoading ? (
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  </div>
                  <span className="font-medium hidden md:block">{user.firstName}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a1f2e] rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-semibold text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href={
                        user.role === 'GUEST'
                          ? '/guest/dashboard'
                          : user.role === 'STAFF'
                          ? '/staff/dashboard'
                          : '/admin/dashboard'
                      }
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      <span>Dashboard</span>
                    </Link>

                    {user.role === 'GUEST' && (
                      <>
                        <Link
                          href="/guest/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User size={16} />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/guest/my-bookings"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Search size={16} />
                          <span>My Bookings</span>
                        </Link>
                      </>
                    )}

                    <hr className="my-2 border-gray-700" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-amber-500 text-[#10141c] rounded-lg hover:bg-amber-400 transition font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-[81px] relative h-[700px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-bottom"
          style={{ backgroundImage: "url('/M2.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#10141c]/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-transparent to-transparent"></div>
        
        <div className="relative z-10 text-center text-white max-w-5xl px-6">
          <h5 className="text-5xl font-bold mb-[-20px] leading-tight">
            <span className="font-l font-light">Discover Paradise in</span>
          </h5>
          <h1 className="text-5xl md:text-9xl font-bold mb-5 leading-tight">
            <span className="font-s font-medium text-l block text-amber-400">Sri Lanka</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto font-l">
            Experience luxury and comfort at Sky Nest Hotels. <br />
            Your perfect getaway awaits.
          </p>
        </div>
      </div>
      
      {/* Booking Bar */}
      <BookingBar />
      
      {/* Why Choose Sky Nest */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Why Choose Sky Nest?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Experience world-class hospitality with modern amenities and personalized service.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Best Price Guarantee', desc: "Find a lower price? We'll match it and give you an extra 10% off." },
              { icon: Clock, title: 'Flexible Cancellation', desc: 'Free cancellation up to 5 days before check-in.' },
              { icon: Phone, title: '24/7 Support', desc: 'Round-the-clock customer service to assist you anytime.' },
              { icon: Award, title: 'Award Winning', desc: 'Recognized for excellence in hospitality and guest satisfaction.' }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-500 transition duration-300">
                  <item.icon className="w-10 h-10 text-amber-500 group-hover:text-[#10141c] transition duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Branches Section */}
      <section id="branches" className="py-20 px-6 bg-[#0c0f14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Locations</h2>
            <p className="text-xl text-gray-400">Three stunning destinations across beautiful Sri Lanka</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {branches.map((branch, index) => (
              <div
                key={index}
                className="bg-[#1a1f2e] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-[#10141c]">{branch.rooms}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-amber-500 mr-2" />
                    <span className="text-sm text-gray-400">{branch.location}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{branch.name}</h3>
                  <div className="space-y-2 mb-4">
                    {branch.features.map((feature, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                        <span className="text-gray-400 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/guest/search-rooms"
                    className="block w-full bg-amber-500 text-[#10141c] py-3 rounded-xl hover:bg-amber-400 transition font-medium text-center"
                  >
                    View Rooms
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Categories Section */}
      <section id="rooms" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Room Categories</h2>
            <p className="text-xl text-gray-400">Luxurious accommodations designed for every traveler</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {roomCategories.map((room, index) => (
              <div
                key={index}
                className="bg-[#1a1f2e] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.type}
                    className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-[#10141c]">{room.size}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{room.type}</h3>
                    <span className="text-amber-500 font-bold">{room.price}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {room.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                        <span className="text-gray-400 text-xs">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/guest/search-rooms"
                    className="block w-full bg-amber-500 text-[#10141c] py-3 rounded-xl hover:bg-amber-400 transition font-medium text-center"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Tiles */}
      <ExperienceTiles />

      {/* Footer */}
      <footer className="bg-[#0c0f14] text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Image src="/SNC.png" alt="Sky Nest Logo" width={200} height={50} className="mb-4 brightness-110" />
              <p className="mb-4">Experience luxury and comfort across Sri Lanka's most beautiful destinations.</p>
              <div className="flex space-x-4 items-center">
                <Phone className="w-5 h-5 text-amber-400" />
                <span>+94 11 234 5678</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/guest/search-rooms" className="hover:text-amber-400 transition">Book Now</Link></li>
                <li><a href="#rooms" className="hover:text-amber-400 transition">Rooms</a></li>
                <li><a href="#branches" className="hover:text-amber-400 transition">Branches</a></li>
                <li><Link href="/guest/help" className="hover:text-amber-400 transition">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Our Locations</h4>
              <ul className="space-y-2">
                <li>Colombo City Center</li>
                <li>Kandy Hills</li>
                <li>Galle Fort</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Portals</h4>
              <ul className="space-y-2">
                <li><Link href="./auth/login" className="hover:text-amber-400 transition">Guest Login</Link></li>
                <li><Link href="./auth/admin-login" className="hover:text-amber-400 transition">Admin Login</Link></li>
                <li><Link href="./auth/staff-login" className="hover:text-amber-400 transition">Staff Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; 2025 Sky Nest Hotel & Resort. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}