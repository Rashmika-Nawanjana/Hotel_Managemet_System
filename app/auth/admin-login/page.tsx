'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    twoFactorCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (formData.username && formData.password) {
        // Simulate 2FA requirement for admin
        if (!show2FA) {
          setShow2FA(true)
          setIsLoading(false)
          return
        }
        
        if (formData.twoFactorCode) {
          router.push('/admin/dashboard')
        } else {
          setError('Two-factor authentication code is required')
        }
      } else {
        setError('Please fill in all required fields')
      }
    } catch (err) {
      setError('Invalid credentials or unauthorized access')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleBack = () => {
    setShow2FA(false)
    setFormData(prev => ({ ...prev, twoFactorCode: '' }))
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="relative min-h-screen flex">
        {/* Left Side - Admin Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white relative">
          <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-2xl font-bold">Sky Nest</span>
                <p className="text-xs text-red-200 -mt-1">Admin Portal</p>
              </div>
            </Link>
          </div>

          <div className="max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Administrative
                <span className="block text-red-400 text-3xl">Control Center</span>
              </h1>
              
              <p className="text-xl text-gray-100 mb-8">
                Secure access to system management, analytics, and administrative functions across all Sky Nest locations.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-lg mb-4">Administrative Access</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">🏢</span>
                    </div>
                    <span className="text-gray-100">Branch & Property Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">👥</span>
                    </div>
                    <span className="text-gray-100">User & Role Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📈</span>
                    </div>
                    <span className="text-gray-100">Advanced Analytics & Reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">⚙️</span>
                    </div>
                    <span className="text-gray-100">System Configuration</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-400">🔐</span>
                  <span className="font-medium text-red-200">High Security Zone</span>
                </div>
                <p className="text-sm text-red-100">
                  Administrative access requires two-factor authentication and is logged for security audit purposes.
                </p>
              </div>

              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-400">📋</span>
                  <span className="font-medium text-yellow-200">Audit Trail</span>
                </div>
                <p className="text-sm text-yellow-100">
                  All administrative actions are monitored and recorded for compliance and security purposes.
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
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SN</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">Sky Nest</span>
                  <p className="text-xs text-red-200 -mt-1">Admin Portal</p>
                </div>
              </Link>
              <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
            </div>

            {/* Login Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              {!show2FA ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrator Access</h2>
                    <p className="text-gray-600">Secure login for system administrators</p>
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
                      <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                        Administrator Username *
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                        placeholder="Enter admin username"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 pr-12"
                          placeholder="Enter admin password"
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
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Remember this device
                        </label>
                      </div>

                      <Link 
                        href="/auth/forgot-password" 
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Authenticating...
                        </div>
                      ) : (
                        'Continue to 2FA'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <button
                      onClick={handleBack}
                      className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
                    >
                      ← Back
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
                    <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
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
                      <label htmlFor="twoFactorCode" className="block text-sm font-semibold text-gray-700 mb-2">
                        Authentication Code *
                      </label>
                      <input
                        id="twoFactorCode"
                        type="text"
                        value={formData.twoFactorCode}
                        onChange={(e) => handleInputChange('twoFactorCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 text-center text-2xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Open your authenticator app and enter the 6-digit code
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || formData.twoFactorCode.length !== 6}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Access Admin Dashboard'
                      )}
                    </button>
                  </form>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">ℹ️</span>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Need help?</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Contact IT support if you're having trouble with your authenticator app.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Security Warning */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500 mt-0.5">🔒</span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Security Notice</h4>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>• All admin activities are logged and monitored</li>
                      <li>• Never share your admin credentials</li>
                      <li>• Always log out from shared computers</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Alternative Portals */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500 mb-4">Access other portals</p>
                <div className="flex justify-center space-x-4">
                  <Link 
                    href="/auth/login"
                    className="text-sm text-gray-600 hover:text-red-600 transition"
                  >
                    Guest Portal
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link 
                    href="/auth/staff-login"
                    className="text-sm text-gray-600 hover:text-red-600 transition"
                  >
                    Staff Portal
                  </Link>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  IT Support: +94 11 234 5678 (Ext. 200) | Emergency: +94 77 999 0000
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