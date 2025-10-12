// app/guest/booking/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useBookingStore, Room } from '@/app/components/BookingContext';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import GuestNavbar from '@/app/components/GuestNavbar';

// Mock data, easily replaceable with API calls
const destinations = [
    { id: 'colombo', name: 'Sky Nest Colombo', image: '/M1.jpg', category: 'COLOMBO HOTELS' },
    { id: 'kandy', name: 'Sky Nest Kandy', image: '/M2.jpg', category: 'KANDY HILLS' },
    { id: 'galle', name: 'Sky Nest Galle', image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=1974&auto=format&fit=crop', category: 'GALLE FORT' },
];

const RoomGuestCounter: React.FC<{ room: Room; index: number }> = ({ room, index }) => {
    const { updateRoom, removeRoom } = useBookingStore();
    const handleChange = (field: keyof Room, delta: number) => {
        const newValue = room[field] + delta;
        if (newValue >= 0 && (field !== 'adults' || newValue >= 1)) {
            updateRoom(index, { [field]: newValue });
        }
    };
    return (
        <div className="border rounded-lg p-6 w-full bg-white/50">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold uppercase text-amber-800">Room {index + 1}</h4>
                {index > 0 && <button onClick={() => removeRoom(index)} className="text-xs uppercase font-semibold text-gray-500 hover:text-red-500">Remove</button>}
            </div>
            <div className="space-y-4">
                {(['adults', 'children', 'infants'] as const).map(type => (
                    <div key={type} className="flex justify-between items-center">
                        <div>
                            <p className="capitalize font-semibold text-gray-800">{type}</p>
                            <p className="text-xs text-gray-500">{type === 'adults' ? '12+ years' : (type === 'children' ? '2-11 years' : 'Under 2')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleChange(type, -1)} className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-gray-100"><Minus size={16}/></button>
                            <span className="font-semibold w-4 text-center text-gray-800">{room[type]}</span>
                            <button onClick={() => handleChange(type, 1)} className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-gray-100"><Plus size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function BookingPage() {
    const { destination, dates, rooms, setDestination, setDates, addRoom } = useBookingStore();
    const [currentView, setCurrentView] = useState<'destinations' | 'dates' | 'rooms'>('destinations');

    const totalGuests = rooms.reduce((acc: number, room: Room) => acc + room.adults + room.children, 0);

    const renderView = () => {
        switch (currentView) {
            case 'destinations':
                return (
                     <div className="p-8">
                        <h1 className="text-4xl font-l text-center mb-12 text-gray-800">Destinations</h1>
                        <div className="grid md:grid-cols-3 gap-8">
                            {destinations.map(dest => (
                                <div key={dest.id} onClick={() => { setDestination(dest); setCurrentView('dates'); }} className="cursor-pointer group">
                                    <div className="overflow-hidden rounded-lg mb-4">
                                        <Image src={dest.image} alt={dest.name} width={400} height={500} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"/>
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase">{dest.category}</p>
                                    <h3 className="font-semibold text-gray-800">{dest.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'dates':
                return (
                    <div className="p-8 flex flex-col items-center">
                        <h1 className="text-4xl font-l mb-8 text-gray-800">Stay Dates</h1>
                        <DayPicker
                            mode="range"
                            numberOfMonths={2}
                            selected={dates}
                            onSelect={(range) => {
                                setDates(range);
                                if (range?.from && range?.to) setCurrentView('rooms');
                            }}
                            className="w-full"
                            classNames={{ 
                                root: 'p-4 border bg-white/50 rounded-lg w-full',
                                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                                month: 'space-y-4 w-full',
                                caption_label: "text-lg font-medium",
                                head_row: "flex w-full justify-between",
                                head_cell: "text-gray-500 uppercase w-[14.28%] text-xs",
                                row: "flex w-full mt-2 justify-between",
                                cell: "text-center text-sm p-0 relative w-[14.28%]",
                                day: "h-12 w-full p-0 font-normal hover:bg-amber-100 rounded-md",
                                day_selected: 'bg-amber-500 text-black rounded-md', 
                                day_today: 'text-amber-600 font-bold',
                                day_range_middle: "bg-amber-100",
                                day_range_start: "rounded-r-none",
                                day_range_end: "rounded-l-none",
                            }}
                        />
                    </div>
                );
            case 'rooms':
                 return (
                    <div className="p-8">
                        <h1 className="text-4xl font-l text-center mb-12 text-gray-800">Rooms & Guests</h1>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {rooms.map((room, index) => <RoomGuestCounter key={index} room={room} index={index} />)}
                        </div>
                        <button onClick={addRoom} className="text-sm font-semibold border-b border-gray-800 text-gray-800">
                            + Add another room
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-t from-amber-700/40 to-amber-50 text-gray-800">
            <GuestNavbar />
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/60 backdrop-blur-lg shadow-md pt-[73px]">
                 <div className="flex items-center divide-x container mx-auto">
                    <button onClick={() => setCurrentView('destinations')} className="flex-1 px-4 py-3 hover:bg-gray-50/50 text-left">
                        <p className="text-xs uppercase font-semibold text-gray-500">Destination</p>
                        <p className="font-semibold truncate text-gray-800">{destination?.name || 'Select Destination'}</p>
                    </button>
                    <button onClick={() => setCurrentView('dates')} className="flex-1 px-4 py-3 hover:bg-gray-50/50 text-left">
                        <p className="text-xs uppercase font-semibold text-gray-500">Stay Dates</p>
                        <p className="font-semibold text-gray-800">{dates?.from && dates?.to ? `${format(dates.from, 'd MMM')} - ${format(dates.to, 'd MMM, yyyy')}` : 'Select Dates'}</p>
                    </button>
                    <button onClick={() => setCurrentView('rooms')} className="flex-1 px-4 py-3 hover:bg-gray-50/50 text-left">
                        <p className="text-xs uppercase font-semibold text-gray-500">Rooms & Guests</p>
                        <p className="font-semibold text-gray-800">{rooms.length} Room, {totalGuests} Guest{totalGuests > 1 ? 's' : ''}</p>
                    </button>
                    <div className="flex-initial pl-4">
                        <Link href="/guest/search-rooms">
                            <button className="bg-amber-500 text-black font-semibold px-8 py-4 rounded-md hover:bg-amber-600 transition-colors h-full">
                                Search Rooms
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="pt-[154px]">
                <div className="flex">
                    <div className="w-2/3">
                        {renderView()}
                    </div>
                    <div className="w-1/3 p-8 border-l border-white/50">
                         <div className="sticky top-[154px]">
                            <Image src="/M1.jpg" alt="Hotel View" width={600} height={800} className="rounded-lg object-cover h-[70vh] w-full"/>
                             <div className="mt-4">
                                <h3 className="font-bold text-lg text-gray-900">Experience Sky Nest</h3>
                                <p className="text-gray-600 mt-2 font-l">Sky Nest is more than a destination—it's a bold new heartbeat for luxury travel. Discover a world where every moment is designed to inspire, surprise, and delight.</p>
                            </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

