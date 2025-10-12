// app/staff/dashboard/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import StaffNavbar from '@/app/components/StaffNavbar' // Import the new navbar
import { Key, DoorOpen, BedDouble, Bell, AlertCircle } from 'lucide-react'

// Mock Data (can be easily replaced with API calls)
const staffMember = {
  name: 'Sarath Kumar',
  employeeId: 'EMP-2025-052',
  role: 'Front Desk Supervisor',
  branch: 'Sky Nest Kandy',
  shift: 'Morning Shift (6:00 AM - 2:00 PM)'
};
const stats = {
  checkInsToday: 8,
  checkOutsToday: 6,
  currentOccupancy: 45,
  totalRooms: 60,
  pendingRequests: 12,
};
const pendingTasks = [
  { id: 1, type: 'check-in', description: 'Guest: Alice Cooper - Room 410', time: '09:00 AM', priority: 'high' },
  { id: 2, type: 'service', description: 'Extra towels requested - Room 305', priority: 'medium' },
  { id: 3, type: 'maintenance', description: 'AC unit not cooling - Room 512', priority: 'high' },
  { id: 4, type: 'check-out', description: 'Guest: Bob Martin - Room 203', time: '10:00 AM', priority: 'normal' },
];

// Reusable Themed Components
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-6 border-b border-gray-800 ${className}`}>{children}</div>;
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-6 ${className}`}>{children}</div>;

const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'text-red-400';
    if (priority === 'medium') return 'text-yellow-400';
    return 'text-blue-400';
};

export default function StaffDashboardPage() {
  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300">
      <StaffNavbar staffMember={staffMember} />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6 mb-8 text-white">
            <h1 className="text-2xl font-bold mb-1 text-amber-300 font-l">Good Morning, {staffMember.name.split(' ')[0]}!</h1>
            <p className="text-amber-100/80">Your current assignment: {staffMember.shift} at {staffMember.branch}.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2"><p className="text-sm text-gray-400">Check-ins Today</p><Key size={18} className="text-green-400"/></div>
                    <p className="text-3xl font-bold text-white">{stats.checkInsToday}</p>
                </CardContent>
            </Card>
             <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2"><p className="text-sm text-gray-400">Check-outs Today</p><DoorOpen size={18} className="text-red-400"/></div>
                    <p className="text-3xl font-bold text-white">{stats.checkOutsToday}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2"><p className="text-sm text-gray-400">Occupancy</p><BedDouble size={18} className="text-blue-400"/></div>
                    <p className="text-3xl font-bold text-white">{Math.round((stats.currentOccupancy / stats.totalRooms) * 100)}%</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2"><p className="text-sm text-gray-400">Pending Requests</p><Bell size={18} className="text-yellow-400"/></div>
                    <p className="text-3xl font-bold text-white">{stats.pendingRequests}</p>
                </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pending Tasks */}
            <Card>
              <CardHeader><h2 className="text-xl font-bold text-white font-l">Your Priority Tasks</h2></CardHeader>
              <CardContent className="space-y-4">
                {pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-[#10141c] rounded-lg border border-gray-800">
                    <div className="flex items-center space-x-3">
                       <div className={`p-1.5 rounded-full ${getPriorityColor(task.priority)}/20`}>
                            <AlertCircle size={16} className={getPriorityColor(task.priority)} />
                       </div>
                       <div>
                           <p className="font-medium text-white text-sm">{task.description}</p>
                           {task.time && <p className="text-xs text-gray-500">Scheduled: {task.time}</p>}
                       </div>
                    </div>
                    <button className="px-3 py-1 text-xs font-semibold bg-amber-400 text-black rounded-md hover:bg-amber-500">Handle</button>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader><h2 className="text-xl font-bold text-white font-l">Quick Actions</h2></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Link href="/staff/check-in" className="flex flex-col items-center justify-center p-4 bg-[#10141c] rounded-lg border border-gray-800 hover:border-amber-400 hover:text-amber-400 transition-colors">
                  <Key size={24} className="mb-2"/>
                  <span className="text-sm font-semibold">Check-in Guest</span>
                </Link>
                <Link href="/staff/check-out" className="flex flex-col items-center justify-center p-4 bg-[#10141c] rounded-lg border border-gray-800 hover:border-amber-400 hover:text-amber-400 transition-colors">
                  <DoorOpen size={24} className="mb-2"/>
                  <span className="text-sm font-semibold">Check-out Guest</span>
                </Link>
                <Link href="/staff/rooms" className="flex flex-col items-center justify-center p-4 bg-[#10141c] rounded-lg border border-gray-800 hover:border-amber-400 hover:text-amber-400 transition-colors">
                  <BedDouble size={24} className="mb-2"/>
                  <span className="text-sm font-semibold">Room Status</span>
                </Link>
                 <Link href="/staff/services" className="flex flex-col items-center justify-center p-4 bg-[#10141c] rounded-lg border border-gray-800 hover:border-amber-400 hover:text-amber-400 transition-colors">
                  <Bell size={24} className="mb-2"/>
                  <span className="text-sm font-semibold">Service Requests</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

