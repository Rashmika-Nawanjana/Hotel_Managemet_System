'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import gsap from 'gsap'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    twoFactorCode: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Animate between login and 2FA forms
  useEffect(() => {
    if (formContainerRef.current) {
      gsap.to(formContainerRef.current, {
        height: show2FA ? formContainerRef.current.scrollHeight : 'auto',
        duration: 0.5,
        ease: 'power3.inOut'
      });
    }
  }, [show2FA]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!show2FA) {
        // Step 1: Validate credentials and get 2FA code
        const response = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            step: 'credentials',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Login failed. Please try again.');
          setIsLoading(false);
          return;
        }

        // Show 2FA screen
        console.log('Step 1 response data:', data);
        setUserId(data.userId);
        setUserEmail(data.email);
        setShow2FA(true);
        setIsLoading(false);
      } else {
        // Step 2: Verify 2FA code
        console.log('Step 2 - Submitting 2FA with userId:', userId);
        console.log('Step 2 - 2FA code:', formData.twoFactorCode);

        const response = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            twoFactorCode: formData.twoFactorCode,
            step: '2fa',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || '2FA verification failed. Please try again.');
          setIsLoading(false);
          return;
        }

        // Store token and user data
        if (rememberMe) {
          localStorage.setItem('auth-token', data.token);
        }
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('✅ Login successful, redirecting to admin dashboard...');

        // Use window.location for hard navigation to ensure cookie is sent
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleBack = () => {
    setShow2FA(false);
    setFormData(prev => ({ ...prev, twoFactorCode: '' }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300">
      <div className="relative min-h-screen flex">
        {/* Left Side - Admin Branding */}
        <div className="bg-[url('/ABG.jpg')] bg-cover bg-center bg-no-repeat hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white relative">
          <div className="absolute top-30 left-8">
            <Image src="/skyad.png" alt="Sky Nest Admin" width={400} height={50} />
          </div>
          <div className="max-w-md">
            <h1 className="text-6xl font-semibold mb-4 leading-tight font-l">
              Administrative
              <span className="text-5xl block text-amber-400">Control Center</span>
            </h1>
            <p className="text-lg text-gray-400 mb-6 font-l">
              Secure access to system management, analytics, and administrative functions for Sky Nest properties.
            </p>

            {/* Enhanced Features Section */}
            <div className="space-y-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="font-semibold text-base mb-3">Administrative Access</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">🏢</span>
                    </div>
                    <span className="text-sm text-gray-100">Branch & Property Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">👥</span>
                    </div>
                    <span className="text-sm text-gray-100">User & Role Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📈</span>
                    </div>
                    <span className="text-sm text-gray-100">Advanced Analytics & Reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm">⚙️</span>
                    </div>
                    <span className="text-sm text-gray-100">System Configuration</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl p-3 border border-amber-400/30">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-amber-400">🔐</span>
                  <span className="font-medium text-amber-200 text-sm">High Security Zone</span>
                </div>
                <p className="text-xs text-amber-100">
                  Administrative access requires two-factor authentication and is logged for security audit purposes.
                </p>
              </div>

              <p className="font-l text-sm text-gray-400">
                <span className="font-l text-base block text-amber-400">Disclaimer</span>
                For security purposes, all activity will be monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-r from-black/30 to-transparent">
          <div ref={formContainerRef} className="w-full max-w-md overflow-hidden">
            {!show2FA ? (
              // Initial Login Form
              <Card className="bg-[#181d28]/80 border-gray-800 text-gray-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white font-l">Administrator Access</CardTitle>
                  <CardDescription>Secure login for system administrators.</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-red-400 mr-2">⚠️</span>
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Administrator Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="admin@skynest.com" 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={formData.password} 
                          onChange={(e) => handleInputChange('password', e.target.value)} 
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
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="border-gray-600 data-[state=checked]:bg-amber-400 data-[state=checked]:text-black"
                        />
                        <Label htmlFor="remember-me" className="text-sm">Remember this device</Label>
                      </div>
                      <Link href="/auth/forgot-password" className="text-sm text-amber-400 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    onClick={handleSubmit} 
                    className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-[#10141c]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Authenticating...
                      </span>
                    ) : (
                      'Continue to 2FA'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              // 2FA Form
              <Card className="bg-[#181d28]/80 border-gray-800 text-gray-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white font-l flex items-center space-x-2">
                    <ShieldCheck className="text-amber-400" />
                    <span>Two-Factor Authentication</span>
                  </CardTitle>
                  <CardDescription>
                    We've sent a 6-digit code to your email
                  </CardDescription>
                  {userEmail && (
                    <p className="text-sm text-blue-400 font-medium mt-2">
                      📧 {userEmail}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-red-400 mr-2">⚠️</span>
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400 mt-0.5">ℹ️</span>
                      <div>
                        <h4 className="text-sm font-medium text-blue-300">Check Your Email</h4>
                        <p className="text-xs text-blue-200 mt-1">
                          A security code has been sent to your registered email address. 
                          Please check your inbox (and spam folder).
                        </p>
                        <p className="text-xs text-blue-300 mt-2">⏰ Code expires in 5 minutes</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="twoFactorCode">Authentication Code *</Label>
                      <Input 
                        id="twoFactorCode" 
                        type="text" 
                        placeholder="000000" 
                        value={formData.twoFactorCode} 
                        onChange={(e) => handleInputChange('twoFactorCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6} 
                        className="text-center text-2xl tracking-[0.5em]"
                        required
                      />
                      <p className="text-xs text-gray-400">Enter the 6-digit code sent to your email</p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-[#10141c]" 
                      disabled={isLoading || formData.twoFactorCode.length !== 6}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin mr-2">⏳</span>
                          Verifying...
                        </span>
                      ) : (
                        'Access Admin Dashboard'
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="link" 
                    className="text-gray-400 hover:text-amber-400" 
                    onClick={handleBack}
                  >
                    ← Back to login
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Security Warning */}
            <div className="mt-6 p-4 bg-[#181d28]/60 rounded-lg border border-gray-700">
              <div className="flex items-start space-x-2">
                <span className="text-gray-400 mt-0.5">🔒</span>
                <div>
                  <h4 className="text-sm font-medium text-white">Security Notice</h4>
                  <ul className="text-xs text-gray-400 mt-1 space-y-1">
                    <li>• All admin activities are logged and monitored</li>
                    <li>• Never share your admin credentials</li>
                    <li>• Always log out from shared computers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Alternative Portals */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-center text-sm text-gray-500 mb-4">Access other portals</p>
              <div className="flex justify-center space-x-4">
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-amber-400 transition">
                  Guest Portal
                </Link>
                <span className="text-gray-600">|</span>
                <Link href="/auth/staff-login" className="text-sm text-gray-400 hover:text-amber-400 transition">
                  Staff Portal
                </Link>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                IT Support: +94 11 234 5678 (Ext. 200) | Emergency: +94 77 999 0000
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition">
                ← Back to Sky Nest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}