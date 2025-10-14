'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import gsap from 'gsap'

// --- Data for the Carousel with Unsplash Images ---
const carouselItems = [
  {
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop',
    title: 'Unparalleled Luxury',
    description: 'Discover world-class amenities and personalized service at every Sky Nest location.'
  },
  {
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=1974&auto=format&fit=crop',
    title: 'Breathtaking Views',
    description: 'From serene coastlines to vibrant cityscapes, your perfect escape awaits.'
  },
  {
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1949&auto=format&fit=crop',
    title: 'Seamless Booking',
    description: 'Manage your reservations and plan your stay with ease through our guest portal.'
  }
]

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)

  // Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => {
      // Animate out the current text
      gsap.to([titleRef.current, descriptionRef.current], { 
        opacity: 0, 
        y: 20, 
        duration: 0.5, 
        ease: 'power3.in',
        onComplete: () => {
          // Change the slide after the text has faded out
          setCurrentSlide(prev => (prev === carouselItems.length - 1 ? 0 : prev + 1))
        }
      })
    }, 5000) // Change slide every 5 seconds
    return () => clearInterval(timer)
  }, [])

  // GSAP animation for text fade-in
  useEffect(() => {
    gsap.fromTo([titleRef.current, descriptionRef.current], 
      { opacity: 0, y: -20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.2 }
    )
  }, [currentSlide])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setUnverifiedEmail(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (data.user.role === 'STAFF') {
          router.push('/staff/dashboard')
        } else {
          router.push('/guest/dashboard')
        }
      } else {
        // Check if it's email not verified error
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(data.email)
          setError(data.message)
        } else {
          setError(data.error || 'Login failed')
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      {/* Left Side - Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {carouselItems.map((item, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image 
              src={item.image} 
              alt={item.title} 
              fill 
              className="object-cover"
              priority={index === 0}
              unoptimized
            />
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 to-transparent"></div>
          </div>
        ))}
        <div className="relative z-10 flex flex-col justify-between p-10 text-white h-full w-full">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/SNC.png" alt="Sky Nest Logo" width={200} height={50} />
          </Link>
          <div className="mb-8">
            <h1 
              ref={titleRef} 
              className="text-amber-400 text-4xl font-bold mb-4 leading-tight font-l"
            >
              {carouselItems[currentSlide].title}
            </h1>
            <p 
              ref={descriptionRef} 
              className="text-xl text-white/80 font-l"
            >
              {carouselItems[currentSlide].description}
            </p>
          </div>
        </div>
      </div>
      <div className="w-1 bg-gradient-to-b from-amber-400 to-amber-600"></div>

      {/* Right Side - Login Form */}
      <div className="bg-[url('/LBG.jpg')] bg-cover bg-center bg-no-repeat w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="bg-black/20 backdrop-blur-xs border border-white/10 text-gray-300">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white font-l">Sign In</CardTitle>
              <CardDescription>Welcome back! Please enter your details.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Success Message (after verification) */}
              {verified && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-md">
                  <p className="text-green-400 text-sm flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email verified successfully! You can now sign in.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
                  <div className="flex items-start">
                    <span className="text-red-400 mr-2 text-xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-red-300 text-sm font-semibold">
                        {unverifiedEmail ? 'Email Not Verified' : 'Login Failed'}
                      </p>
                      <p className="text-red-400 text-sm mt-1">{error}</p>
                      {unverifiedEmail && (
                        <Link
                          href={`/auth/resend-verification?email=${encodeURIComponent(unverifiedEmail)}`}
                          className="inline-block mt-3 text-sm text-amber-400 hover:text-amber-300 font-medium underline"
                        >
                          Resend Verification Email →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-400">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-400">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-me" 
                      className="border-gray-600 data-[state=checked]:bg-amber-400 data-[state=checked]:text-black"
                    />
                    <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                  </div>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-amber-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button 
                  type="submit" 
                  className="w-full font-bold text-base" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center text-sm">
              <p>
                Don't have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-semibold text-amber-400 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}