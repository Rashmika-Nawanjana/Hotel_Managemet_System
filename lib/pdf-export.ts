import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Ensure jsPDF is available
if (typeof window !== 'undefined' && !window.jsPDF) {
  console.error('jsPDF not available in browser environment')
}


export interface ReportData {
  stats: {
    totalRevenue: number
    totalBookings: number
    occupancyRate: number
    avgRating: number
    totalReviews: number
  }
  trendData: Array<{
    name: string
    revenue: number
    bookings: number
  }>
  roomTypePerformance: Array<{
    room_type: string
    bookings: number
    revenue: number
    avg_booking_value: number
  }>
  period: string
  branchId: string
  reportType: string
  branches: Array<{
    id: string
    name: string
    location: string
  }>
}

export interface GuestDemographicsData {
  guestDemographics: Array<{
    id: string
    firstname: string
    lastname: string
    email: string
    phone: string
    dateofbirth: string
    nationality: string
    idtype: string
    member_since: string
    loyaltyPoints: number
    totalBookings: number
    totalSpent: number
    preferredRoomType: string
    preferredBedType: string
    smokingPreference: string
    floorPreference: string
    newsletter: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    age_group: string
  }>
  ageGroupDistribution: Array<{
    age_group: string
    count: number
    avg_spent: number
    avg_bookings: number
  }>
  nationalityDistribution: Array<{
    nationality: string
    count: number
    avg_spent: number
    avg_bookings: number
  }>
  loyaltyStats: {
    total_members: number
    active_members: number
    avg_points: number
    max_points: number
    avg_spent: number
    avg_bookings: number
  }
  topSpenders: Array<{
    firstname: string
    lastname: string
    email: string
    loyaltyPoints: number
    totalBookings: number
    totalSpent: number
    preferredRoomType: string
    nationality: string
  }>
  preferences: Array<{
    preferredRoomType: string
    preferredBedType: string
    smokingPreference: string
    floorPreference: string
    count: number
  }>
  branchId: string
  generatedAt: string
}

export interface RoomUtilizationData {
  roomUtilization: Array<{
    id: string
    roomNumber: string
    floor: number
    status: string
    lastCleaned: string
    lastMaintenance: string
    room_type: string
    basePrice: number
    branch_name: string
    branch_location: string
    days_since_cleaned: number
    days_since_maintenance: number
  }>
  statusSummary: Array<{
    status: string
    count: number
    branch_name: string
  }>
  maintenanceAlerts: Array<{
    id: string
    roomNumber: string
    floor: number
    status: string
    room_type: string
    branch_name: string
    lastCleaned: string
    lastMaintenance: string
    alert_type: string
  }>
  occupancyTrends: Array<{
    date: string
    occupied_rooms: number
    available_rooms: number
    total_rooms: number
  }>
  branchId: string
  generatedAt: string
}

export interface StaffPerformanceData {
  staffPerformance: Array<{
    id: string
    firstname: string
    lastname: string
    email: string
    phone: string
    employeeId: string
    department: string
    position: string
    salary: number
    hireDate: string
    rating: number
    totalServices: number
    branch_name: string
    branch_location: string
    years_of_service: number
    performance_level: string
  }>
  departmentPerformance: Array<{
    department: string
    staff_count: number
    avg_rating: number
    avg_services: number
    avg_salary: number
    branch_name: string
  }>
  performanceLevels: Array<{
    performance_level: string
    count: number
    avg_rating: number
    avg_services: number
  }>
  topPerformers: Array<{
    firstname: string
    lastname: string
    employeeId: string
    department: string
    position: string
    rating: number
    totalServices: number
    salary: number
    branch_name: string
    years_of_service: number
  }>
  salaryAnalysis: Array<{
    department: string
    position: string
    count: number
    min_salary: number
    max_salary: number
    avg_salary: number
    branch_name: string
  }>
  tenureAnalysis: Array<{
    tenure_group: string
    count: number
    avg_rating: number
    avg_services: number
    avg_salary: number
  }>
  overallStats: {
    total_staff: number
    avg_rating: number
    avg_services: number
    avg_salary: number
    earliest_hire: string
    latest_hire: string
  }
  branchId: string
  generatedAt: string
}

