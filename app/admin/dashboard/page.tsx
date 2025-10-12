// app/admin/dashboard/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DollarSign, PieChart, Briefcase, Users, BarChart2, BadgeInfo, Settings
} from 'lucide-react'
import AdminSidebar from '@/app/components/AdminSidebar';

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>{children}</div>
);

const admin = { name: 'Rashmika Nawanjana', role: 'System Administrator' };
const overallStats = {
  totalRevenue: 458920, occupancyRate: 78, totalBookings: 1247, activeStaff: 145
};
const branchStats = [
  { id: 'colombo', name: 'Sky Nest Colombo', occupancy: 85 },
  { id: 'kandy', name: 'Sky Nest Kandy', occupancy: 72 },
  { id: 'galle', name: 'Sky Nest Galle', occupancy: 76 }
];
const recentActivities = [
  { id: 1, Icon: Briefcase, description: 'New booking - BK-2025-12456', time: '8:35 AM' },
  { id: 2, Icon: Users, description: 'Staff clock-in - EMP-052', time: '8:30 AM' },
  { id: 3, Icon: Settings, description: 'System backup completed', time: '8:00 AM' },
];
const pendingApprovals = [
  { id: 1, type: 'Refund', description: 'Request for BK-12340', branch: 'Galle' },
  { id: 2, type: 'Leave', description: 'Request from D. Silva', branch: 'Kandy' },
];

export default function AdminDashboardPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed}
      />
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'pl-24' : 'pl-72'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-l">Welcome back!</h1>
              <p className="text-gray-400">Here's a snapshot of your hotel operations today.</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white text-lg">{admin.name}</p>
              <p className="text-sm text-gray-500">{admin.role}</p>
            </div>
          </header>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="p-6 flex items-center justify-between">
                <div><p className="text-sm text-gray-400">Total Revenue</p><p className="text-2xl font-bold text-white">${overallStats.totalRevenue.toLocaleString()}</p></div>
                <div className="bg-green-500/10 p-3 rounded-lg"><DollarSign className="text-green-400" size={24}/></div>
              </div>
            </Card>
            <Card>
              <div className="p-6 flex items-center justify-between">
                <div><p className="text-sm text-gray-400">Occupancy Rate</p><p className="text-2xl font-bold text-white">{overallStats.occupancyRate}%</p></div>
                <div className="bg-blue-500/10 p-3 rounded-lg"><PieChart className="text-blue-400" size={24}/></div>
              </div>
            </Card>
            <Card>
              <div className="p-6 flex items-center justify-between">
                <div><p className="text-sm text-gray-400">Total Bookings</p><p className="text-2xl font-bold text-white">{overallStats.totalBookings}</p></div>
                <div className="bg-purple-500/10 p-3 rounded-lg"><Briefcase className="text-purple-400" size={24}/></div>
              </div>
            </Card>
            <Card>
              <div className="p-6 flex items-center justify-between">
                <div><p className="text-sm text-gray-400">Active Staff</p><p className="text-2xl font-bold text-white">{overallStats.activeStaff}</p></div>
                <div className="bg-amber-400/10 p-3 rounded-lg"><Users className="text-amber-400" size={24}/></div>
              </div>
            </Card>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Branch Overview */}
              <Card>
                <div className="p-6 flex justify-between items-center border-b border-gray-800">
                  <h2 className="text-xl font-bold text-white font-l">Branch Overview</h2>
                  <div className="flex space-x-2 bg-[#10141c] p-1 rounded-md">
                    <button onClick={() => setSelectedBranch('all')} className={`px-3 py-1 text-sm font-medium rounded ${selectedBranch === 'all' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>All</button>
                    <button onClick={() => setSelectedBranch('colombo')} className={`px-3 py-1 text-sm font-medium rounded ${selectedBranch === 'colombo' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>Colombo</button>
                    <button onClick={() => setSelectedBranch('kandy')} className={`px-3 py-1 text-sm font-medium rounded ${selectedBranch === 'kandy' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>Kandy</button>
                  </div>
                </div>
                <div className="p-6 grid md:grid-cols-3 gap-6">
                  {branchStats.map(branch => (
                    <div key={branch.id} className="bg-[#10141c] p-4 rounded-lg border border-gray-800">
                      <h3 className="font-semibold text-white mb-2">{branch.name.split(' ')[2]}</h3>
                      <p className="text-3xl font-bold text-white mb-1">{branch.occupancy}%</p>
                      <div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{width: `${branch.occupancy}%`}}></div></div>
                    </div>
                  ))}
                </div>
              </Card>
              {/* Recent Activities */}
              <Card>
                <div className="p-6 border-b border-gray-800"><h2 className="text-xl font-bold text-white font-l">Recent Activities</h2></div>
                <div className="p-6 space-y-3">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-md hover:bg-white/5">
                      <div className="flex items-center space-x-3"><activity.Icon size={16} className="text-gray-400"/>
                        <p className="font-medium text-sm text-white">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-8">
              {/* Pending Approvals */}
              <Card>
                <div className="p-6 flex justify-between items-center border-b border-gray-800">
                  <h2 className="text-xl font-bold text-white font-l">Pending Approvals</h2>
                  <span className="bg-amber-400/10 text-amber-400 text-sm font-bold px-2 py-1 rounded-full">{pendingApprovals.length}</span>
                </div>
                <div className="p-6 space-y-4">
                  {pendingApprovals.map(approval => (
                    <div key={approval.id}>
                      <p className="text-sm font-semibold text-white capitalize mb-1">{approval.type}</p>
                      <p className="text-sm text-gray-400 mb-3">{approval.description}</p>
                      <div className="flex space-x-3">
                        <button className="flex-1 py-2.5 text-sm rounded-md bg-amber-400 text-black hover:bg-amber-500 font-semibold">Approve</button>
                        <button className="flex-1 py-2.5 text-sm rounded-md bg-gray-700/50 text-gray-300 hover:bg-gray-700 font-semibold">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              {/* Quick Actions */}
              <Card>
                <div className="p-6 border-b border-gray-800"><h2 className="text-xl font-bold text-white font-l">Quick Actions</h2></div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <Link href="/admin/reports" className="flex flex-col items-center justify-center p-4 bg-[#10141c] rounded-lg border border-gray-800 hover:border-amber-400 hover:text-amber-400">
                    <BarChart2 size={24} className="mb-2"/><span className="text-sm font-semibold">Reports</span>
                  </Link>
                  <Link href="/admin/alerts" className="flex flex-col items-center justify-center p-4 bg-[#10141c] rounded-lg border border-gray-800 hover:border-amber-400 hover:text-amber-400">
                    <BadgeInfo size={24} className="mb-2"/><span className="text-sm font-semibold">Alerts</span>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

