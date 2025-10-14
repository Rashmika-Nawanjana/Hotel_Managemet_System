// components/StaffNavbar.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Clock, LogIn } from 'lucide-react';

interface StaffMember {
    name: string;
    role: string;
}

interface StaffNavbarProps {
    staffMember: StaffMember;
}

export default function StaffNavbar({ staffMember }: StaffNavbarProps) {
    const [isClockedIn, setIsClockedIn] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="bg-[#181d28] border-b border-gray-800 p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-3">
                    <Image src="/SNC.png" alt="Sky Nest Logo" width={150} height={40} />
                </Link>

                <div className="flex items-center space-x-6">
                    {/* Clock-in/Clock-out Button */}
                    <button 
                        onClick={() => setIsClockedIn(!isClockedIn)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors
                        ${isClockedIn 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                    >
                        {isClockedIn ? <LogOut size={16} /> : <LogIn size={16} />}
                        <span>{isClockedIn ? 'Clock Out' : 'Clock In'}</span>
                    </button>
                    
                    {/* Time Display */}
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-white">{currentTime.toLocaleTimeString()}</p>
                        <p className="text-xs text-gray-400">{currentTime.toLocaleDateString()}</p>
                    </div>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="font-semibold text-white text-sm">{staffMember.name}</p>
                                    <p className="text-xs text-gray-500">{staffMember.role}</p>
                                </div>
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{staffMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuItem><User size={14} className="mr-2" /> My Profile</DropdownMenuItem>
                            <DropdownMenuItem><Clock size={14} className="mr-2" /> My Schedule</DropdownMenuItem>
                            <DropdownMenuItem><Link href="/auth/staff-login" className="flex items-center w-full"><LogOut size={14} className="mr-2" /> Sign Out</Link></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
