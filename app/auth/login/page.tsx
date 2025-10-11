'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GuestLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const verified = searchParams.get('verified')
  const errorParam = searchParams.get('error')
  const passwordReset = searchParams.get('password_reset')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setShowResendVerification(false)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if error is due to unverified email
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setError(data.error)
          setShowResendVerification(true)
          setUnverifiedEmail(data.email)
        } else {
          setError(data.error || 'Login failed. Please try again.')
        }
        return
      }

      // Store token in localStorage (optional, since we also use cookies)
      if (rememberMe) {
        localStorage.setItem('auth-token', data.token)
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on user role
      if (data.user.role === 'GUEST') {
        router.push('/guest/dashboard')
      } else if (data.user.role === 'STAFF') {
        router.push('/staff/dashboard')
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: unverifiedEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setError('')
        setShowResendVerification(false)
        alert('Verification email sent! Please check your inbox.')
      } else {
        setError(data.error || 'Failed to resend verification email.')
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">SN</span>
              </div>
              <div>
                <span className="text-3xl font-bold">Sky Nest</span>
                <p className="text-sm text-blue-200 -mt-1">Hotel & Resort</p>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Welcome back to your 
              <span className="block text-blue-200">luxury experience</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8">
              Sign in to manage your bookings, explore exclusive offers, and access personalized services across our beautiful locations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <span className="text-blue-100">Manage your reservations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <span className="text-blue-100">Request premium services</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <span className="text-blue-100">Access exclusive member rates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SN</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-800">Sky Nest</span>
                <p className="text-xs text-gray-500 -mt-1">Hotel & Resort</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
            <p className="text-gray-600">Welcome back! Please enter your details.</p>
          </div>

          {/* Success Message - Registration */}
          {registered && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-green-700 text-sm">
                  Registration successful! Please check your email to verify your account before signing in.
                </span>
              </div>
            </div>
          )}

          {/* Success Message - Email Verified */}
          {verified && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-green-700 text-sm">
                  Email verified successfully! You can now sign in.
                </span>
              </div>
            </div>
          )}

          {/* Success Message - password reset */}
                    {passwordReset && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-green-700 text-sm">
                  Password reset successful! You can now sign in with your new password.
                </span>
              </div>
            </div>
          )}

          {/* Error Messages from URL params */}
          {errorParam && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700 text-sm">
                  {errorParam === 'invalid_token' && 'Invalid verification link.'}
                  {errorParam === 'token_expired' && 'Verification link has expired.'}
                  {errorParam === 'token_already_used' && 'This verification link has already been used.'}
                  {errorParam === 'verification_failed' && 'Verification failed. Please try again.'}
                </span>
              </div>
            </div>
          )}

          {/* Error Message - Login Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-500 mr-2 mt-0.5">⚠️</span>
                <div className="flex-1">
                  <span className="text-red-700 text-sm block">{error}</span>
                  {showResendVerification && (
                    <button
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-500 font-medium underline"
                    >
                      Resend verification email
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Remember me
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
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up for free
            </Link>
          </p>

          {/* Alternative Portals */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500 mb-4">Looking for a different portal?</p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/auth/staff-login"
                className="text-sm text-gray-600 hover:text-blue-600 transition"
              >
                Staff Portal
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

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Back to Sky Nest
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}