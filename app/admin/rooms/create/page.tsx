'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function CreateRoomTypePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)

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
    isFeatured: false,
  })

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])

  useEffect(() => {
    fetchBranches()
    fetchAmenities()
  }, [])

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

  const handleInputChange = async (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
    
    // Check for duplicates when name changes and branch is selected
    if (field === 'name' && typeof value === 'string' && formData.branchId) {
      const isDuplicate = await checkDuplicateName(value, formData.branchId)
      if (isDuplicate) {
        setError('A room type with this name already exists in the selected branch. Please choose a different name or select a different branch.')
      }
    }
  }

  // Check for duplicates when branch changes
  const handleBranchChange = async (branchId: string) => {
    setFormData((prev) => ({ ...prev, branchId }))
    
    // Clear error when branch changes
    if (error) {
      setError('')
    }
    
    // Check for duplicates if name is already entered
    if (formData.name.trim() && branchId) {
      const isDuplicate = await checkDuplicateName(formData.name, branchId)
      if (isDuplicate) {
        setError('A room type with this name already exists in the selected branch. Please choose a different name or select a different branch.')
      }
    }
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

  const checkDuplicateName = async (name: string, branchId: string) => {
    if (!name.trim() || !branchId) return false
    
    try {
      setIsCheckingDuplicate(true)
      const response = await fetch(`/api/admin/rooms?name=${encodeURIComponent(name.trim())}&branchId=${branchId}`)
      if (response.ok) {
        const data = await response.json()
        return data.data && data.data.length > 0
      }
    } catch (err) {
      console.error('Error checking duplicate name:', err)
    } finally {
      setIsCheckingDuplicate(false)
    }
    return false
  }

  const validateForm = async () => {
    if (!formData.name.trim()) return 'Room name is required'
    if (!formData.description.trim()) return 'Description is required'
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0)
      return 'Valid base price is required'
    if (!formData.maxOccupancy || parseInt(formData.maxOccupancy) <= 0)
      return 'Valid max occupancy is required'
    if (!formData.roomSize || parseInt(formData.roomSize) <= 0)
      return 'Valid room size is required'
    if (!formData.branchId) return 'Please select a branch'
    
    // Check for duplicate name within the same branch
    const isDuplicate = await checkDuplicateName(formData.name, formData.branchId)
    if (isDuplicate) {
      return 'A room type with this name already exists in the selected branch. Please choose a different name or select a different branch.'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const validationError = await validateForm()
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

      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
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
        throw new Error(data.error || 'Failed to create room type')
      }

      setSuccessMessage('Room type created successfully!')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/rooms')
      }, 2000)
    } catch (err: unknown) {
      console.error('Error creating room type:', err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to create room type')
      } else {
        setError('Failed to create room type')
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/rooms"
            className="text-blue-600 hover:text-blue-500 flex items-center mb-2"
          >
            ← Back to Room Types
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Room Type</h1>
          <p className="text-gray-600">Add a new room category to your inventory</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 mr-3 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-semibold mb-1">Error</p>
              <p className="text-red-700">{error}</p>
              {error.includes('already exists') && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <p className="text-red-800 text-sm font-medium mb-2">💡 Suggestions:</p>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Try adding a location identifier to make it unique (e.g., "Deluxe Suite - Ocean View")</li>
                    <li>• Add a number or version (e.g., "Deluxe Suite v2")</li>
                    <li>• Use a different descriptive term (e.g., "Premium Suite" instead of "Deluxe Suite")</li>
                    <li>• Select a different branch if this room type should exist in multiple locations</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-500 mr-3 text-2xl">✓</span>
            <div>
              <p className="text-green-800 font-semibold">{successMessage}</p>
              <p className="text-green-600 text-sm mt-1">Redirecting to room types...</p>
            </div>
          </div>
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
                {isCheckingDuplicate && (
                  <span className="ml-2 text-blue-600 text-sm font-normal">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1"></span>
                    Checking availability...
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Deluxe Ocean Suite"
                required
                disabled={isCheckingDuplicate}
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
                onChange={(e) => handleBranchChange(e.target.value)}
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
                Creating...
              </span>
            ) : (
              'Create Room Type'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}