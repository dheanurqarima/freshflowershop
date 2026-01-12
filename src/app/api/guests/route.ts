import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all guests
export async function GET(request: NextRequest) {
  try {
    const guests = await db.guest.findMany({
      include: {
        bookings: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(guests)
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    )
  }
}
