// app/admin/bookings/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import AdminSidebar from '@/app/components/AdminSidebar'
import { Search, Filter, ChevronDown } from 'lucide-react'
import React from 'react'
import gsap from 'gsap'

// Mock Data
const bookings = [
  { id: 'BK-12465', guest: 'Alice Cooper', email: 'alice.c@example.com', phone: '+1 234 567 890', room: '410', branch: 'Colombo', amount: 976, checkIn: '2025-10-15', checkOut: '2025-10-18', status: 'Confirmed' },
  { id: 'BK-12464', guest: 'Robert Taylor', email: 'rob.t@example.com', phone: '+44 20 7946 0958', room: '506', branch: 'Kandy', amount: 840, checkIn: '2025-10-12', checkOut: '2025-10-15', status: 'Confirmed' },
  { id: 'BK-12463', guest: 'Lisa Anderson', email: 'lisa.a@example.com', phone: '+61 2 9953 2000', room: '312', branch: 'Galle', amount: 732, checkIn: '2025-10-02', checkOut: '2025-10-05', status: 'Checked-in' },
  { id: 'BK-12462', guest: 'James Wilson', email: 'james.w@example.com', phone: '+1 888 452 1505', room: '208', branch: 'Colombo', amount: 658, checkIn: '2025-09-28', checkOut: '2025-10-01', status: 'Completed' },
  { id: 'BK-12461', guest: 'Emma Brown', email: 'emma.b@example.com', phone: '+49 30 2093 4055', room: '501', branch: 'Galle', amount: 1400, checkIn: '2025-09-25', checkOut: '2025-10-02', status: 'Cancelled' },
];

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>{children}</div>
);

const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-500/10 text-blue-400';
      case 'Checked-in': return 'bg-green-500/10 text-green-400';
      case 'Completed': return 'bg-gray-500/10 text-gray-400';
      case 'Cancelled': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
};

const BookingRow = ({ booking }: { booking: typeof bookings[0] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const detailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isExpanded) {
            gsap.fromTo(detailsRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' });
        } else {
            gsap.to(detailsRef.current, { height: 0, opacity: 0, duration: 0.2, ease: 'power2.in' });
        }
    }, [isExpanded]);
    
    return (
        <>
            <tr onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-white/5 transition-colors cursor-pointer">
                <td className="px-6 py-4 text-sm font-medium text-white">{booking.id}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{booking.guest}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{booking.branch}</td>
                <td className="px-6 py-4 text-sm font-semibold text-green-400">${booking.amount}</td>
                <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>{booking.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </td>
            </tr>
            <tr>
                <td colSpan={6} className="p-0">
                    <div ref={detailsRef} className="bg-[#10141c] overflow-hidden" style={{ height: 0, opacity: 0 }}>
                        <div className="p-6 grid grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Guest Information</h4>
                                <p><strong>Email:</strong> {booking.email}</p>
                                <p><strong>Phone:</strong> {booking.phone}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Stay Details</h4>
                                <p><strong>Check-in:</strong> {booking.checkIn}</p>
                                <p><strong>Check-out:</strong> {booking.checkOut}</p>
                            </div>
                            <div className="flex items-center justify-end space-x-3">
                                <button className="px-4 py-2 text-sm font-semibold bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30">Cancel Booking</button>
                                <button className="px-4 py-2 text-sm font-semibold bg-amber-400/20 text-amber-300 rounded-md hover:bg-amber-400/30">Issue Refund</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </>
    );
}

export default function BookingsPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'pl-24' : 'pl-72'}`}>
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white font-l">Manage Bookings</h1>
            <p className="text-gray-400">View, search, and manage all guest reservations.</p>
          </header>

          <Card>
            <div className="p-6 flex justify-between items-center border-b border-gray-800">
              <div className="relative w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Search by guest, ID, or room..." className="w-full bg-[#10141c] border border-gray-700 rounded-md pl-10 pr-4 py-2 focus:ring-amber-400 focus:border-amber-400" />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-[#10141c] border border-gray-700 rounded-md hover:bg-gray-800">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Booking ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Guest</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Branch</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {bookings.map(booking => <BookingRow key={booking.id} booking={booking} />)}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

