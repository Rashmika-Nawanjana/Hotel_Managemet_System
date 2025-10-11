import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const branches = await prisma.branch.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        address: true,
        phone: true,
        email: true,
        status: true,
      },
      where: {
        status: 'operational',
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(
      {
        success: true,
        count: branches.length,
        data: branches,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}