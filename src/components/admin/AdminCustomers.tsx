'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, MapPin, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  deliveryType: string
  receiverName?: string
  receiverPhone?: string
  receiverAddress?: string
  bookings: Array<{
    id: string
    quantity: number
    totalCost: number
    status: string
    orderDate: string
    pickupDate: string
    product: {
      name: string
      catalogType: string
      price: number
    }
  }>
}

interface CustomerOrderGroup {
  customer: Customer
  orderDate: string
  bookings: Customer['bookings']
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/guests')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendWhatsApp = (customer: Customer) => {
    const totalCost = customer.bookings.reduce(
      (sum, b) => sum + (b.totalCost ?? 0),
      0
    )
    let message = `🌸 *FRESH FLOWER SHOP - RINCIAN PESANAN ANDA*\n\n`
    
    message += `👤 *Informasi Pemesan*\n`
    message += `• Nama: ${customer.name}\n`
    message += `• Email: ${customer.email}\n`
    message += `• No. HP: ${customer.phone}\n\n`

    message += `📦 *Metode: ${customer.deliveryType === 'pickup' ? 'Ambil di Toko' : 'Pengantaran'}*\n\n`

    if (customer.deliveryType === 'delivery' && customer.receiverName) {
      message += `📍 *Informasi Penerima*\n`
      message += `• Nama Penerima: ${customer.receiverName}\n`
      message += `• No. HP Penerima: ${customer.receiverPhone}\n`
      message += `• Alamat: ${customer.receiverAddress}\n\n`
    }

    message += `🌹 *Detail Produk*\n`
    customer.bookings.forEach((booking, index) => {
      const statusEmoji: Record<string, string> = {
        'Booking': '📝',
        'Confirmed': '✅',
        'Done Order': '✅',
        'Canceled': '❌'
      }
      message += `\n${index + 1}. ${booking.product.name}\n`
      message += `   • Tipe: ${booking.product.catalogType}\n`
      message += `   • Harga: Rp ${(booking.product?.price ?? 0).toLocaleString('id-ID')}\n`
      message += `   • Jumlah: ${booking.quantity}\n`
      message += `   • Status: ${statusEmoji[booking.status]} ${booking.status}\n`
    })

    message += `\n💰 *Total Biaya: Rp ${(totalCost ?? 0).toLocaleString('id-ID')}*\n\n`

    message += `Terima kasih telah berbelanja di Fresh Flower Shop! 🌸\n`
    message += `Ada pertanyaan? Jangan ragu untuk menghubungi kami.`

    const phoneNumber = customer.phone.replace(/^0/, '62')
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  const groupedOrders: CustomerOrderGroup[] = []

  customers.forEach((customer) => {
    const mapByDate: Record<string, Customer['bookings']> = {}

    customer.bookings.forEach((booking) => {
      const dateKey = new Date(booking.orderDate).toISOString().split('T')[0]

      if (!mapByDate[dateKey]) {
        mapByDate[dateKey] = []
      }

      mapByDate[dateKey].push(booking)
    })

    Object.entries(mapByDate).forEach(([orderDate, bookings]) => {
      groupedOrders.push({
        customer,
        orderDate,
        bookings
      })
    })
  })

  groupedOrders.sort((a, b) => {
  return (
    new Date(b.orderDate).getTime() -
    new Date(a.orderDate).getTime()
  )
})

  const filteredOrders = groupedOrders.filter(({ customer }) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">Memuat pelanggan...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">Informasi Pelanggan</h2>
        <div className="w-full max-w-sm ml-4">
          <Input
            type="search"
            placeholder="Cari berdasarkan nama, email, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-yellow-200 focus:border-yellow-400 text-gray-400"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Tidak ada pelanggan ditemukan
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map(({ customer, orderDate, bookings }) => {
            const totalCost = bookings.reduce((sum, b) => sum + b.totalCost, 0)
            const totalQuantity = bookings.reduce((sum, b) => sum + b.quantity, 0)

            return (
              <Card
              key={`${customer.id}-${orderDate}`}
              className="border-yellow-200 hover:shadow-md transition-shadow"
            >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  {/* Customer Header */}
                  <div className="flex items-start justify-between mb-2 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 text-base sm:text-lg mb-1">
                        {customer.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600">
                        {customer.email}
                      </p>

                      <p className="text-xs sm:text-sm text-gray-600">
                        {customer.phone}
                      </p>

                      {/* 🆕 TANGGAL PEMESANAN */}
                      <p className="text-xs text-gray-500 mt-1">
                        Tanggal Pesan:{' '}
                        {new Date(orderDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <Badge
                      className={
                        customer.deliveryType === 'pickup'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {customer.deliveryType === 'pickup' ? (
                        <>
                          <Store className="h-3 w-3 mr-1" />
                          Ambil di Toko
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3 mr-1" />
                          Pengantaran
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Receiver Info (if delivery) */}
                  {customer.deliveryType === 'delivery' && customer.receiverName && (
                    <div className="bg-green-50 p-2 sm:p-3 rounded-lg mb-2 sm:mb-4">
                      <p className="text-xs text-gray-600 mb-1">Informasi Penerima</p>
                      <p className="text-sm font-medium text-green-800">
                        {customer.receiverName}
                      </p>
                      <p className="text-sm text-gray-600">{customer.receiverPhone}</p>
                      <p className="text-sm text-gray-600">{customer.receiverAddress}</p>
                    </div>
                  )}

                  {/* Bookings Summary */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Pesanan</span>
                      <span className="font-medium text-green-800">
                        {bookings.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Produk</span>
                      <span className="font-medium text-green-800">
                        {totalQuantity}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Belanja</span>
                      <span className="font-bold text-green-800">
                        Rp {totalCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Products List */}
                  {customer.bookings.length > 0 && (
                    <div className="border-t border-yellow-200 pt-3 mb-4">
                      <p className="text-xs text-gray-600 mb-2">Produk yang dipesan:</p>
                      <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{booking.product.name}</span>
                              <Badge 
                                variant="outline" 
                                className="text-[10px] h-5 border-yellow-200"
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <span className="text-gray-600">
                              {booking.quantity} x Rp {(booking.product?.price ?? 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Button */}
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                    onClick={() => sendWhatsApp(customer)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Hubungi via WhatsApp</span>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
