import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all guests
export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        bookings: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
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

// POST - Tambah guest baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // VALIDASI FIELD WAJIB
    if (
      !body.name ||
      !body.email ||
      !body.phone ||
      !body.deliveryType
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const guest = await prisma.guest.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        deliveryType: body.deliveryType,
        receiverName: body.receiverName ?? null,
        receiverPhone: body.receiverPhone ?? null,
        receiverAddress: body.receiverAddress ?? null,
      },
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('CREATE GUEST ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to create guest' },
      { status: 500 }
    )
  }
}
