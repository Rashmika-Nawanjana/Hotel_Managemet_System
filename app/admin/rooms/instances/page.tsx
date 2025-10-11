'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Room {
  id: string
  roomNumber: string
  floor: number
  status: string
  notes: string | null
  lastCleaned: string | null
  lastMaintenance: string | null
  roomType: {
    id: string
    name: string
    basePrice: number
    bedType: string
    maxOccupancy: number
  }
  branch: {
    id: string
    name: string
    location: string
  }
}

export default function RoomInstancesPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFloor, setFilterFloor] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/admin/rooms/instances', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch rooms')
      }

      const data = await response.json()
      setRooms(data.data)
    } catch (err) {
      console.error('Error fetching rooms:', err)
      setError('Failed to load rooms')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'CLEANING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleQuickStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/rooms/instances/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update room status')
      }

      fetchRooms()
    } catch (err) {
      alert('Failed to update room status')
    }
  }

  // Get unique branches and floors
  const branches = Array.from(new Set(rooms.map((r) => r.branch.name)))
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b)

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesBranch = filterBranch === 'all' || room.branch.name === filterBranch
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus
    const matchesFloor = filterFloor === 'all' || room.floor.toString() === filterFloor
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesBranch && matchesStatus && matchesFloor && matchesSearch
  })

  // Calculate stats
  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === 'AVAILABLE').length,
    occupied: rooms.filter((r) => r.status === 'OCCUPIED').length,
    cleaning: rooms.filter((r) => r.status === 'CLEANING').length,
    maintenance: rooms.filter((r) => r.status === 'MAINTENANCE').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Instances</h1>
          <p className="text-gray-600">Manage individual physical rooms</p>
        </div>
        <Link
          href="/admin/rooms/instances/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add New Room
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🚪</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Rooms</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.available}</p>
          <p className="text-sm text-gray-600">Available</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.occupied}</p>
          <p className="text-sm text-gray-600">Occupied</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🧹</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.cleaning}</p>
          <p className="text-sm text-gray-600">Cleaning</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔧</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.maintenance}</p>
          <p className="text-sm text-gray-600">Maintenance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Floors</option>
              {floors.map((floor) => (
                <option key={floor} value={floor.toString()}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="CLEANING">Cleaning</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Room Number
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Floor
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Last Cleaned
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No rooms found
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/rooms/instances/${room.id}`}
                        className="font-bold text-blue-600 hover:text-blue-700 text-lg"
                      >
                        {room.roomNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700">Floor {room.floor}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{room.roomType.name}</p>
                      <p className="text-sm text-gray-600">
                        {room.roomType.bedType} • {room.roomType.maxOccupancy} guests
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{room.branch.name}</td>
                    <td className="px-6 py-4">
                      <select
                        value={room.status}
                        onChange={(e) => handleQuickStatusChange(room.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          room.status
                        )}`}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="OCCUPIED">OCCUPIED</option>
                        <option value="CLEANING">CLEANING</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {room.lastCleaned
                        ? new Date(room.lastCleaned).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/rooms/instances/${room.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}