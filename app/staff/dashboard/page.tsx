"use client";

import { useState } from "react";
import Link from "next/link";

export default function StaffDashboardPage() {
  const [currentTime, setCurrentTime] = useState("2025-10-02 08:36:52");

  // Mock staff data
  const staffMember = {
    name: "Staff Member",
    employeeId: "EMP-2025-001",
    role: "Front Desk",
    branch: "Sky Nest Galle",
    shift: "Morning Shift (6:00 AM - 2:00 PM)",
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

  // Mock dashboard statistics
  const stats = {
    checkInsToday: 8,
    checkOutsToday: 6,
    currentOccupancy: 45,
    totalRooms: 60,
    pendingRequests: 12,
    activeGuests: 52,
    roomsReady: 15,
    roomsCleaning: 8,
  };

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: "check-in",
      guest: "John Smith",
      room: "305",
      time: "08:15 AM",
      status: "completed",
    },
    {
      id: 2,
      type: "service",
      guest: "Sarah Johnson",
      room: "412",
      time: "08:05 AM",
      status: "pending",
      service: "Room Service",
    },
    {
      id: 3,
      type: "check-out",
      guest: "Mike Brown",
      room: "208",
      time: "07:45 AM",
      status: "completed",
    },
    {
      id: 4,
      type: "service",
      guest: "Emma Wilson",
      room: "501",
      time: "07:30 AM",
      status: "in-progress",
      service: "Housekeeping",
    },
    {
      id: 5,
      type: "inquiry",
      guest: "David Lee",
      room: "315",
      time: "07:15 AM",
      status: "resolved",
    },
  ];

  // Mock pending tasks
  const pendingTasks = [
    {
      id: 1,
      type: "check-in",
      guest: "Alice Cooper",
      room: "410",
      time: "09:00 AM",
      priority: "high",
    },
    {
      id: 2,
      type: "service",
      description: "Extra towels - Room 305",
      priority: "medium",
    },
    {
      id: 3,
      type: "maintenance",
      description: "AC repair - Room 512",
      priority: "high",
    },
    {
      id: 4,
      type: "check-out",
      guest: "Bob Martin",
      room: "203",
      time: "10:00 AM",
      priority: "normal",
    },
    {
      id: 5,
      type: "service",
      description: "Late checkout request - Room 408",
      priority: "medium",
    },
  ];

  // Mock upcoming check-ins
  const upcomingCheckIns = [
    {
      id: 1,
      guest: "Alice Cooper",
      room: "410",
      time: "09:00 AM",
      status: "Expected",
    },
    {
      id: 2,
      guest: "Robert Taylor",
      room: "506",
      time: "10:30 AM",
      status: "Expected",
    },
    {
      id: 3,
      guest: "Lisa Anderson",
      room: "312",
      time: "11:00 AM",
      status: "Expected",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "normal":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "check-in":
        return "🔑";
      case "check-out":
        return "🚪";
      case "service":
        return "🛎️";
      case "inquiry":
        return "💬";
      case "maintenance":
        return "🔧";
      default:
        return "📋";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">
                  Sky Nest Staff Portal
                </span>
                <p className="text-xs text-gray-500 -mt-1">
                  {staffMember.branch}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Time</p>
                <p className="font-semibold text-gray-900">{currentTime}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{staffMember.name}</p>
                <p className="font-semibold text-gray-900">
                  {staffMember.role}
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {staffMember.name}!
          </h1>
          <p className="text-blue-100 mb-1">{staffMember.shift}</p>
          <p className="text-blue-100">Employee ID: {staffMember.employeeId}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔑</span>
              </div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.checkInsToday}
            </p>
            <p className="text-sm text-gray-600">Check-ins Today</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚪</span>
              </div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.checkOutsToday}
            </p>
            <p className="text-sm text-gray-600">Check-outs Today</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏨</span>
              </div>
              <span className="text-sm text-gray-600">Current</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.currentOccupancy}/{stats.totalRooms}
            </p>
            <p className="text-sm text-gray-600">
              Room Occupancy (
              {Math.round((stats.currentOccupancy / stats.totalRooms) * 100)}%)
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛎️</span>
              </div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.pendingRequests}
            </p>
            <p className="text-sm text-gray-600">Service Requests</p>
          </div>
        </div>

        {/* Room Status */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Rooms Ready</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.roomsReady}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">Being Cleaned</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.roomsCleaning}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Occupied</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.currentOccupancy}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-500">
            <p className="text-sm text-gray-600 mb-1">Active Guests</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeGuests}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Pending Tasks
                </h2>
                <Link
                  href="/staff/tasks"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-2xl">
                          {getActivityIcon(task.type)}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900 capitalize">
                              {task.type}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          {task.guest && (
                            <p className="text-sm text-gray-700">
                              Guest: {task.guest} - Room {task.room}
                            </p>
                          )}
                          {task.description && (
                            <p className="text-sm text-gray-700">
                              {task.description}
                            </p>
                          )}
                          {task.time && (
                            <p className="text-xs text-gray-500 mt-1">
                              Scheduled: {task.time}
                            </p>
                          )}
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                        Handle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Activities
                </h2>
                <Link
                  href="/staff/activities"
                  className="text-blue-600 hover:underline text-sm font-medium"
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
                          {activity.type === "check-in" &&
                            `Check-in: ${activity.guest}`}
                          {activity.type === "check-out" &&
                            `Check-out: ${activity.guest}`}
                          {activity.type === "service" &&
                            `${activity.service} - ${activity.guest}`}
                          {activity.type === "inquiry" &&
                            `Inquiry from ${activity.guest}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Room {activity.room} • {activity.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        activity.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : activity.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : activity.status === "in-progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Check-ins */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Upcoming Check-ins
              </h2>
              <div className="space-y-3">
                {upcomingCheckIns.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <p className="font-semibold text-gray-900">
                      {checkin.guest}
                    </p>
                    <p className="text-sm text-gray-600">Room {checkin.room}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {checkin.time}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {checkin.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/staff/check-in"
                className="block w-full mt-4 text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Manage Check-ins
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/staff/check-in"
                  className="block w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-center"
                >
                  <span className="text-xl mb-1 block">🔑</span>
                  <span className="font-medium text-green-900">
                    Check-in Guest
                  </span>
                </Link>
                <Link
                  href="/staff/check-out"
                  className="block w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-center"
                >
                  <span className="text-xl mb-1 block">🚪</span>
                  <span className="font-medium text-blue-900">
                    Check-out Guest
                  </span>
                </Link>
                <Link
                  href="/staff/rooms"
                  className="block w-full p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition text-center"
                >
                  <span className="text-xl mb-1 block">🏨</span>
                  <span className="font-medium text-purple-900">
                    Room Status
                  </span>
                </Link>
                <Link
                  href="/staff/services"
                  className="block w-full p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-center"
                >
                  <span className="text-xl mb-1 block">🛎️</span>
                  <span className="font-medium text-orange-900">
                    Service Requests
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