export const generateReportsPDF = async (
  data: ReportData,
  elementId: string = 'reports-content'
): Promise<void> => {
  try {
    // Use the simple PDF generation instead of html2canvas to avoid color issues
    generateSimplePDF(data)
  } catch (error) {
    console.error('❌ Error generating PDF:', error)
    throw new Error('Failed to generate PDF report')
  }
}

export const generateGuestDemographicsPDF = async (
  data: GuestDemographicsData,
  branches: Array<{ id: string; name: string; location: string }>
): Promise<void> => {
  try {
    generateGuestDemographicsSimplePDF(data, branches)
  } catch (error) {
    console.error('❌ Error generating guest demographics PDF:', error)
    throw new Error('Failed to generate guest demographics PDF report')
  }
}

export const generateRoomUtilizationPDF = async (
  data: RoomUtilizationData,
  branches: Array<{ id: string; name: string; location: string }>
): Promise<void> => {
  try {
    generateRoomUtilizationSimplePDF(data, branches)
  } catch (error) {
    console.error('❌ Error generating room utilization PDF:', error)
    throw new Error('Failed to generate room utilization PDF report')
  }
}

export const generateStaffPerformancePDF = async (
  data: StaffPerformanceData,
  branches: Array<{ id: string; name: string; location: string }>
): Promise<void> => {
  try {
    generateStaffPerformanceSimplePDF(data, branches)
  } catch (error) {
    console.error('❌ Error generating staff performance PDF:', error)
    throw new Error('Failed to generate staff performance PDF report')
  }
}

