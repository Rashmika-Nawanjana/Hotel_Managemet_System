// app/admin/settings/page.tsx
'use client'

import { useState } from 'react'
import AdminSidebar from '@/app/components/AdminSidebar'

// Reusable components matching the dashboard theme
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-6 border-b border-gray-800 ${className}`}>{children}</div>;
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-6 ${className}`}>{children}</div>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`w-full p-3 bg-[#10141c] border border-gray-700 rounded-md focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ${props.className}`} />
);
const Button = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <button className={`px-6 py-2 bg-amber-400 text-black font-semibold rounded-md hover:bg-amber-500 transition-colors ${className}`}>{children}</button>
);


export default function SettingsPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Mock user data - in a real app, this would come from an auth context or API
  const user = {
      name: 'Rashmika Nawanjana',
      email: 'admin@skynest.lk',
      phone: '+94 77 123 4567',
      twoFactorEnabled: true,
  };

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'pl-24' : 'pl-72'}`}>
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white font-l">Settings</h1>
            <p className="text-gray-400">Manage your account and system preferences.</p>
          </header>

          <div className="space-y-8">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-white font-l">Profile Information</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <Input type="text" defaultValue={user.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <Input type="email" defaultValue={user.email} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Telephone Number</label>
                  <Input type="tel" defaultValue={user.phone} />
                </div>
              </CardContent>
              <div className="p-6 bg-gray-800/20 border-t border-gray-800 text-right">
                <Button>Update Profile</Button>
              </div>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-white font-l">Change Password</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </CardContent>
               <div className="p-6 bg-gray-800/20 border-t border-gray-800 text-right">
                <Button>Update Password</Button>
              </div>
            </Card>
            
            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-white font-l">Two-Factor Authentication (2FA)</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-white">Status</h3>
                        <p className="text-sm text-gray-500">
                            {user.twoFactorEnabled 
                                ? "Two-factor authentication is currently enabled."
                                : "Add an extra layer of security to your account."
                            }
                        </p>
                    </div>
                    <button className={`px-4 py-2 text-sm font-semibold rounded-md ${user.twoFactorEnabled ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

