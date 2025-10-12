"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [currentTime] = useState("2025-10-02 08:41:33");

  // Mock admin data
  const admin = {
    name: "Admin User",
    email: "admin@skynest.lk",
    role: "System Administrator",
    lastLogin: "2025-10-02 08:40:15",
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear HTTP-only cookie
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("auth-token");

        // Force page reload to clear all state
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);

      // Even if API fails, clear client-side data
      localStorage.clear();
      window.location.href = "/";
    }
  };

  // Mock overall statistics
  const overallStats = {
    totalRevenue: 458920,
    totalBookings: 1247,
    totalGuests: 3542,
    occupancyRate: 78,
    avgRating: 4.7,
    activeStaff: 145,
  };

  // Mock branch statistics
  const branchStats = [
    {
      id: "colombo",
      name: "Sky Nest Colombo",
      occupancy: 85,
      totalRooms: 80,
      occupiedRooms: 68,
      revenue: 185340,
      bookingsToday: 12,
      activeStaff: 52,
      status: "operational",
    },
    {
      id: "kandy",
      name: "Sky Nest Kandy",
      occupancy: 72,
      totalRooms: 60,
      occupiedRooms: 43,
      revenue: 142680,
      bookingsToday: 8,
      activeStaff: 45,
      status: "operational",
    },
    {
      id: "galle",
      name: "Sky Nest Galle",
      occupancy: 76,
      totalRooms: 70,
      occupiedRooms: 53,
      revenue: 130900,
      bookingsToday: 10,
      activeStaff: 48,
      status: "operational",
    },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: "booking",
      description: "New booking - BK-2025-12456",
      branch: "Colombo",
      time: "08:35:22",
      user: "Guest: John Doe",
    },
    {
      id: 2,
      type: "staff",
      description: "Staff clock-in - EMP-2025-052",
      branch: "Kandy",
      time: "08:30:15",
      user: "Staff: Sarah Kumar",
    },
    {
      id: 3,
      type: "system",
      description: "System backup completed",
      branch: "All",
      time: "08:00:00",
      user: "System",
    },
    {
      id: 4,
      type: "payment",
      description: "Payment received - $450",
      branch: "Galle",
      time: "07:55:30",
      user: "Guest: Mike Wilson",
    },
    {
      id: 5,
      type: "alert",
      description: "Low inventory alert - Towels",
      branch: "Colombo",
      time: "07:45:12",
      user: "System",
    },
  ];

  // Mock alerts
  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "Low towel inventory at Colombo branch",
      priority: "medium",
      time: "07:45:12",
    },
    {
      id: 2,
      type: "info",
      message: "Monthly maintenance scheduled for next week",
      priority: "low",
      time: "06:00:00",
    },
    {
      id: 3,
      type: "success",
      message: "Payment gateway update successful",
      priority: "low",
      time: "05:30:00",
    },
  ];

  // Mock pending approvals
  const pendingApprovals = [
    {
      id: 1,
      type: "refund",
      description: "Refund request - BK-2025-12340",
      amount: 350,
      branch: "Galle",
    },
    {
      id: 2,
      type: "leave",
      description: "Leave request - EMP-2025-033",
      branch: "Kandy",
      staff: "David Silva",
    },
    {
      id: 3,
      type: "expense",
      description: "Equipment purchase - $2,500",
      branch: "Colombo",
      category: "Maintenance",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return "📅";
      case "staff":
        return "👤";
      case "system":
        return "⚙️";
      case "payment":
        return "💳";
      case "alert":
        return "⚠️";
      default:
        return "📋";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const filteredBranches =
    selectedBranch === "all"
      ? branchStats
      : branchStats.filter((b) => b.id === selectedBranch);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  Sky Nest Admin Portal
                </span>
                <p className="text-xs text-gray-300 -mt-1">
                  System Administration
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-300">System Time (UTC)</p>
                <p className="font-semibold text-white">{currentTime}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">{admin.name}</p>
                <p className="font-semibold text-white">{admin.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {admin.name}!
          </h1>
          <p className="text-red-100 mb-1">{admin.role}</p>
          <p className="text-red-100">Last login: {admin.lastLogin}</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              ${overallStats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {overallStats.totalBookings}
            </p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {overallStats.totalGuests}
            </p>
            <p className="text-sm text-gray-600">Total Guests</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏨</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {overallStats.occupancyRate}%
            </p>
            <p className="text-sm text-gray-600">Occupancy Rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {overallStats.avgRating}
            </p>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👔</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {overallStats.activeStaff}
            </p>
            <p className="text-sm text-gray-600">Active Staff</p>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              System Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getAlertColor(
                    alert.type
                  )}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">
                        {alert.type === "warning"
                          ? "⚠️"
                          : alert.type === "success"
                          ? "✓"
                          : "ℹ️"}
                      </span>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">{alert.time}</p>
                      </div>
                    </div>
                    <button className="text-xs px-3 py-1 bg-white/50 rounded-lg hover:bg-white/75 transition">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branch Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Branch Overview</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedBranch("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedBranch === "all"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Branches
              </button>
              {branchStats.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedBranch === branch.id
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {branch.name.split(" ")[2]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
                <h3 className="text-xl font-bold mb-1">{branch.name}</h3>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    branch.status === "operational"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {branch.status === "operational"
                    ? "● Operational"
                    : "● Maintenance"}
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Occupancy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {branch.occupancy}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {branch.occupiedRooms}/{branch.totalRooms} rooms
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(branch.revenue / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Bookings Today</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {branch.bookingsToday}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Staff</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {branch.activeStaff}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/branches/${branch.id}`}
                  className="block w-full mt-4 text-center py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent System Activities
              </h2>
              <Link
                href="/admin/activities"
                className="text-red-600 hover:underline text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {getActivityIcon(activity.type)}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.branch} • {activity.user}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Approvals */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                <span>Pending Approvals</span>
                <span className="bg-red-100 text-red-700 text-sm px-2 py-1 rounded-full">
                  {pendingApprovals.length}
                </span>
              </h2>
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {approval.type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {approval.description}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {approval.branch}
                    </p>
                    <div className="flex space-x-2">
                      <button className="flex-1 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition">
                        Approve
                      </button>
                      <button className="flex-1 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/approvals"
                className="block w-full mt-4 text-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                View All Approvals
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/admin/rooms"
                  className="block w-full p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
                >
                  <span className="text-xl mb-1 block">🛏️</span>
                  <span className="font-medium text-orange-900 text-sm">
                    Room Management
                  </span>
                </Link>
                <Link
                  href="/admin/users"
                  className="block w-full p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                >
                  <span className="text-xl mb-1 block">👥</span>
                  <span className="font-medium text-red-900 text-sm">
                    User Management
                  </span>
                </Link>
                <Link
                  href="/admin/branches"
                  className="block w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                >
                  <span className="text-xl mb-1 block">🏢</span>
                  <span className="font-medium text-blue-900 text-sm">
                    Branch Management
                  </span>
                </Link>
                <Link
                  href="/admin/reports"
                  className="block w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
                >
                  <span className="text-xl mb-1 block">📊</span>
                  <span className="font-medium text-green-900 text-sm">
                    Reports & Analytics
                  </span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="block w-full p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                >
                  <span className="text-xl mb-1 block">⚙️</span>
                  <span className="font-medium text-purple-900 text-sm">
                    System Settings
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
