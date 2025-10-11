import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        room: {
          include: {
            roomType: {
              include: {
                images: true,
                amenities: {
                  include: {
                    amenity: true,
                  },
                },
              },
            },
            branch: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (
      decoded.role === 'GUEST' &&
      booking.userId !== decoded.userId
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to view this booking' },
        { status: 403 }
      )
    }

    const transformedBooking = {
      ...booking,
      totalPrice: parseFloat(booking.totalPrice.toString()),
      room: {
        ...booking.room,
        roomType: {
          ...booking.room.roomType,
          basePrice: parseFloat(booking.room.roomType.basePrice.toString()),
        },
      },
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedBooking,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, specialRequests } = body

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (
      decoded.role === 'GUEST' &&
      existingBooking.userId !== decoded.userId
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to update this booking' },
        { status: 403 }
      )
    }

    const updateData: any = {}

    if (status) {
      if (decoded.role === 'GUEST' && status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'You can only cancel bookings' },
          { status: 403 }
        )
      }
      updateData.status = status
    }

    if (paymentStatus && (decoded.role === 'ADMIN' || decoded.role === 'STAFF')) {
      updateData.paymentStatus = paymentStatus
    }

    if (specialRequests !== undefined) {
      updateData.specialRequests = specialRequests
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            roomType: true,
            branch: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Booking updated successfully',
        data: {
          ...booking,
          totalPrice: parseFloat(booking.totalPrice.toString()),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.booking.delete({
      where: { id },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Booking deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}