export const generateSimplePDF = (data: ReportData): void => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Professional black and white styling
    const black = [0, 0, 0]
    const darkGray = [64, 64, 64]
    const lightGray = [128, 128, 128]
    const veryLightGray = [200, 200, 200]

    // Header with company branding
    pdf.setFillColor(240, 240, 240)
    pdf.rect(0, 0, pageWidth, 25, 'F')
    
    // Company name
    pdf.setFontSize(20)
    pdf.setTextColor(...black)
    pdf.setFont('helvetica', 'bold')
    pdf.text('HOTEL MANAGEMENT SYSTEM', pageWidth / 2, 12, { align: 'center' })
    
    // Report title
    pdf.setFontSize(16)
    pdf.setTextColor(...darkGray)
    pdf.setFont('helvetica', 'normal')
    pdf.text('BUSINESS INTELLIGENCE REPORT', pageWidth / 2, 18, { align: 'center' })

    // Report details section
    pdf.setFontSize(10)
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const period = data.period === 'year' ? 'This Year' : 'This Month'
    const branch = data.branchId === 'all' ? 'All Branches' : 
      data.branches.find(b => b.id === data.branchId)?.name || 'Unknown Branch'
    
    let yPos = 35
    pdf.text(`Report Period: ${period}`, 20, yPos)
    pdf.text(`Branch: ${branch}`, 20, yPos + 5)
    pdf.text(`Generated: ${reportDate}`, 20, yPos + 10)
    pdf.text(`Report ID: HMS-${Date.now().toString().slice(-6)}`, pageWidth - 20, yPos, { align: 'right' })

    // Divider line
    yPos += 20
    pdf.setDrawColor(...veryLightGray)
    pdf.line(20, yPos, pageWidth - 20, yPos)

    // Key Performance Indicators
    yPos += 15
    pdf.setFontSize(14)
    pdf.setTextColor(...black)
    pdf.setFont('helvetica', 'bold')
    pdf.text('KEY PERFORMANCE INDICATORS', 20, yPos)

    // KPI boxes
    yPos += 10
    const kpiData = [
      { label: 'Total Revenue', value: `$${data.stats.totalRevenue.toLocaleString()}`, width: 40 },
      { label: 'Total Bookings', value: data.stats.totalBookings.toLocaleString(), width: 40 },
      { label: 'Occupancy Rate', value: `${data.stats.occupancyRate.toFixed(1)}%`, width: 40 },
      { label: 'Average Rating', value: `${data.stats.avgRating.toFixed(1)}/5`, width: 40 }
    ]

    kpiData.forEach((kpi, index) => {
      const x = 20 + (index % 2) * 80
      const y = yPos + Math.floor(index / 2) * 25
      
      // KPI box
      pdf.setFillColor(248, 248, 248)
      pdf.rect(x, y - 8, 70, 20, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(x, y - 8, 70, 20, 'S')
      
      // KPI label
      pdf.setFontSize(8)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')
      pdf.text(kpi.label, x + 3, y - 2)
      
      // KPI value
      pdf.setFontSize(12)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text(kpi.value, x + 3, y + 5)
    })

    yPos += 50

    // Revenue Analysis
    if (data.trendData.length > 0) {
      pdf.setFontSize(14)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text('REVENUE ANALYSIS', 20, yPos)

      yPos += 10
      pdf.setFontSize(10)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')

      // Revenue trend table
      pdf.setFillColor(248, 248, 248)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'S')

      // Table headers
      pdf.setFont('helvetica', 'bold')
      pdf.text('Period', 25, yPos + 2)
      pdf.text('Revenue', 60, yPos + 2)
      pdf.text('Bookings', 100, yPos + 2)
      pdf.text('Avg/Booking', 140, yPos + 2)

      yPos += 8
      pdf.setFont('helvetica', 'normal')

      data.trendData.forEach((item, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage()
          yPos = 20
        }
        
        pdf.text(item.name, 25, yPos)
        pdf.text(`$${item.revenue.toLocaleString()}`, 60, yPos)
        pdf.text(item.bookings.toString(), 100, yPos)
        pdf.text(`$${(item.revenue / item.bookings).toFixed(2)}`, 140, yPos)
        yPos += 5
      })
    }

    yPos += 10

    // Room Type Performance
    if (data.roomTypePerformance.length > 0) {
      pdf.setFontSize(14)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ROOM TYPE PERFORMANCE', 20, yPos)

      yPos += 10
      pdf.setFontSize(10)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')

      // Performance table
      pdf.setFillColor(248, 248, 248)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'S')

      // Table headers
      pdf.setFont('helvetica', 'bold')
      pdf.text('Room Type', 25, yPos + 2)
      pdf.text('Bookings', 80, yPos + 2)
      pdf.text('Revenue', 110, yPos + 2)
      pdf.text('Avg Value', 150, yPos + 2)

      yPos += 8
      pdf.setFont('helvetica', 'normal')

      data.roomTypePerformance.slice(0, 15).forEach((room, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage()
          yPos = 20
        }
        
        pdf.text(room.room_type.substring(0, 25), 25, yPos)
        pdf.text(room.bookings.toString(), 80, yPos)
        pdf.text(`$${parseFloat(room.revenue).toLocaleString()}`, 110, yPos)
        pdf.text(`$${parseFloat(room.avg_booking_value).toFixed(2)}`, 150, yPos)
        yPos += 5
      })
    }

    // Footer
    const footerY = pageHeight - 15
    pdf.setFontSize(8)
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Generated by Hotel Management System', pageWidth / 2, footerY, { align: 'center' })
    pdf.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' })

    // Save the PDF
    const fileName = `HMS-Report-${data.period}-${data.branchId}-${Date.now()}.pdf`
    pdf.save(fileName)

    console.log('📄 Professional PDF exported successfully:', fileName)
  } catch (error) {
    console.error('❌ Error generating PDF:', error)
    throw new Error('Failed to generate PDF report')
  }
}

