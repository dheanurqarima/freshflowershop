'use client'

import { useState, useEffect } from 'react'
import { Flower2, ShoppingCart, Package, DollarSign, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DashboardMetrics {
  totalProducts: number
  availableProducts: number
  soldProducts: number
  monthlyRevenue: number
  recentBookings: any[]
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      'Booking': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-yellow-100 text-yellow-800',
      'Done Order': 'bg-green-100 text-green-800',
      'Canceled': 'bg-red-100 text-red-800'
    }
    return statusStyles[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-green-700" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-800">
                {metrics.totalProducts}
              </div>
              <Flower2 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        {/* Available Products */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Produk Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-800">
                {metrics.availableProducts}
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Sold Products */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Produk Terjual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-800">
                {metrics.soldProducts}
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendapatan Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-800">
                Rp {metrics.monthlyRevenue.toLocaleString("id-ID") ?? "0"}
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-800">Pemesanan Terbaru</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchMetrics}
              className="border-yellow-200 hover:bg-yellow-50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recentBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Belum ada pemesanan
              </p>
            ) : (
              metrics.recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-green-800">
                        {booking.guest.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {booking.product.name}
                      </p>
                    </div>
                    <Badge className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      <span>{booking.quantity} x Rp {booking.product.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="font-semibold text-green-700">
                      Rp {booking.totalCost.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Tanggal: {new Date(booking.orderDate).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
