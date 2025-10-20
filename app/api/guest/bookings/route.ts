import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sendBookingConfirmation } from '@/lib/emailService';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

// Helper to verify guest token
async function verifyGuest(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role?.toString().toLowerCase() !== 'guest') {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

// GET - Get guest's bookings
export async function GET(request: NextRequest) {
  try {
    const guest = await verifyGuest(request);
    if (!guest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guestId = guest.userId as number;

    // Fetch bookings with room and branch details
    const result = await pool.query(
      `SELECT 
        b.id,
        b.booking_reference,
        b.check_in_date,
        b.check_out_date,
        b.number_of_guests,
        b.status,
        b.total_amount,
        b.special_requests,
        b.created_at,
        b.checked_in_at,
        b.checked_out_at,
        r.room_number,
        rt.name as room_type,
        rt.base_price,
        rt.images,
        br.name as branch_name,
        br.location as branch_location,
        br.address as branch_address,
        p.payment_status,
        p.payment_method,
        p.amount as payment_amount
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      JOIN branches br ON r.branch_id = br.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.guest_id = $1
      ORDER BY b.check_in_date DESC`,
      [guestId]
    );

    // Categorize bookings
    const now = new Date();
    const bookings = result.rows.map(booking => {
      const checkInDate = new Date(booking.check_in_date);
      const checkOutDate = new Date(booking.check_out_date);
      
      let category = 'upcoming';
      if (booking.status === 'Cancelled' || booking.status === 'NoShow') {
        category = 'cancelled';
      } else if (checkOutDate < now || booking.status === 'CheckedOut') {
        category = 'past';
      } else if (checkInDate <= now && checkOutDate >= now) {
        category = 'active';
      }

      return {
        ...booking,
        category,
        can_modify: category === 'upcoming' && booking.status === 'Pending',
        can_cancel: category === 'upcoming' && ['Pending', 'Confirmed'].includes(booking.status),
        image: booking.images && booking.images.length > 0 ? booking.images[0] : '/B1.avif'
      };
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('[GUEST BOOKINGS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const guest = await verifyGuest(request);
    if (!guest) {
      return NextResponse.json({ error: 'Unauthorized - Please login to book' }, { status: 401 });
    }

    const guestId = guest.userId as number;
    const body = await request.json();
    const { room_id, check_in_date, check_out_date, number_of_guests, special_requests } = body;

    // Validation
    if (!room_id || !check_in_date || !check_out_date) {
      return NextResponse.json(
        { error: 'Missing required fields: room_id, check_in_date, check_out_date' },
        { status: 400 }
      );
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate dates
    if (checkIn < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Check if room exists and get room details with branch info
    const roomResult = await pool.query(
      `SELECT 
        r.id, 
        r.room_number, 
        r.status, 
        rt.base_price, 
        rt.max_occupancy, 
        rt.name as room_type,
        br.name as branch_name,
        br.address as branch_address
       FROM rooms r
       JOIN room_types rt ON r.room_type_id = rt.id
       JOIN branches br ON r.branch_id = br.id
       WHERE r.id = $1`,
      [room_id]
    );

    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = roomResult.rows[0];

    // Validate guest count
    if (number_of_guests && number_of_guests > room.max_occupancy) {
      return NextResponse.json(
        { error: `Maximum occupancy for this room is ${room.max_occupancy} guests` },
        { status: 400 }
      );
    }

    // Check room availability for the date range
    const availabilityCheck = await pool.query(
      `SELECT COUNT(*) as booking_count
       FROM bookings
       WHERE room_id = $1
       AND status IN ('Pending', 'Confirmed', 'CheckedIn')
       AND (
         (check_in_date <= $2 AND check_out_date > $2) OR
         (check_in_date < $3 AND check_out_date >= $3) OR
         (check_in_date >= $2 AND check_out_date <= $3)
       )`,
      [room_id, check_in_date, check_out_date]
    );

    if (parseInt(availabilityCheck.rows[0].booking_count) > 0) {
      return NextResponse.json(
        { error: 'Room is not available for the selected dates' },
        { status: 409 }
      );
    }

    // Calculate total amount (nights × base_price)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const total_amount = room.base_price * nights;

    // Generate booking reference
    const timestamp = Date.now();
    const booking_reference = `BK-${timestamp.toString().slice(-8)}-${room_id}`;

    // Create booking
    const bookingResult = await pool.query(
      `INSERT INTO bookings 
        (booking_reference, guest_id, room_id, check_in_date, check_out_date, 
         number_of_guests, status, total_amount, special_requests, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending', $7, $8, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        booking_reference,
        guestId,
        room_id,
        check_in_date,
        check_out_date,
        number_of_guests || 1,
        total_amount,
        special_requests || null
      ]
    );

    const booking = bookingResult.rows[0];

    // Get guest details for email
    const guestResult = await pool.query(
      `SELECT first_name, last_name, email FROM guests WHERE id = $1`,
      [guestId]
    );
    const guestData = guestResult.rows[0];

    // Send confirmation email (async, don't wait for it)
    if (guestData.email) {
      sendBookingConfirmation(
        guestData.email,
        {
          guestName: `${guestData.first_name} ${guestData.last_name}`,
          bookingReference: booking.booking_reference,
          roomType: room.room_type,
          roomNumber: room.room_number,
          checkIn: check_in_date,
          checkOut: check_out_date,
          nights: nights,
          guests: number_of_guests || 1,
          totalAmount: `LKR ${total_amount.toLocaleString()}`,
          specialRequests: special_requests || undefined,
          branchName: room.branch_name,
          branchAddress: room.branch_address
        }
      ).catch(err => {
        console.error('Failed to send confirmation email:', err);
        // Don't fail the booking if email fails
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        room_number: room.room_number,
        room_type: room.room_type,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        number_of_guests: booking.number_of_guests,
        nights: nights,
        total_amount: booking.total_amount,
        status: booking.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[CREATE BOOKING] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', details: (error as Error).message },
      { status: 500 }
    );
  }
}
