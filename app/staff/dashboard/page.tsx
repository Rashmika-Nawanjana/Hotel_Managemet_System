"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface StaffUser {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  staffRole?: 'MANAGEMENT' | 'FRONT_DESK';
  branchId?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  permissions?: string[];
  branch?: {
    name?: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

interface DashboardStats {
  // Essential metrics
  availableRooms: number;
  checkedInGuests: number;
  totalRooms: number;
  
  // Daily activity
  checkInsToday: number;
  checkOutsToday: number;
  
  // Management only
  totalRevenue?: number;
  averageOccupancy?: number;
}

export default function StaffDashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch staff user data and dashboard stats
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff user data
        const userResponse = await fetch('/api/auth/staff-me');
        if (!userResponse.ok) {
          throw new Error('Failed to fetch staff user data');
        }
        const userData = await userResponse.json();
        
        if (userData.user.role !== 'STAFF') {
          router.push('/auth/staff-login');
          return;
        }
        
        setStaffUser(userData.user);
        
        // Fetch dashboard stats (API will automatically filter by staff's assigned branch)
        const statsResponse = await fetch('/api/staff/dashboard-stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }
        
      } catch (err) {
        console.error('Error fetching staff data:', err);
        setError('Failed to load dashboard data');
        router.push('/auth/staff-login');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !staffUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load staff data'}</p>
          <Link href="/auth/staff-login" className="text-blue-600 hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string | undefined, lastName: string | undefined) => {
    if (!firstName || !lastName) return '??';
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  const isManagement = staffUser.staffRole === 'MANAGEMENT';
  const firstName = staffUser.firstName || staffUser.firstname || '';
  const lastName = staffUser.lastName || staffUser.lastname || '';
  const staffInitials = getInitials(firstName, lastName);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#FFA500] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">{staffInitials}</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">
                  Sky Nest Staff Portal
                </span>
                <p className="text-xs text-gray-500 -mt-1">
                  {staffUser.department} • {staffUser.position}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  📍 {staffUser.branch?.name || 'Branch Assignment Pending'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Time</p>
                <p className="font-semibold text-gray-900">{currentTime}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{firstName} {lastName}</p>
                <p className="font-semibold text-gray-900">
                  {isManagement ? 'Management' : 'Front Desk'} • {staffUser.employeeId || 'N/A'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className={`rounded-2xl p-8 mb-8 text-white ${isManagement ? 'bg-gradient-to-r from-purple-600 to-purple-800' : 'bg-gradient-to-r from-blue-600 to-blue-800'}`}>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {firstName || 'Staff'}!
          </h1>
          <p className="text-blue-100 mb-1">{staffUser.department || 'N/A'} • {staffUser.position || 'N/A'}</p>
          <p className="text-blue-100 mb-1">Employee ID: {staffUser.employeeId || 'N/A'}</p>
          <p className="text-blue-100 font-medium">
            📍 {staffUser.branch?.name || 'Branch Assignment Pending'}
            {staffUser.branch?.location && ` • ${staffUser.branch.location}`}
          </p>
          {isManagement && (
            <p className="text-blue-100 mt-2">🔒 Management Access - All Branches</p>
          )}
        </div>



        {/* Management-specific stats */}
        {isManagement && stats && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <span className="text-sm text-gray-600">Today</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                ${stats.totalRevenue?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="text-sm text-gray-600">Average</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats.averageOccupancy || 0}%
              </p>
              <p className="text-sm text-gray-600">Monthly Occupancy</p>
            </div>
          </div>
        )}

        {/* Essential Staff Metrics */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Overview</h3>
          <p className="text-sm text-gray-600 mb-4">
            Current status • Total rooms: {stats?.totalRooms || 0}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Rooms</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.availableRooms || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Ready for check-in</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏨</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Checked-in Guests</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.checkedInGuests || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Currently in rooms</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">Check-ins Today</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.checkInsToday || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Guests arriving today</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 mb-1">Check-outs Today</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.checkOutsToday || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Guests leaving today</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/staff/check-in"
                  className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-center"
                >
                  <span className="text-2xl mb-2 block">🔑</span>
                  <span className="font-medium text-green-900">Check-in Guest</span>
                </Link>
                <Link
                  href="/staff/check-out"
                  className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-center"
                >
                  <span className="text-2xl mb-2 block">🚪</span>
                  <span className="font-medium text-blue-900">Check-out Guest</span>
                </Link>
                <Link
                  href="/staff/rooms"
                  className="block p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition text-center"
                >
                  <span className="text-2xl mb-2 block">🏨</span>
                  <span className="font-medium text-indigo-900">Room Management</span>
                </Link>
                <Link
                  href="/staff/manual-booking"
                  className="block p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition text-center"
                >
                  <span className="text-2xl mb-2 block">📝</span>
                  <span className="font-medium text-emerald-900">Manual Booking</span>
                </Link>
                <Link
                  href="/staff/bookings"
                  className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition text-center"
                >
                  <span className="text-2xl mb-2 block">📋</span>
                  <span className="font-medium text-purple-900">Manage Bookings</span>
                </Link>
                <Link
                  href="/staff/services"
                  className="block p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-center"
                >
                  <span className="text-2xl mb-2 block">🛎️</span>
                  <span className="font-medium text-orange-900">Service Requests</span>
                </Link>
                {isManagement && (
                  <>
                    <Link
                      href="/staff/reports"
                      className="block p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition text-center"
                    >
                      <span className="text-2xl mb-2 block">📊</span>
                      <span className="font-medium text-indigo-900">Reports & Analytics</span>
                    </Link>
                    <Link
                      href="/staff/management"
                      className="block p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition text-center"
                    >
                      <span className="text-2xl mb-2 block">👥</span>
                      <span className="font-medium text-red-900">Staff Management</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Branch Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Branch Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-medium text-blue-600">
                    {staffUser.branch?.name || 'N/A'}
                  </span>
                </div>
                {staffUser.branch?.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{staffUser.branch.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{staffUser.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">{staffUser.position || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Access Level:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${isManagement ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {isManagement ? 'Management' : 'Front Desk'}
                  </span>
                </div>
                {!isManagement && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch Access:</span>
                    <span className="font-medium">Limited to {staffUser.branch?.name || 'Assigned Branch'}</span>
                  </div>
                )}
                {isManagement && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch Access:</span>
                    <span className="font-medium text-purple-600">All Branches</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Recent Activities
              </h2>
              <div className="space-y-3">
                <div className="text-center text-gray-500 py-4">
                  <span className="text-2xl mb-2 block">📋</span>
                  <p className="text-sm">No recent activities</p>
                  <p className="text-xs text-gray-400">Activities will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