export const generateGuestDemographicsSimplePDF = (data: GuestDemographicsData, branches: Array<{ id: string; name: string; location: string }>): void => {
  try {
    // Validate data structure
    if (!data) {
      throw new Error('No data provided for PDF generation')
    }
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Professional black and white styling
    const black = [0, 0, 0]
    const darkGray = [64, 64, 64]
    const lightGray = [128, 128, 128]
    const veryLightGray = [200, 200, 200]

    // Header with company branding
    pdf.setFillColor(240, 240, 240)
    pdf.rect(0, 0, pageWidth, 25, 'F')
    
    // Company name
    pdf.setFontSize(20)
    pdf.setTextColor(...black)
    pdf.setFont('helvetica', 'bold')
    pdf.text('HOTEL MANAGEMENT SYSTEM', pageWidth / 2, 12, { align: 'center' })
    
    // Report title
    pdf.setFontSize(16)
    pdf.setTextColor(...darkGray)
    pdf.setFont('helvetica', 'normal')
    pdf.text('GUEST DEMOGRAPHICS REPORT', pageWidth / 2, 18, { align: 'center' })

    // Report details section
    pdf.setFontSize(10)
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const branch = data.branchId === 'all' ? 'All Branches' : 
      branches.find(b => b.id === data.branchId)?.name || 'Unknown Branch'
    
    let yPos = 35
    pdf.text(`Branch: ${branch}`, 20, yPos)
    pdf.text(`Generated: ${reportDate}`, 20, yPos + 5)
    pdf.text(`Report ID: HMS-GD-${Date.now().toString().slice(-6)}`, pageWidth - 20, yPos, { align: 'right' })

    // Divider line
    yPos += 20
    pdf.setDrawColor(...veryLightGray)
    pdf.line(20, yPos, pageWidth - 20, yPos)

    // Key Statistics
    yPos += 15
    pdf.setFontSize(14)
    pdf.setTextColor(...black)
    pdf.setFont('helvetica', 'bold')
    pdf.text('KEY STATISTICS', 20, yPos)

    // Stats boxes
    yPos += 10
    const loyaltyStats = data.loyaltyStats || {}
    
    // Handle null values properly
    const totalMembers = loyaltyStats.total_members ? parseInt(loyaltyStats.total_members.toString()) : 0
    const activeMembers = loyaltyStats.active_members ? parseInt(loyaltyStats.active_members.toString()) : 0
    const avgPoints = loyaltyStats.avg_points ? parseFloat(loyaltyStats.avg_points.toString()) : 0
    const avgSpent = loyaltyStats.avg_spent ? parseFloat(loyaltyStats.avg_spent.toString()) : 0
    
    const stats = [
      { label: 'Total Guests', value: totalMembers.toString() },
      { label: 'Active Members', value: activeMembers.toString() },
      { label: 'Avg Points', value: avgPoints.toFixed(0) },
      { label: 'Avg Spent', value: `$${avgSpent.toFixed(2)}` }
    ]

    stats.forEach((stat, index) => {
      const x = 20 + (index % 2) * 90
      const y = yPos + Math.floor(index / 2) * 25
      
      pdf.setFillColor(248, 248, 248)
      pdf.rect(x, y, 80, 20, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(x, y, 80, 20, 'S')
      
      pdf.setFontSize(8)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')
      pdf.text(stat.label, x + 3, y + 8)
      
      pdf.setFontSize(12)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text(stat.value, x + 3, y + 15)
    })

    yPos += 60

    // Age Group Distribution
    if (data.ageGroupDistribution && data.ageGroupDistribution.length > 0) {
      pdf.setFontSize(14)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text('AGE GROUP DISTRIBUTION', 20, yPos)

      yPos += 10
      pdf.setFontSize(10)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')

      // Table
      pdf.setFillColor(248, 248, 248)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'S')

      // Table headers
      pdf.setFont('helvetica', 'bold')
      pdf.text('Age Group', 25, yPos + 2)
      pdf.text('Count', 80, yPos + 2)
      pdf.text('Avg Spent', 120, yPos + 2)
      pdf.text('Avg Bookings', 160, yPos + 2)

      yPos += 8
      pdf.setFont('helvetica', 'normal')

      data.ageGroupDistribution.forEach((group, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage()
          yPos = 20
        }
        
        const avgSpent = group.avg_spent ? parseFloat(group.avg_spent.toString()) : 0
        const avgBookings = group.avg_bookings ? parseFloat(group.avg_bookings.toString()) : 0
        
        pdf.text(group.age_group || 'Unknown', 25, yPos)
        pdf.text(group.count?.toString() || '0', 80, yPos)
        pdf.text(`$${avgSpent.toFixed(2)}`, 120, yPos)
        pdf.text(avgBookings.toFixed(1), 160, yPos)
        yPos += 5
      })
    }

    yPos += 10

    // Top Spenders
    if (data.topSpenders && data.topSpenders.length > 0) {
      pdf.setFontSize(14)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text('TOP SPENDERS', 20, yPos)

      yPos += 10
      pdf.setFontSize(10)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')

      // Table
      pdf.setFillColor(248, 248, 248)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'S')

      // Table headers
      pdf.setFont('helvetica', 'bold')
      pdf.text('Name', 25, yPos + 2)
      pdf.text('Email', 80, yPos + 2)
      pdf.text('Total Spent', 140, yPos + 2)
      pdf.text('Bookings', 180, yPos + 2)

      yPos += 8
      pdf.setFont('helvetica', 'normal')

      data.topSpenders.slice(0, 10).forEach((spender, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage()
          yPos = 20
        }
        
        const totalSpent = spender.totalSpent ? parseFloat(spender.totalSpent.toString()) : 0
        const totalBookings = spender.totalBookings ? parseFloat(spender.totalBookings.toString()) : 0
        
        pdf.text(`${spender.firstname || ''} ${spender.lastname || ''}`, 25, yPos)
        pdf.text((spender.email || '').substring(0, 20), 80, yPos)
        pdf.text(`$${totalSpent.toFixed(2)}`, 140, yPos)
        pdf.text(totalBookings.toFixed(0), 180, yPos)
        yPos += 5
      })
    }

    // Footer
    const footerY = pageHeight - 15
    pdf.setFontSize(8)
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Generated by Hotel Management System', pageWidth / 2, footerY, { align: 'center' })
    pdf.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' })

    // Save the PDF
    const fileName = `HMS-Guest-Demographics-${data.branchId}-${Date.now()}.pdf`
    pdf.save(fileName)

    console.log('📄 Guest Demographics PDF exported successfully:', fileName)
  } catch (error) {
    console.error('❌ Error generating guest demographics PDF:', error)
    throw new Error('Failed to generate guest demographics PDF report')
  }
}

