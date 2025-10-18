'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StaffLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const branches = [
    { id: 'colombo', name: 'Sky Nest Colombo', location: 'Colombo City Center' },
    { id: 'kandy', name: 'Sky Nest Kandy', location: 'Kandy Hills' },
    { id: 'galle', name: 'Sky Nest Galle', location: 'Galle Fort' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect based on staff role
        if (data.user.staffRole === 'MANAGEMENT') {
          router.push('/staff/dashboard?role=management')
        } else {
          router.push('/staff/dashboard?role=frontdesk')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white relative">
          <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-2xl font-bold">Sky Nest</span>
                <p className="text-xs text-blue-200 -mt-1">Hotel & Resort</p>
              </div>
            </Link>
          </div>

          <div className="max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Staff Portal
                <span className="block text-blue-300 text-3xl">Sky Nest Hotels</span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8">
                Access your dashboard to manage bookings, assist guests, and maintain our high standards of hospitality excellence.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Quick Access</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📋</span>
                    </div>
                    <span className="text-blue-100">Manage Bookings & Check-ins</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">🏨</span>
                    </div>
                    <span className="text-blue-100">Room Status & Availability</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">💳</span>
                    </div>
                    <span className="text-blue-100">Billing & Payment Processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📊</span>
                    </div>
                    <span className="text-blue-100">Reports & Analytics</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-amber-400">⚠️</span>
                  <span className="font-medium text-amber-200">Security Notice</span>
                </div>
                <p className="text-sm text-amber-100">
                  Staff access is restricted by branch and role. Always log out when leaving your workstation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SN</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">Sky Nest</span>
                  <p className="text-xs text-blue-200 -mt-1">Hotel & Resort</p>
                </div>
              </Link>
              <h2 className="text-2xl font-bold text-white">Staff Portal</h2>
            </div>

            {/* Login Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Sign In</h2>
                <p className="text-gray-600">Access your work dashboard and tools</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Enter your work email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Keep me signed in
                    </label>
                  </div>

                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500 mt-0.5">🔒</span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Security Guidelines</h4>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>• Never share your login credentials</li>
                      <li>• Always log out when leaving your workstation</li>
                      <li>• Report suspicious activities immediately</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Alternative Portals */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500 mb-4">Need a different portal?</p>
                <div className="flex justify-center space-x-4">
                  <Link 
                    href="/auth/login"
                    className="text-sm text-gray-600 hover:text-blue-600 transition"
                  >
                    Guest Portal
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link 
                    href="/auth/admin-login"
                    className="text-sm text-gray-600 hover:text-blue-600 transition"
                  >
                    Admin Portal
                  </Link>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Technical Support: +94 11 234 5678 (Ext. 100)
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link 
                href="/"
                className="inline-flex items-center text-sm text-white/80 hover:text-white transition"
              >
                ← Back to Sky Nest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}