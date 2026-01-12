import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Handle both POST and PATCH (workaround)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const method = searchParams.get('_method') || 'POST'

    // Only handle PATCH via this POST endpoint
    if (method !== 'PATCH') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }

    // Resolve params (may be a Promise in Next.js route handlers)
    const routeParams = params && typeof (params as any).then === 'function' ? await (params as any) : params
    const id = routeParams?.id

    // DEBUG: Log incoming request info to troubleshoot missing params
    try {
      console.log('Booking route called:', {
        id,
        params: routeParams,
        url: request.url,
        nextUrlPathname: request.nextUrl.pathname,
        searchParams: Array.from(request.nextUrl.searchParams.entries())
      })
    } catch (e) {
      console.warn('Failed to log request info for booking route', e)
    }

    if (!id) {
      return NextResponse.json({ error: 'Booking id is required' }, { status: 400 })
    }

    // Parse JSON body safely
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { status } = body

    if (typeof status !== 'string' || !status.trim()) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['Booking', 'Confirmed', 'Done Order', 'Canceled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Valid values: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const existingBooking = await db.booking.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Handle stock changes based on status
    if (status === 'Canceled' && existingBooking.status !== 'Canceled') {
      // Restore stock (only if product exists)
      if (existingBooking.productId && existingBooking.product) {
        await db.product.update({
          where: { id: existingBooking.productId },
          data: {
            stock: { increment: existingBooking.quantity }
          }
        })
      } else {
        console.warn('Product missing for booking:', id)
      }
    } else if (status === 'Done Order' && existingBooking.status !== 'Done Order') {
      // Stock already deducted when booking was created
      // Just update the booking status
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status },
      include: {
        product: true,
        guest: true
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Failed to update booking', message },
      { status: 500 }
    )
  }
}

