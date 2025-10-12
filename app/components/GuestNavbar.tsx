// components/GuestNavbar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, CalendarDays, User, BedDouble } from 'lucide-react';
import AnimatedButton from './AnimatedButton';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: "/guest/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/guest/my-bookings", icon: CalendarDays, label: "My Bookings" },
    { href: "/guest/profile", icon: User, label: "Profile" },
    { href: "/guest/search-rooms", icon: BedDouble, label: "Rooms" },
];

const NavItem = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    return (
        <Link href={href} className="relative flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 ease-in-out group focus:outline-none">
            <div className={`absolute inset-0 rounded-full transition-all duration-300 ease-in-out group-hover:bg-gray-200/50 ${isActive ? 'bg-amber-100/80 scale-100' : 'scale-0 group-hover:scale-100'}`}></div>
            <Icon className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-amber-700' : 'text-gray-600'}`} />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity delay-300 pointer-events-none transform group-hover:translate-x-0 -translate-x-2">
                {label}
            </div>
        </Link>
    );
};

export default function GuestNavbar() {
    return (
        <header className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3">
                    <Image src="/SNC.png" alt="Sky Nest Logo" width={150} height={40} />
                </Link>

                {/* Navigation and Actions */}
                <div className="flex items-center space-x-4">
                    <nav className="flex items-center space-x-2">
                        {navItems.map(item => <NavItem key={item.label} {...item} />)}
                    </nav>
                    <div className="w-px h-8 bg-gray-300/50"></div>
                    <AnimatedButton href="/guest/booking">
                        Book Now
                    </AnimatedButton>
                </div>
            </div>
        </header>
    );
}

