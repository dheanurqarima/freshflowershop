import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all bookings with related data
export async function GET(request: NextRequest) {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        product: true,
        guest: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      productId,
      guestData,
      quantity,
      pickupDate
    } = body

    if (!productId || !guestData || !quantity || !pickupDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get product price
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const totalCost = product.price * quantity

    // Create or find guest
    let guest = await prisma.guest.findFirst({
      where: { email: guestData.email }
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone,
          deliveryType: guestData.deliveryType,
          receiverName: guestData.receiverName,
          receiverPhone: guestData.receiverPhone,
          receiverAddress: guestData.receiverAddress
        }
      })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        productId,
        guestId: guest.id,
        quantity,
        pickupDate: new Date(pickupDate),
        totalCost,
        status: 'Booking'
      },
      include: {
        product: true,
        guest: true
      }
    })

    // Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: { decrement: quantity }
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
