"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Users,
  Star,
  Wifi,
  Car,
  Coffee,
  Waves,
  MapPin,
  Phone,
  Mail,
  Shield,
  Clock,
  Award,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [branch, setBranch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth-token");
    setUser(null);
    setShowUserMenu(false);
    router.push("/");
  };

  const branches = [
    { id: "colombo", name: "Colombo", location: "Colombo City Center" },
    { id: "kandy", name: "Kandy", location: "Kandy Hills" },
    { id: "galle", name: "Galle", location: "Galle Fort" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">SN</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-800">Sky Nest</span>
            <p className="text-xs text-gray-500 -mt-1">Hotel & Resort</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#rooms"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Rooms
          </a>
          <a
            href="#services"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Services
          </a>
          <a
            href="#branches"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Branches
          </a>
          <a
            href="#about"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            About
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/auth/staff-login"
            className="text-gray-700 hover:text-gray-900 font-medium hidden md:block"
          >
            Staff Portal
          </Link>

          {user ? (
            // Logged in user menu
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </span>
                </div>
                <span className="font-medium hidden md:block">
                  {user.firstName}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href={
                      user.role === "GUEST"
                        ? "/guest/dashboard"
                        : user.role === "STAFF"
                        ? "/staff/dashboard"
                        : "/admin/dashboard"
                    }
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} />
                    <span>Dashboard</span>
                  </Link>

                  {user.role === "GUEST" && (
                    <>
                      <Link
                        href="/guest/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/guest/my-bookings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Calendar size={16} />
                        <span>My Bookings</span>
                      </Link>
                    </>
                  )}

                  <hr className="my-2" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - show sign in/up buttons
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[650px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-5xl px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Discover Paradise in
            <span className="block text-blue-400">Sri Lanka</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Experience luxury and comfort at Sky Nest Hotels across Colombo,
            Kandy, and Galle. Your perfect getaway awaits.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative -mt-20 z-20 max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-2xl border p-4">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="flex-1 px-4 py-3">
              <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-sm text-gray-700 border-none outline-none bg-transparent"
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

            <div className="flex-1 px-4 py-3">
              <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min="2025-10-01"
                className="w-full text-sm text-gray-700 border-none outline-none bg-transparent"
              />
            </div>

            <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

            <div className="flex-1 px-4 py-3">
              <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || "2025-10-01"}
                className="w-full text-sm text-gray-700 border-none outline-none bg-transparent"
              />
            </div>

            <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

            <div className="flex-1 px-4 py-3">
              <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full text-sm text-gray-700 border-none outline-none bg-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} guest{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/guest/search-rooms"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center space-x-2 transition font-medium"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Why Choose Sky Nest */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why choose Sky Nest?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience world-class hospitality with modern amenities and
              personalized service
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition duration-300">
                <Shield className="w-10 h-10 text-blue-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Best Price Guarantee
              </h3>
              <p className="text-gray-600">
                Find a lower price? We'll match it and give you an extra 10% off
                your stay.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition duration-300">
                <Clock className="w-10 h-10 text-green-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Flexible Cancellation
              </h3>
              <p className="text-gray-600">
                Free cancellation up to 5 days before check-in. Flexible booking
                policies.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition duration-300">
                <Phone className="w-10 h-10 text-purple-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Round-the-clock customer service to assist you anytime,
                anywhere.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition duration-300">
                <Award className="w-10 h-10 text-orange-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Award Winning
              </h3>
              <p className="text-gray-600">
                Recognized for excellence in hospitality and guest satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Branches */}
      <section id="branches" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Locations
            </h2>
            <p className="text-xl text-gray-600">
              Three stunning destinations across beautiful Sri Lanka
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sky Nest Colombo",
                location: "Colombo City Center",
                image:
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
                features: [
                  "Business District",
                  "Shopping Malls",
                  "Airport Access",
                ],
                rooms: "150 Rooms",
              },
              {
                name: "Sky Nest Kandy",
                location: "Kandy Hills",
                image:
                  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
                features: ["Mountain Views", "Cultural Sites", "Tea Gardens"],
                rooms: "120 Rooms",
              },
              {
                name: "Sky Nest Galle",
                location: "Galle Fort",
                image:
                  "https://images.unsplash.com/photo-1578774204375-51839d9fde3d?w=400",
                features: ["Beach Access", "Historic Fort", "Ocean Views"],
                rooms: "80 Rooms",
              },
            ].map((branch, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-800">
                      {branch.rooms}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">
                      {branch.location}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {branch.name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    {branch.features.map((feature, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium">
                    View Rooms
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Categories */}
      <section id="rooms" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Room Categories
            </h2>
            <p className="text-xl text-gray-600">
              Luxurious accommodations designed for every traveler
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                type: "Deluxe Room",
                price: "From $120/night",
                image:
                  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
                amenities: [
                  "King Size Bed",
                  "City View",
                  "Free WiFi",
                  "Mini Bar",
                ],
                size: "35 sqm",
              },
              {
                type: "Suite",
                price: "From $200/night",
                image:
                  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400",
                amenities: [
                  "Separate Living Area",
                  "Ocean/Mountain View",
                  "Premium Amenities",
                  "Balcony",
                ],
                size: "55 sqm",
              },
              {
                type: "Presidential Suite",
                price: "From $350/night",
                image:
                  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
                amenities: [
                  "Private Terrace",
                  "Butler Service",
                  "Jacuzzi",
                  "Dining Area",
                ],
                size: "85 sqm",
              },
            ].map((room, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.type}
                    className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-800">
                      {room.size}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {room.type}
                    </h3>
                    <span className="text-blue-600 font-bold">
                      {room.price}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {room.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        <span className="text-gray-600 text-xs">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition font-medium">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Premium Services
            </h2>
            <p className="text-xl text-gray-600">
              Enhance your stay with our world-class amenities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Coffee,
                name: "Room Service",
                desc: "24/7 dining service",
              },
              {
                icon: Waves,
                name: "Spa & Wellness",
                desc: "Rejuvenating treatments",
              },
              {
                icon: Car,
                name: "Airport Transfer",
                desc: "Complimentary shuttle",
              },
              {
                icon: Wifi,
                name: "High-Speed WiFi",
                desc: "Free internet access",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center"
              >
                <service.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SN</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">Sky Nest</span>
                  <p className="text-xs text-gray-400 -mt-1">Hotel & Resort</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Experience luxury and comfort across Sri Lanka's most beautiful
                destinations.
              </p>
              <div className="flex space-x-4">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">+94 11 234 5678</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/guest/search-rooms"
                    className="hover:text-white transition"
                  >
                    Book Now
                  </Link>
                </li>
                <li>
                  <a href="#rooms" className="hover:text-white transition">
                    Rooms
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition">
                    Services
                  </a>
                </li>
                <li>
                  <Link
                    href="/guest/help"
                    className="hover:text-white transition"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Our Locations</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Colombo City Center</li>
                <li>Kandy Hills</li>
                <li>Galle Fort</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Portals</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/auth/login"
                    className="hover:text-white transition"
                  >
                    Guest Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/staff-login"
                    className="hover:text-white transition"
                  >
                    Staff Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/admin-login"
                    className="hover:text-white transition"
                  >
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Sky Nest Hotel & Resort. All rights reserved. |
              Designed for excellence in hospitality.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
