// components/AdminSidebar.tsx
"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LineChart, Briefcase, Building, Home, Users, FileText, Settings, LogOut, ChevronLeft } from 'lucide-react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: "/admin/dashboard", icon: LineChart, label: "Dashboard" },
  { href: "/admin/reports", icon: FileText, label: "Reports" },
  { href: "/admin/bookings", icon: Briefcase, label: "Bookings" },
  { href: "/admin/branches", icon: Building, label: "Branches" },
  { href: "/admin/rooms", icon: Home, label: "Rooms" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    animationRef.current = gsap.timeline({ paused: true })
      .to(".nav-text, .bottom-nav", { opacity: 0, duration: 0.2, ease: 'power2.in' })
      .to(sidebarRef.current, { width: '6rem', duration: 0.4, ease: 'power3.inOut' }, "-=0.1");
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      animationRef.current?.play();
    } else {
      animationRef.current?.reverse();
    }
  }, [isCollapsed]);

  return (
    <aside ref={sidebarRef} className="fixed top-0 left-0 pg-10 h-screen bg-[#181d28] border-r border-gray-800 p-6 flex flex-col w-72 flex-shrink-0 z-50">
      <div className="flex items-center justify-between mb-10 w-full h-[50px]">
        <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
           <Image src="/skyad.png" alt="Sky Nest Admin" width={180} height={50} className="w-auto h-auto"/>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="bg-transparent p-1.5 hover:bg-gray-700/50 rounded-md">
          <ChevronLeft size={20} className={`text-gray-400 transition-transform duration-500 ease-in-out ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex flex-col space-y-2 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.label} href={item.href}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-colors duration-200 relative focus:outline-none
                ${isActive 
                  ? 'bg-amber-400/10 text-amber-400 font-semibold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
                <div className={`absolute left-0 top-0 h-full w-1 bg-amber-400 rounded-r-full transition-opacity duration-300 ${isActive ? 'opacity-100 shadow-[0_0_15px_2px_#fbbf24]' : 'opacity-0'}`}></div>
                <item.icon size={22} className="flex-shrink-0 ml-2" />
                <span className="nav-text font-l font-light whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="bottom-nav mt-auto">
        <Link href="/admin/settings" className="flex items-center space-x-3 px-4 py-2 rounded-md text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
          <Settings size={18} /><span>Settings</span>
        </Link>
         <Link href="/auth/admin-login" className="flex items-center space-x-3 px-4 py-2 rounded-md text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
          <LogOut size={18} /><span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}