export const generateRoomUtilizationSimplePDF = (data: RoomUtilizationData, branches: Array<{ id: string; name: string; location: string }>): void => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Professional black and white styling
    const black = [0, 0, 0]
    const darkGray = [64, 64, 64]
    const lightGray = [128, 128, 128]
    const veryLightGray = [200, 200, 200]

    // Header with company branding
    pdf.setFillColor(240, 240, 240)
    pdf.rect(0, 0, pageWidth, 25, 'F')
    
    // Company name
    pdf.setFontSize(20)
    pdf.setTextColor(...black)
    pdf.setFont('helvetica', 'bold')
    pdf.text('HOTEL MANAGEMENT SYSTEM', pageWidth / 2, 12, { align: 'center' })
    
    // Report title
    pdf.setFontSize(16)
    pdf.setTextColor(...darkGray)
    pdf.setFont('helvetica', 'normal')
    pdf.text('ROOM UTILIZATION REPORT', pageWidth / 2, 18, { align: 'center' })

    // Report details section
    pdf.setFontSize(10)
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const branch = data.branchId === 'all' ? 'All Branches' : 
      branches.find(b => b.id === data.branchId)?.name || 'Unknown Branch'
    
    let yPos = 35
    pdf.text(`Branch: ${branch}`, 20, yPos)
    pdf.text(`Generated: ${reportDate}`, 20, yPos + 5)
    pdf.text(`Report ID: HMS-RU-${Date.now().toString().slice(-6)}`, pageWidth - 20, yPos, { align: 'right' })

    // Divider line
    yPos += 20
    pdf.setDrawColor(...veryLightGray)
    pdf.line(20, yPos, pageWidth - 20, yPos)

    // Room Status Summary
    yPos += 15
    pdf.setFontSize(14)
    pdf.setTextColor(...black)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ROOM STATUS SUMMARY', 20, yPos)

    yPos += 10
    pdf.setFontSize(10)
    pdf.setTextColor(...darkGray)
    pdf.setFont('helvetica', 'normal')

    // Status summary table
    pdf.setFillColor(248, 248, 248)
    pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F')
    pdf.setDrawColor(...lightGray)
    pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'S')

    // Table headers
    pdf.setFont('helvetica', 'bold')
    pdf.text('Status', 25, yPos + 2)
    pdf.text('Count', 80, yPos + 2)
    pdf.text('Branch', 120, yPos + 2)

    yPos += 8
    pdf.setFont('helvetica', 'normal')

    data.statusSummary.forEach((status, index) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage()
        yPos = 20
      }
      
      pdf.text(status.status, 25, yPos)
      pdf.text(status.count.toString(), 80, yPos)
      pdf.text(status.branch_name, 120, yPos)
      yPos += 5
    })

    yPos += 10

    // Maintenance Alerts
    if (data.maintenanceAlerts && data.maintenanceAlerts.length > 0) {
      pdf.setFontSize(14)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text('MAINTENANCE ALERTS', 20, yPos)

      yPos += 10
      pdf.setFontSize(10)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')

      // Table
      pdf.setFillColor(248, 248, 248)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'S')

      // Table headers
      pdf.setFont('helvetica', 'bold')
      pdf.text('Room', 25, yPos + 2)
      pdf.text('Floor', 60, yPos + 2)
      pdf.text('Type', 80, yPos + 2)
      pdf.text('Alert', 120, yPos + 2)
      pdf.text('Branch', 160, yPos + 2)

      yPos += 8
      pdf.setFont('helvetica', 'normal')

      data.maintenanceAlerts.slice(0, 15).forEach((alert, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage()
          yPos = 20
        }
        
        pdf.text(alert.roomNumber, 25, yPos)
        pdf.text(alert.floor.toString(), 60, yPos)
        pdf.text(alert.room_type.substring(0, 15), 80, yPos)
        pdf.text(alert.alert_type, 120, yPos)
        pdf.text(alert.branch_name, 160, yPos)
        yPos += 5
      })
    }

    // Footer
    const footerY = pageHeight - 15
    pdf.setFontSize(8)
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Generated by Hotel Management System', pageWidth / 2, footerY, { align: 'center' })
    pdf.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' })

    // Save the PDF
    const fileName = `HMS-Room-Utilization-${data.branchId}-${Date.now()}.pdf`
    pdf.save(fileName)

    console.log('📄 Room Utilization PDF exported successfully:', fileName)
  } catch (error) {
    console.error('❌ Error generating room utilization PDF:', error)
    throw new Error('Failed to generate room utilization PDF report')
  }
}

