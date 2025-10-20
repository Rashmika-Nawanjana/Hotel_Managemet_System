import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BillData {
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  basePrice: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  branchName: string;
  branchLocation: string;
  branchPhone: string;
  branchEmail: string;
  bookingDate: string;
}

export function generateBill(data: BillData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [251, 191, 36]; // Amber
  const darkColor: [number, number, number] = [16, 20, 28]; // Dark bg
  const textColor: [number, number, number] = [55, 65, 81]; // Gray

  // Header with Sky Nest branding
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('SKY NEST', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Luxury Hotel & Resorts', pageWidth / 2, 28, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('BOOKING INVOICE', pageWidth / 2, 36, { align: 'center' });

  // Branch Information
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  const branchInfo = [
    data.branchName,
    data.branchLocation,
    `Tel: ${data.branchPhone}`,
    `Email: ${data.branchEmail}`
  ];
  let yPos = 50;
  branchInfo.forEach(line => {
    doc.text(line, 14, yPos);
    yPos += 5;
  });

  // Booking Details Box
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - 80, 50, 66, 30);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Reference:', pageWidth - 76, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(data.bookingReference, pageWidth - 76, 63);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Date:', pageWidth - 76, 71);
  doc.setFont('helvetica', 'normal');
  doc.text(data.bookingDate, pageWidth - 76, 76);

  // Guest Information
  yPos = 90;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('GUEST INFORMATION', 14, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  
  const guestInfo = [
    ['Name:', data.guestName],
    ['Email:', data.guestEmail],
    ['Phone:', data.guestPhone]
  ];
  
  guestInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 45, yPos);
    yPos += 7;
  });

  // Booking Details
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('BOOKING DETAILS', 14, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  
  const bookingInfo = [
    ['Room Type:', data.roomType],
    ['Room Number:', data.roomNumber],
    ['Check-in:', new Date(data.checkInDate).toLocaleDateString()],
    ['Check-out:', new Date(data.checkOutDate).toLocaleDateString()],
    ['Number of Nights:', data.nights.toString()]
  ];
  
  bookingInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 55, yPos);
    yPos += 7;
  });

  // Charges Table
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CHARGES', 14, yPos);
  
  yPos += 5;
  
  const charges = [
    ['Room Charges', `${data.nights} night(s) × LKR ${data.basePrice.toLocaleString()}`, `LKR ${(data.nights * data.basePrice).toLocaleString()}`],
    ['Service Charge (10%)', '', `LKR ${data.serviceCharge.toLocaleString()}`],
    ['VAT (12%)', '', `LKR ${data.taxAmount.toLocaleString()}`]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Details', 'Amount']],
    body: charges,
    theme: 'plain',
    headStyles: {
      fillColor: primaryColor,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60 },
      2: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  // Total Amount
  const finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(14, finalY, pageWidth - 14, finalY);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL AMOUNT:', pageWidth - 90, finalY + 8);
  doc.text(`LKR ${data.totalAmount.toLocaleString()}`, pageWidth - 40, finalY + 8, { align: 'right' });

  // Payment Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const statusColor = data.paymentStatus === 'Completed' ? [34, 197, 94] : [234, 179, 8];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Payment Status: ${data.paymentStatus}`, 14, finalY + 18);
  
  if (data.paymentMethod) {
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`Payment Method: ${data.paymentMethod}`, 14, finalY + 25);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.3);
  doc.line(14, footerY, pageWidth - 14, footerY);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Terms & Conditions:', 14, footerY + 5);
  doc.text('• Check-in time: 2:00 PM | Check-out time: 12:00 PM', 14, footerY + 10);
  doc.text('• Cancellation must be made 48 hours before check-in for full refund', 14, footerY + 15);
  doc.text('• Valid government-issued ID required at check-in', 14, footerY + 20);
  
  doc.setFontSize(7);
  doc.text('Thank you for choosing Sky Nest. We look forward to serving you!', pageWidth / 2, footerY + 27, { align: 'center' });

  return doc;
}

export function generateBillBlob(data: BillData): Blob {
  const doc = generateBill(data);
  return doc.output('blob');
}

export function downloadBill(data: BillData, filename?: string): void {
  const doc = generateBill(data);
  doc.save(filename || `Sky-Nest-Bill-${data.bookingReference}.pdf`);
}
