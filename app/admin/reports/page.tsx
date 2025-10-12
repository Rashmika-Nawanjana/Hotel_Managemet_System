// app/admin/reports/page.tsx
'use client'

import { useState } from 'react'
import AdminSidebar from '@/app/components/AdminSidebar'
import { ArrowUpRight, Download, BarChart as BarChartIcon, LineChart as LineChartIcon } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// --- Reusable Themed Components ---
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#181d28] border border-gray-800 rounded-xl ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-6 border-b border-gray-800 ${className}`}>{children}</div>;
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-6 ${className}`}>{children}</div>;
const Select = ({ children, value, onChange, className }: any) => (
  <select value={value} onChange={onChange} className={`w-full p-3 bg-[#10141c] border border-gray-700 rounded-md focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ${className}`}>{children}</select>
);
const ToggleGroup = ({ children, className }: any) => <div className={`flex space-x-1 bg-[#10141c] p-1 rounded-md ${className}`}>{children}</div>
const ToggleGroupItem = ({ children, value, active, onClick, className }: any) => <button onClick={onClick} className={`p-1.5 rounded-sm transition-colors ${active ? 'bg-amber-400 text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} ${className}`}>{children}</button>

// --- New Glowing Chart Component ---
const RevenueChart = ({ data }: { data: any[] }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c0f14] p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-400">{label}</p>
          <p className="font-bold text-amber-400">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="select-none">
      <div className="flex justify-end mb-4">
        <ToggleGroup>
          <ToggleGroupItem value="area" active={chartType === 'area'} onClick={() => setChartType('area')}><LineChartIcon className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="bar" active={chartType === 'bar'} onClick={() => setChartType('bar')}><BarChartIcon className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        {chartType === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenueArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/></linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fbbf24', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} fill="url(#colorRevenueArea)" filter="url(#glow)" />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
             <defs>
              <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0.2}/></linearGradient>
               <filter id="glowBar" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="revenue" fill="url(#colorRevenueBar)" radius={[4, 4, 0, 0]} filter="url(#glowBar)" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// --- Main Page Component ---
export default function AdminReportsPage() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Mock data
  const reportTypes = [
    { id: 'overview', name: 'Business Overview' }, { id: 'revenue', name: 'Revenue Report' },
  ];
  const stats = {
    totalRevenue: 458920, totalBookings: 1247, occupancyRate: 78, avgRating: 4.7
  };
  const revenueData = [
    { name: 'Apr', revenue: 320000 }, { name: 'May', revenue: 345000 }, { name: 'Jun', revenue: 380000 },
    { name: 'Jul', revenue: 420000 }, { name: 'Aug', revenue: 458000 }, { name: 'Sep', revenue: 490000 }
  ];

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed}
      />
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'pl-24' : 'pl-72'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-l">Reports & Analytics</h1>
              <p className="text-gray-400">Comprehensive business insights and performance metrics.</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-amber-400 text-black font-semibold rounded-md hover:bg-amber-500 transition-colors">
              <Download size={16} />
              <span>Export PDF</span>
            </button>
          </header>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="grid md:grid-cols-3 gap-6 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Report Type</label>
                <Select value={selectedReport} onChange={(e: any) => setSelectedReport(e.target.value)}>
                  {reportTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Time Period</label>
                <Select value={selectedPeriod} onChange={(e: any) => setSelectedPeriod(e.target.value)}>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Branch</label>
                <Select value={selectedBranch} onChange={(e: any) => setSelectedBranch(e.target.value)}>
                  <option value="all">All Branches</option>
                  <option value="colombo">Colombo</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
             <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2"><p className="text-sm text-gray-400">Total Revenue</p><span className="text-xs text-green-400 flex items-center"><ArrowUpRight size={12} className="mr-1"/>+12.5%</span></div>
                  <p className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2"><p className="text-sm text-gray-400">Total Bookings</p><span className="text-xs text-green-400 flex items-center"><ArrowUpRight size={12} className="mr-1"/>+8.3%</span></div>
                  <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2"><p className="text-sm text-gray-400">Occupancy Rate</p><span className="text-xs text-green-400 flex items-center"><ArrowUpRight size={12} className="mr-1"/>+5.2%</span></div>
                  <p className="text-3xl font-bold text-white">{stats.occupancyRate}%</p>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2"><p className="text-sm text-gray-400">Average Rating</p><span className="text-xs text-green-400 flex items-center"><ArrowUpRight size={12} className="mr-1"/>+0.3</span></div>
                  <p className="text-3xl font-bold text-white">{stats.avgRating}</p>
                </CardContent>
             </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-white font-l">Revenue Trend</h2>
              </CardHeader>
              <CardContent>
                <RevenueChart data={revenueData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

