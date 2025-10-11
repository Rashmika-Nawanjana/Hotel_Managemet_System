'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Branch {
  id: string
  name: string
  location: string
}

interface Amenity {
  id: string
  name: string
  icon: string
  category: string
}

interface RoomType {
  id: string
  name: string
  description: string
  shortDescription: string
  basePrice: number
  maxOccupancy: number
  bedType: string
  numberOfBeds: number
  roomSize: number
  viewType: string
  status: string
  isFeatured: boolean
  branch: {
    id: string
  }
  amenities: Array<{
    id: string
  }>
  images: Array<{
    id: string
    url: string
  }>
}

export default function EditRoomTypePage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    basePrice: '',
    maxOccupancy: '',
    bedType: 'Queen',
    numberOfBeds: '1',
    roomSize: '',
    viewType: '',
    branchId: '',
    status: 'active',
    isFeatured: false,
  })

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])

  useEffect(() => {
    if (params.id) {
      fetchRoomType()
      fetchBranches()
      fetchAmenities()
    }
  }, [params.id])

  const fetchRoomType = async () => {
    try {
      const response = await fetch(`/api/admin/rooms/${params.id}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch room type')
      }

      const data = await response.json()
      const roomType: RoomType = data.data

      // Pre-fill form data
      setFormData({
        name: roomType.name,
        description: roomType.description,
        shortDescription: roomType.shortDescription || '',
        basePrice: roomType.basePrice.toString(),
        maxOccupancy: roomType.maxOccupancy.toString(),
        bedType: roomType.bedType,
        numberOfBeds: roomType.numberOfBeds.toString(),
        roomSize: roomType.roomSize.toString(),
        viewType: roomType.viewType || '',
        branchId: roomType.branch.id,
        status: roomType.status,
        isFeatured: roomType.isFeatured,
      })

      // Set selected amenities
      setSelectedAmenities(roomType.amenities.map((a: any) => a.id))

      // Set image URLs
      if (roomType.images && roomType.images.length > 0) {
        setImageUrls(roomType.images.map((img: any) => img.url))
      }

      setIsFetching(false)
    } catch (err) {
      console.error('Error fetching room type:', err)
      setError('Failed to load room type')
      setIsFetching(false)
    }
  }

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

  const fetchAmenities = async () => {
    try {
      const response = await fetch('/api/amenities')
      if (response.ok) {
        const data = await response.json()
        setAmenities(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching amenities:', err)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    )
  }

  const handleAddImageUrl = () => {
    setImageUrls((prev) => [...prev, ''])
  }

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageUrlChange = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Room name is required'
    if (!formData.description.trim()) return 'Description is required'
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0)
      return 'Valid base price is required'
    if (!formData.maxOccupancy || parseInt(formData.maxOccupancy) <= 0)
      return 'Valid max occupancy is required'
    if (!formData.roomSize || parseInt(formData.roomSize) <= 0)
      return 'Valid room size is required'
    if (!formData.branchId) return 'Please select a branch'
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
      // Filter out empty image URLs
      const validImageUrls = imageUrls
        .filter((url) => url.trim() !== '')
        .map((url, index) => ({
          url,
          caption: `${formData.name} - Image ${index + 1}`,
          altText: formData.name,
        }))

      const response = await fetch(`/api/admin/rooms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice),
          maxOccupancy: parseInt(formData.maxOccupancy),
          numberOfBeds: parseInt(formData.numberOfBeds),
          roomSize: parseInt(formData.roomSize),
          amenityIds: selectedAmenities,
          images: validImageUrls,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update room type')
      }

      alert('Room type updated successfully!')
      router.push(`/admin/rooms/${params.id}`)
    } catch (err: unknown) {
      console.error('Error updating room type:', err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to update room type')
      } else {
        setError('Failed to update room type')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const bedTypes = ['Single', 'Twin', 'Double', 'Queen', 'King', 'California King']
  const viewTypes = ['Garden View', 'City View', 'Ocean View', 'Pool View', 'Mountain View', 'No View']

  // Group amenities by category
  const amenitiesByCategory = amenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = []
    }
    acc[amenity.category].push(amenity)
    return acc
  }, {} as Record<string, Amenity[]>)

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/admin/rooms/${params.id}`}
            className="text-blue-600 hover:text-blue-500 flex items-center mb-2"
          >
            ← Back to Room Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Room Type</h1>
          <p className="text-gray-600">Update room category information</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room Type Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Deluxe Ocean Suite"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief one-line description (max 200 characters)"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/200 characters
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={5}
                placeholder="Detailed description of the room type..."
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
                disabled
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.location}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Branch cannot be changed after creation</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Base Price (LKR) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
              ⭐ Mark as Featured Room Type
            </label>
          </div>
        </div>

        {/* Room Specifications */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Room Specifications</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Occupancy *
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxOccupancy}
                onChange={(e) => handleInputChange('maxOccupancy', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bed Type *
              </label>
              <select
                value={formData.bedType}
                onChange={(e) => handleInputChange('bedType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {bedTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Beds *
              </label>
              <input
                type="number"
                min="1"
                value={formData.numberOfBeds}
                onChange={(e) => handleInputChange('numberOfBeds', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room Size (m²) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.roomSize}
                onChange={(e) => handleInputChange('roomSize', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="35"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                View Type
              </label>
              <select
                value={formData.viewType}
                onChange={(e) => handleInputChange('viewType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select view type (optional)</option>
                {viewTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Amenities ({selectedAmenities.length} selected)
          </h2>

          {Object.keys(amenitiesByCategory).length === 0 ? (
            <p className="text-gray-500">Loading amenities...</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                    {category.replace('_', ' ')}
                  </h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryAmenities.map((amenity) => (
                      <label
                        key={amenity.id}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                          selectedAmenities.includes(amenity.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity.id)}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-xl">{amenity.icon}</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {amenity.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Room Images</h2>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              + Add Image URL
            </button>
          </div>

          <div className="space-y-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://images.unsplash.com/photo-example?w=800"
                  />
                </div>
                {index === 0 && (
                  <span className="px-3 py-2 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded">
                    Primary
                  </span>
                )}
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            💡 Tip: The first image will be used as the primary display image
          </p>
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
                Updating...
              </span>
            ) : (
              'Update Room Type'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}