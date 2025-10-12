// app/guest/profile/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import GuestNavbar from '@/app/components/GuestNavbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Briefcase, Calendar, Star, DollarSign, Edit } from 'lucide-react'

export default function GuestProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Mock data, easily replaceable with API calls
  const [profileData, setProfileData] = useState({
    firstName: 'Rashmika',
    lastName: 'Nawanjana',
    email: 'rashmika@example.com',
    phone: '+94 77 123 4567',
  });
  const [preferences, setPreferences] = useState({
    newsletter: true,
    smsNotifications: true,
  });
  const stats = {
    totalBookings: 12,
    totalNights: 45,
    totalSpent: 5420,
    loyaltyPoints: 1250
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-amber-700/30 to-amber-50 text-gray-800">
      <GuestNavbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-4xl bg-amber-100 text-amber-700 font-semibold">
                        {profileData.firstName[0]}{profileData.lastName[0]}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 font-l">{profileData.firstName} {profileData.lastName}</h1>
                    <p className="text-gray-600">{profileData.email}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500">Loyalty Points</p>
                <p className="text-3xl font-bold text-amber-600">{stats.loyaltyPoints}</p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-5 mb-8">
            <Card className="shadow-lg bg-white/60 backdrop-blur-xl border-white/20"><CardContent className="pt-6"><div className="flex items-center space-x-3"><Briefcase className="text-amber-600"/><div><p className="text-2xl font-bold">{stats.totalBookings}</p><p className="text-xs text-gray-500">Total Bookings</p></div></div></CardContent></Card>
            <Card className="shadow-lg bg-white/60 backdrop-blur-xl border-white/20"><CardContent className="pt-6"><div className="flex items-center space-x-3"><Calendar className="text-amber-600"/><div><p className="text-2xl font-bold">{stats.totalNights}</p><p className="text-xs text-gray-500">Nights Stayed</p></div></div></CardContent></Card>
            <Card className="shadow-lg bg-white/60 backdrop-blur-xl border-white/20"><CardContent className="pt-6"><div className="flex items-center space-x-3"><DollarSign className="text-amber-600"/><div><p className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</p><p className="text-xs text-gray-500">Total Spent</p></div></div></CardContent></Card>
            <Card className="shadow-lg bg-white/60 backdrop-blur-xl border-white/20"><CardContent className="pt-6"><div className="flex items-center space-x-3"><Star className="text-amber-600"/><div><p className="text-2xl font-bold">Gold Tier</p><p className="text-xs text-gray-500">Loyalty Status</p></div></div></CardContent></Card>
        </div>

        {/* Tabs for Profile Management */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-md rounded-lg p-1">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <Card className="mt-4 shadow-lg bg-white/60 backdrop-blur-xl border-white/20 rounded-xl">
            <TabsContent value="personal" className="mt-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Personal Information</CardTitle>
                    {!isEditing && <Button variant="outline" onClick={() => setIsEditing(true)}><Edit size={14} className="mr-2"/>Edit Profile</Button>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div><Label>First Name</Label><Input value={profileData.firstName} onChange={(e) => setProfileData(p => ({...p, firstName: e.target.value}))} disabled={!isEditing} /></div>
                    <div><Label>Last Name</Label><Input value={profileData.lastName} onChange={(e) => setProfileData(p => ({...p, lastName: e.target.value}))} disabled={!isEditing} /></div>
                    <div><Label>Email</Label><Input type="email" value={profileData.email} onChange={(e) => setProfileData(p => ({...p, email: e.target.value}))} disabled={!isEditing} /></div>
                    <div><Label>Phone</Label><Input type="tel" value={profileData.phone} onChange={(e) => setProfileData(p => ({...p, phone: e.target.value}))} disabled={!isEditing} /></div>
                 </div>
                 {isEditing && (
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                 )}
              </CardContent>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
                <CardHeader><CardTitle>Stay Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div><Label>Preferred Room Type</Label><Select defaultValue="suite"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="suite">Suite</SelectItem></SelectContent></Select></div>
                        <div><Label>Bed Type</Label><Select defaultValue="king"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="king">King</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><Label htmlFor="newsletter">Subscribe to newsletter</Label><Switch id="newsletter" checked={preferences.newsletter} onCheckedChange={(c) => setPreferences(p => ({...p, newsletter: c}))} /></div>
                        <div className="flex items-center justify-between"><Label htmlFor="sms">SMS notifications for bookings</Label><Switch id="sms" checked={preferences.smsNotifications} onCheckedChange={(c) => setPreferences(p => ({...p, smsNotifications: c}))} /></div>
                    </div>
                </CardContent>
            </TabsContent>

             <TabsContent value="security" className="mt-0">
                <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div><h4 className="font-semibold">Change Password</h4><p className="text-sm text-gray-500">Last changed 3 months ago</p></div>
                        <Button>Change</Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div><h4 className="font-semibold">Two-Factor Authentication</h4><p className="text-sm text-gray-500">Keep your account extra secure.</p></div>
                        <Button variant="destructive">Enable 2FA</Button>
                    </div>
                </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </main>
    </div>
  )
}
