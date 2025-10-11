'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Branch {
  id: string
  name: string
  location: string
}

interface RoomType {
  id: string
  name: string
  bedType: string
  maxOccupancy: number
  basePrice: number
}

export default function CreateRoomInstancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [filteredRoomTypes, setFilteredRoomTypes] = useState<RoomType[]>([])
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '1',
    branchId: '',
    roomTypeId: '',
    notes: '',
  })

  // Bulk create state
  const [bulkCreate, setBulkCreate] = useState(false)
  const [bulkData, setBulkData] = useState({
    startNumber: '',
    endNumber: '',
    floor: '1',
    prefix: '',
  })

  useEffect(() => {
    fetchBranches()
    fetchRoomTypes()
  }, [])

  useEffect(() => {
    // Filter room types by selected branch
    if (formData.branchId) {
      const filtered = roomTypes.filter((rt) => rt.id === formData.branchId || true) // Adjust based on your schema
      setFilteredRoomTypes(filtered)
    } else {
      setFilteredRoomTypes(roomTypes)
    }
  }, [formData.branchId, roomTypes])

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches')
      if (response.ok) {
        const data = await response.json()
        setBranches(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching branches:', err)
    }
  }

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/admin/rooms', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setRoomTypes(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching room types:', err)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBulkInputChange = (field: string, value: string) => {
    setBulkData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.roomNumber.trim()) return 'Room number is required'
    if (!formData.floor || parseInt(formData.floor) < 1)
      return 'Valid floor number is required'
    if (!formData.branchId) return 'Please select a branch'
    if (!formData.roomTypeId) return 'Please select a room type'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/rooms/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          floor: parseInt(formData.floor),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room')
      }

      alert('Room created successfully!')
      router.push('/admin/rooms/instances')
    } catch (err: unknown) {
      console.error('Error creating room:', err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to create room')
      } else {
        setError('Failed to create room')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const start = parseInt(bulkData.startNumber)
    const end = parseInt(bulkData.endNumber)

    if (!start || !end || start > end) {
      setError('Invalid room number range')
      setIsLoading(false)
      return
    }

    if (!formData.branchId || !formData.roomTypeId) {
      setError('Please select branch and room type')
      setIsLoading(false)
      return
    }

    try {
      const promises = []
      for (let i = start; i <= end; i++) {
        const roomNumber = bulkData.prefix
          ? `${bulkData.prefix}${i}`
          : i.toString().padStart(3, '0')

        promises.push(
          fetch('/api/admin/rooms/instances', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              roomNumber,
              floor: parseInt(bulkData.floor),
              branchId: formData.branchId,
              roomTypeId: formData.roomTypeId,
              notes: formData.notes,
            }),
          })
        )
      }

      const results = await Promise.all(promises)
      const successCount = results.filter((r) => r.ok).length

      alert(`Successfully created ${successCount} rooms!`)
      router.push('/admin/rooms/instances')
    } catch (err: unknown) {
      console.error('Error bulk creating rooms:', err)
      setError('Failed to create some rooms')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/rooms/instances"
            className="text-blue-600 hover:text-blue-500 flex items-center mb-2"
          >
            ← Back to Room Instances
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Room Instance
          </h1>
          <p className="text-gray-600">Add a new physical room to your inventory</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Toggle Bulk Create */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Bulk Create Mode</h3>
            <p className="text-sm text-gray-600">
              Create multiple rooms at once (e.g., 101-110)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBulkCreate(!bulkCreate)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              bulkCreate
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {bulkCreate ? 'Bulk Mode ON' : 'Single Room'}
          </button>
        </div>
      </div>

      {/* Single Room Form */}
      {!bulkCreate ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Room Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 101, 201A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Floor *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch *
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Type *
                </label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => handleInputChange('roomTypeId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a room type</option>
                  {filteredRoomTypes.map((roomType) => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name} - {roomType.bedType} (LKR{' '}
                      {roomType.basePrice?.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Any special notes about this room..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Creating...
                </span>
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Bulk Create Form */
        <form onSubmit={handleBulkCreate} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Bulk Room Creation
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch *
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Type *
                </label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => handleInputChange('roomTypeId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a room type</option>
                  {filteredRoomTypes.map((roomType) => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name} - {roomType.bedType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Floor *
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkData.floor}
                  onChange={(e) => handleBulkInputChange('floor', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Number Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={bulkData.prefix}
                  onChange={(e) => handleBulkInputChange('prefix', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., A, B (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Number *
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkData.startNumber}
                  onChange={(e) => handleBulkInputChange('startNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Number *
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkData.endNumber}
                  onChange={(e) => handleBulkInputChange('endNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="110"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Notes for all rooms..."
                />
              </div>
            </div>

            {/* Preview */}
            {bulkData.startNumber && bulkData.endNumber && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Preview: Will create{' '}
                  {parseInt(bulkData.endNumber) - parseInt(bulkData.startNumber) + 1}{' '}
                  rooms
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    {
                      length:
                        Math.min(
                          parseInt(bulkData.endNumber) -
                            parseInt(bulkData.startNumber) +
                            1,
                          10
                        ),
                    },
                    (_, i) => {
                      const num = parseInt(bulkData.startNumber) + i
                      const roomNum = bulkData.prefix
                        ? `${bulkData.prefix}${num}`
                        : num.toString().padStart(3, '0')
                      return (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white border border-blue-300 rounded text-sm font-mono"
                        >
                          {roomNum}
                        </span>
                      )
                    }
                  )}
                  {parseInt(bulkData.endNumber) - parseInt(bulkData.startNumber) + 1 >
                    10 && (
                    <span className="px-3 py-1 text-sm text-blue-700">
                      ... and{' '}
                      {parseInt(bulkData.endNumber) -
                        parseInt(bulkData.startNumber) +
                        1 -
                        10}{' '}
                      more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Creating...
                </span>
              ) : (
                `Create ${
                  bulkData.startNumber && bulkData.endNumber
                    ? parseInt(bulkData.endNumber) -
                      parseInt(bulkData.startNumber) +
                      1
                    : ''
                } Rooms`
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}