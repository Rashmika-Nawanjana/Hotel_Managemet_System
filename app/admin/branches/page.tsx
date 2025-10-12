// app/admin/branches/page.tsx
'use client'

import { useState } from 'react'
import AdminSidebar from '@/app/components/AdminSidebar'
import Image from 'next/image';
import Link from 'next/link';
import { Building, PlusCircle } from 'lucide-react';

// Mock Data
const branches = [
    { id: 'colombo', name: 'Sky Nest Colombo', location: 'Colombo City Center', occupancyRate: 85, revenue: 185340, manager: 'John Anderson', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
    { id: 'kandy', name: 'Sky Nest Kandy', location: 'Kandy Hills', occupancyRate: 72, revenue: 142680, manager: 'Sarah Kumar', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400' },
    { id: 'galle', name: 'Sky Nest Galle', location: 'Galle Fort', occupancyRate: 76, revenue: 130900, manager: 'David Silva', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' }
];

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>{children}</div>
);

const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
};

export default function AdminBranchesPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'pl-24' : 'pl-72'}`}>
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-l">Branch Management</h1>
              <p className="text-gray-400">Manage all Sky Nest hotel branches and their operations.</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-amber-400 text-black font-semibold rounded-md hover:bg-amber-500 transition-colors">
              <PlusCircle size={16} />
              <span>Add New Branch</span>
            </button>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            {branches.map(branch => (
              <Card key={branch.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image src={branch.image} alt={branch.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                    <h3 className="text-xl font-bold text-white">{branch.name}</h3>
                    <p className="text-sm text-gray-300">{branch.location}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-[#10141c] rounded-lg">
                      <p className={`text-2xl font-bold ${getOccupancyColor(branch.occupancyRate)}`}>{branch.occupancyRate}%</p>
                      <p className="text-xs text-gray-500 mt-1">Occupancy</p>
                    </div>
                    <div className="text-center p-3 bg-[#10141c] rounded-lg">
                      <p className="text-2xl font-bold text-green-400">${(branch.revenue / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-500 mt-1">Revenue</p>
                    </div>
                  </div>
                   <div className="text-sm space-y-2">
                      <p><strong className="text-gray-400">Manager:</strong> {branch.manager}</p>
                  </div>
                  <Link href={`/admin/branches/${branch.id}`} className="block w-full mt-4 text-center py-2 bg-amber-400/10 text-amber-300 rounded-md hover:bg-amber-400/20 transition font-medium">
                    View Details
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
