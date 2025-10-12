// app/auth/admin-login/page.tsx
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
  const [formData, setFormData] = useState({ username: '', password: '', twoFactorCode: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
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
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      if (!show2FA) {
        // Step 1: Validate username and password
        if (formData.username === 'user1' && formData.password === 'password123') {
            setShow2FA(true);
        } else {
            setError('Invalid username or password.');
        }
      } else {
        // Step 2: Validate 2FA code
        if (formData.twoFactorCode === '123456') {
            router.push('/admin/dashboard');
        } else {
            setError('Invalid two-factor authentication code.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
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
                <p className="font-l text-sm text-gray-400 mb-8">
                    <span className="font-l text-base block text-amber-400">Disclaimer</span>
                    For Security purposes all activity will be monitored.
                </p>

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
                  <div className="h-6 mb-4">
                    {error && <div className="text-red-400 text-sm">{error}</div>}
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Administrator Username</Label>
                      <Input id="username" type="text" placeholder="Username" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                           <Checkbox id="remember-me" className="border-gray-600 data-[state=checked]:bg-amber-400 data-[state=checked]:text-black"/>
                           <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                        </div>
                        <Link href="/auth/forgot-password" className="text-sm text-amber-400 hover:underline">Forgot password?</Link>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button type="submit" onClick={handleSubmit} className="w-full font-bold" disabled={isLoading}>
                    {isLoading ? 'Authenticating...' : 'Continue'}
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
                  <CardDescription>Enter the 6-digit code: 123456</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-6 mb-4">
                    {error && <div className="text-red-400 text-sm">{error}</div>}
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                     <Button type="submit" className="w-full font-bold" disabled={isLoading || formData.twoFactorCode.length !== 6}>
                       {isLoading ? 'Verifying...' : 'Access Dashboard'}
                     </Button>
                  </form>
                </CardContent>
                <CardFooter>
                   <Button variant="link" className="text-gray-400" onClick={handleBack}>Back to login</Button>
                </CardFooter>
              </Card>
            )}
            </div>
          </div>
        </div>
      </div>
  )
}