export const generateStaffPerformanceSimplePDF = (data: StaffPerformanceData, branches: Array<{ id: string; name: string; location: string }>): void => {
  try {
    // Validate data structure
    if (!data) {
      throw new Error('No data provided for PDF generation')
    }
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Professional black and white styling
    const black = [0, 0, 0]
    const darkGray = [64, 64, 64]
    const lightGray = [128, 128, 128]
    const veryLightGray = [200, 200, 200]

    // Header with company branding
    pdf.setFillColor(240, 240, 240)
    pdf.rect(0, 0, pageWidth, 25, 'F')
    
    // Company name
    pdf.setFontSize(20)
    pdf.setTextColor(...black)
    pdf.setFont('helvetica', 'bold')
    pdf.text('HOTEL MANAGEMENT SYSTEM', pageWidth / 2, 12, { align: 'center' })
    
    // Report title
    pdf.setFontSize(16)
    pdf.setTextColor(...darkGray)
    pdf.setFont('helvetica', 'normal')
    pdf.text('STAFF PERFORMANCE REPORT', pageWidth / 2, 18, { align: 'center' })

    // Report details section
    pdf.setFontSize(10)
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const branch = data.branchId === 'all' ? 'All Branches' : 
      branches.find(b => b.id === data.branchId)?.name || 'Unknown Branch'
    
    let yPos = 35
    pdf.text(`Branch: ${branch}`, 20, yPos)
    pdf.text(`Generated: ${reportDate}`, 20, yPos + 5)
    pdf.text(`Report ID: HMS-SP-${Date.now().toString().slice(-6)}`, pageWidth - 20, yPos, { align: 'right' })

    // Divider line
    yPos += 20
    pdf.setDrawColor(...veryLightGray)
    pdf.line(20, yPos, pageWidth - 20, yPos)

    // Key Statistics
    yPos += 15
    pdf.setFontSize(14)
    pdf.setTextColor(...black)
    pdf.setFont('helvetica', 'bold')
    pdf.text('KEY STATISTICS', 20, yPos)

    // Stats boxes
    yPos += 10
    const overallStats = data.overallStats || {}
    
    // Handle null values properly
    const totalStaff = overallStats.total_staff ? parseInt(overallStats.total_staff.toString()) : 0
    const avgRating = overallStats.avg_rating ? parseFloat(overallStats.avg_rating.toString()) : 0
    const avgServices = overallStats.avg_services ? parseFloat(overallStats.avg_services.toString()) : 0
    const avgSalary = overallStats.avg_salary ? parseFloat(overallStats.avg_salary.toString()) : 0
    
    const stats = [
      { label: 'Total Staff', value: totalStaff.toString() },
      { label: 'Avg Rating', value: avgRating.toFixed(1) },
      { label: 'Avg Services', value: avgServices.toFixed(0) },
      { label: 'Avg Salary', value: `$${avgSalary.toFixed(0)}` }
    ]

    stats.forEach((stat, index) => {
      const x = 20 + (index % 2) * 90
      const y = yPos + Math.floor(index / 2) * 25
      
      pdf.setFillColor(248, 248, 248)
      pdf.rect(x, y, 80, 20, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(x, y, 80, 20, 'S')
      
      pdf.setFontSize(8)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')
      pdf.text(stat.label, x + 3, y + 8)
      
      pdf.setFontSize(12)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text(stat.value, x + 3, y + 15)
    })

    yPos += 60

    // Department Performance
    if (data.departmentPerformance && data.departmentPerformance.length > 0) {
      pdf.setFontSize(14)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DEPARTMENT PERFORMANCE', 20, yPos)

      yPos += 10
      pdf.setFontSize(10)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')

      // Table
      pdf.setFillColor(248, 248, 248)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'S')

      // Table headers
      pdf.setFont('helvetica', 'bold')
      pdf.text('Department', 25, yPos + 2)
      pdf.text('Staff Count', 80, yPos + 2)
      pdf.text('Avg Rating', 120, yPos + 2)
      pdf.text('Avg Services', 160, yPos + 2)

      yPos += 8
      pdf.setFont('helvetica', 'normal')

      data.departmentPerformance.forEach((dept, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage()
          yPos = 20
        }
        
        const avgRating = dept.avg_rating ? parseFloat(dept.avg_rating.toString()) : 0
        const avgServices = dept.avg_services ? parseFloat(dept.avg_services.toString()) : 0
        
        pdf.text(dept.department || 'Unknown', 25, yPos)
        pdf.text(dept.staff_count?.toString() || '0', 80, yPos)
        pdf.text(avgRating.toFixed(1), 120, yPos)
        pdf.text(avgServices.toFixed(0), 160, yPos)
        yPos += 5
      })
    }

    yPos += 10

    // Top Performers
    if (data.topPerformers && data.topPerformers.length > 0) {
      pdf.setFontSize(14)
      pdf.setTextColor(...black)
      pdf.setFont('helvetica', 'bold')
      pdf.text('TOP PERFORMERS', 20, yPos)

      yPos += 10
      pdf.setFontSize(10)
      pdf.setTextColor(...darkGray)
      pdf.setFont('helvetica', 'normal')

      // Table
      pdf.setFillColor(248, 248, 248)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F')
      pdf.setDrawColor(...lightGray)
      pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'S')

      // Table headers
      pdf.setFont('helvetica', 'bold')
      pdf.text('Name', 25, yPos + 2)
      pdf.text('Department', 80, yPos + 2)
      pdf.text('Rating', 130, yPos + 2)
      pdf.text('Services', 160, yPos + 2)

      yPos += 8
      pdf.setFont('helvetica', 'normal')

      data.topPerformers.slice(0, 10).forEach((performer, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage()
          yPos = 20
        }
        
        const rating = performer.rating ? parseFloat(performer.rating.toString()) : 0
        const totalServices = performer.totalServices ? parseFloat(performer.totalServices.toString()) : 0
        
        pdf.text(`${performer.firstname || ''} ${performer.lastname || ''}`, 25, yPos)
        pdf.text(performer.department || 'Unknown', 80, yPos)
        pdf.text(rating.toFixed(1), 130, yPos)
        pdf.text(totalServices.toFixed(0), 160, yPos)
        yPos += 5
      })
    }

    // Footer
    const footerY = pageHeight - 15
    pdf.setFontSize(8)
    pdf.setTextColor(...lightGray)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Generated by Hotel Management System', pageWidth / 2, footerY, { align: 'center' })
    pdf.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' })

    // Save the PDF
    const fileName = `HMS-Staff-Performance-${data.branchId}-${Date.now()}.pdf`
    pdf.save(fileName)

    console.log('📄 Staff Performance PDF exported successfully:', fileName)
  } catch (error) {
    console.error('❌ Error generating staff performance PDF:', error)
    throw new Error('Failed to generate staff performance PDF report')
  }
}
