// app/admin/reports/page.tsx
'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/app/components/AdminSidebar'
import { ArrowUpRight, Download, BarChart as BarChartIcon, LineChart as LineChartIcon, Loader2 } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { 
  generateSimplePDF, 
  generateGuestDemographicsPDF, 
  generateRoomUtilizationPDF, 
  generateStaffPerformancePDF,
  ReportData,
  GuestDemographicsData,
  RoomUtilizationData,
  StaffPerformanceData
} from '@/lib/pdf-export'

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ReportData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Report types
  const reportTypes = [
    { id: 'overview', name: 'Business Overview' }, 
    { id: 'revenue', name: 'Revenue Report' },
    { id: 'room-utilization', name: 'Room Utilization' },
    { id: 'guest-demographics', name: 'Guest Demographics' },
    { id: 'staff-performance', name: 'Staff Performance' },
  ];

  // Fetch reports data
  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      let apiUrl = '';
      const params = new URLSearchParams({
        period: selectedPeriod,
        branchId: selectedBranch
      });

      // Route to different API endpoints based on report type
      switch (selectedReport) {
        case 'overview':
        case 'revenue':
          apiUrl = `/api/admin/reports?${params}&reportType=${selectedReport}`;
          break;
        case 'room-utilization':
          apiUrl = `/api/admin/reports/room-utilization?${params}`;
          break;
        case 'guest-demographics':
          apiUrl = `/api/admin/reports/guest-demographics?${params}`;
          break;
        case 'staff-performance':
          apiUrl = `/api/admin/reports/staff-performance?${params}`;
          break;
        default:
          apiUrl = `/api/admin/reports?${params}&reportType=overview`;
      }

      const response = await fetch(apiUrl, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod, selectedBranch, selectedReport]);

  // Handle filter changes
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
  };

  const handleReportChange = (reportType: string) => {
    setSelectedReport(reportType);
  };

  // PDF Export functions
  const handleExportPDF = async () => {
    if (!data) {
      alert('No data available to export');
      return;
    }

    try {
      setIsExporting(true);
      
      // Get branches for branch name resolution
      const branchesResponse = await fetch('/api/branches');
      const branchesData = await branchesResponse.json();
      const branches = branchesData.data || [];

      // Export based on report type
      switch (selectedReport) {
        case 'revenue':
          await generateSimplePDF(data as ReportData);
          break;
        case 'guest-demographics':
          await generateGuestDemographicsPDF(data as GuestDemographicsData, branches);
          break;
        case 'room-utilization':
          await generateRoomUtilizationPDF(data as RoomUtilizationData, branches);
          break;
        case 'staff-performance':
          await generateStaffPerformancePDF(data as StaffPerformanceData, branches);
          break;
        default:
          await generateSimplePDF(data as ReportData);
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      console.error('Error details:', {
        selectedReport,
        dataKeys: data ? Object.keys(data) : 'no data',
        dataType: typeof data
      });
      alert(`Failed to export PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#10141c] text-gray-300 flex">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed}
      />
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'pl-24' : 'pl-72'}`}>
        <div id="reports-content" className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white font-l">Reports & Analytics</h1>
              <p className="text-gray-400">Comprehensive business insights and performance metrics.</p>
            </div>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting || !data}
              className="flex items-center space-x-2 px-6 py-3 bg-amber-400 text-black font-semibold rounded-md hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Download size={18} />
              <span>{isExporting ? 'Generating Report...' : 'Export PDF Report'}</span>
            </button>
          </header>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="grid md:grid-cols-3 gap-6 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Report Type</label>
                <Select value={selectedReport} onChange={(e: any) => handleReportChange(e.target.value)}>
                  {reportTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Time Period</label>
                <Select value={selectedPeriod} onChange={(e: any) => handlePeriodChange(e.target.value)}>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Branch</label>
                <Select value={selectedBranch} onChange={(e: any) => handleBranchChange(e.target.value)}>
                  <option value="all">All Branches</option>
                  {data?.branches?.map((branch: any) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-400">
                  <span className="mr-2">⚠️</span>
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {/* Key Metrics - Only for overview and revenue reports */}
          {(selectedReport === 'overview' || selectedReport === 'revenue') && (
            <>
              {isLoading ? (
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-center h-24">
                          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* Key Metrics */
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                   <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-400">Total Revenue</p>
                          <span className="text-xs text-green-400 flex items-center">
                            <ArrowUpRight size={12} className="mr-1"/>
                            +12.5%
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          ${data?.stats?.totalRevenue?.toLocaleString() || '0'}
                        </p>
                      </CardContent>
                   </Card>
                   <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-400">Total Bookings</p>
                          <span className="text-xs text-green-400 flex items-center">
                            <ArrowUpRight size={12} className="mr-1"/>
                            +8.3%
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {data?.stats?.totalBookings?.toLocaleString() || '0'}
                        </p>
                      </CardContent>
                   </Card>
                   <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-400">Occupancy Rate</p>
                          <span className="text-xs text-green-400 flex items-center">
                            <ArrowUpRight size={12} className="mr-1"/>
                            +5.2%
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {data?.stats?.occupancyRate?.toFixed(1) || '0'}%
                        </p>
                      </CardContent>
                   </Card>
                   <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-400">Average Rating</p>
                          <span className="text-xs text-green-400 flex items-center">
                            <ArrowUpRight size={12} className="mr-1"/>
                            +0.3
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {data?.stats?.avgRating?.toFixed(1) || '0.0'}
                        </p>
                      </CardContent>
                   </Card>
                </div>
              )}
            </>
          )}
          
          {/* Revenue Chart - Only for overview and revenue reports */}
          {!isLoading && (selectedReport === 'overview' || selectedReport === 'revenue') && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-white font-l">Revenue Trend</h2>
              </CardHeader>
              <CardContent>
                  {data?.trendData?.length > 0 ? (
                    <RevenueChart data={data.trendData} />
                  ) : (
                    <div className="flex items-center justify-center h-80 text-gray-400">
                      <div className="text-center">
                        <BarChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No data available for the selected period</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Room Type Performance - Only for overview/revenue reports */}
          {!isLoading && (selectedReport === 'overview' || selectedReport === 'revenue') && data?.roomTypePerformance?.length > 0 && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-white font-l">Top Performing Room Types</h2>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Room Type</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Bookings</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.roomTypePerformance.map((room: any, index: number) => (
                          <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="py-3 px-4 text-white font-medium">{room.room_type}</td>
                            <td className="py-3 px-4 text-right text-gray-300">{room.bookings}</td>
                            <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                              ${parseFloat(room.revenue).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              ${parseFloat(room.avg_booking_value).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Room Utilization Report */}
          {!isLoading && selectedReport === 'room-utilization' && data && (
            <div className="mt-8 space-y-6">
              {/* Room Status Summary */}
              {data.statusSummary && data.statusSummary.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-white font-l">Room Status Summary</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {data.statusSummary.map((status: any, index: number) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-white">{status.count}</div>
                          <div className="text-gray-400 capitalize">{status.status.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-500">{status.branch_name}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Maintenance Alerts */}
              {data.maintenanceAlerts && data.maintenanceAlerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-white font-l">Maintenance Alerts</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Room</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Alert</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Cleaned</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Maintenance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.maintenanceAlerts.map((alert: any, index: number) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="py-3 px-4 text-white font-medium">{alert.roomNumber}</td>
                              <td className="py-3 px-4 text-gray-300">{alert.room_type}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  alert.alert_type === 'NEEDS_CLEANING' ? 'bg-yellow-900 text-yellow-200' :
                                  alert.alert_type === 'NEEDS_MAINTENANCE' ? 'bg-red-900 text-red-200' :
                                  'bg-green-900 text-green-200'
                                }`}>
                                  {alert.alert_type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-300">
                                {alert.lastCleaned ? new Date(alert.lastCleaned).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="py-3 px-4 text-gray-300">
                                {alert.lastMaintenance ? new Date(alert.lastMaintenance).toLocaleDateString() : 'Never'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Guest Demographics Report */}
          {!isLoading && selectedReport === 'guest-demographics' && data && (
            <div className="mt-8 space-y-6">
              {/* Age Group Distribution */}
              {data.ageGroupDistribution && data.ageGroupDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-white font-l">Age Group Distribution</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.ageGroupDistribution.map((group: any, index: number) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-white">{group.count}</div>
                          <div className="text-gray-400">{group.age_group}</div>
                          <div className="text-sm text-gray-500">
                            Avg Spent: ${parseFloat(group.avg_spent || 0).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Spenders */}
              {data.topSpenders && data.topSpenders.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-white font-l">Top Spenders</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Guest</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Spent</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Bookings</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Loyalty Points</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Nationality</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.topSpenders.map((guest: any, index: number) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="py-3 px-4 text-white font-medium">
                                {guest.firstname} {guest.lastname}
                              </td>
                              <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                                ${parseFloat(guest.totalSpent || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-300">{guest.totalBookings || 0}</td>
                              <td className="py-3 px-4 text-right text-gray-300">{guest.loyaltyPoints || 0}</td>
                              <td className="py-3 px-4 text-gray-300">{guest.nationality}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Staff Performance Report */}
          {!isLoading && selectedReport === 'staff-performance' && data && (
            <div className="mt-8 space-y-6">
              {/* Department Performance */}
              {data.departmentPerformance && data.departmentPerformance.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-white font-l">Department Performance</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Staff Count</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg Rating</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg Services</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg Salary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.departmentPerformance.map((dept: any, index: number) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="py-3 px-4 text-white font-medium">{dept.department}</td>
                              <td className="py-3 px-4 text-right text-gray-300">{dept.staff_count}</td>
                              <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                                {parseFloat(dept.avg_rating || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-300">{Math.round(dept.avg_services || 0)}</td>
                              <td className="py-3 px-4 text-right text-gray-300">
                                ${parseFloat(dept.avg_salary || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Performers */}
              {data.topPerformers && data.topPerformers.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-white font-l">Top Performers</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Employee</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Rating</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Services</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Tenure</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.topPerformers.map((staff: any, index: number) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="py-3 px-4 text-white font-medium">
                                {staff.firstname} {staff.lastname}
                              </td>
                              <td className="py-3 px-4 text-gray-300">{staff.department}</td>
                              <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                                {parseFloat(staff.rating || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-300">{staff.totalServices || 0}</td>
                              <td className="py-3 px-4 text-right text-gray-300">{staff.years_of_service || 0} years</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

