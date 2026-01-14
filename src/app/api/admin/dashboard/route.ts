import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Total Products
    const totalProducts = await prisma.product.count({
      where: { isDeleted: false }
    })

    // Available Products (sum of all stock)
    const availableProducts = await prisma.product.aggregate({
      _sum: {
        stock: true
      }
    })

    // Products Sold (from bookings with 'Done Order' status)
    const soldProductsResult = await prisma.booking.aggregate({
      where: {
        status: 'Done Order'
      },
      _sum: {
        quantity: true
      }
    })

    const soldProducts = soldProductsResult._sum.quantity || 0

    // Monthly Revenue (sum of bookings with 'Done Order' status in current month)
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthlyRevenueResult = await prisma.booking.aggregate({
      where: {
        status: 'Done Order',
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      },
      _sum: {
        totalCost: true
      }
    })

    const monthlyRevenue = monthlyRevenueResult._sum.totalCost || 0

    // Recent Bookings (last 10)
    const recentBookings = await prisma.booking.findMany({
      include: {
        product: true,
        guest: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      totalProducts,
      availableProducts: availableProducts._sum.stock || 0,
      soldProducts,
      monthlyRevenue,
      recentBookings
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}
