'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Booking {
  id: string
  quantity: number
  orderDate: string
  pickupDate: string
  totalCost: number
  status: string
  product: {
    id: string
    name: string
    catalogType: string
    price: number
  }
  guest: {
    id: string
    name: string
    email: string
    phone: string
    deliveryType: string
    receiverName?: string
    receiverPhone?: string
    receiverAddress?: string
  }
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    console.log('🔍 Updating status:', bookingId, 'to:', newStatus)

    try {
      const response = await fetch(`/api/bookings/${bookingId}?_method=PATCH`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Status updated successfully')
        await fetchBookings()
      } else {
        console.error('❌ Failed to update status:', data)
        alert(`Gagal mengupdate status: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error updating booking status:', error)
      alert('Terjadi kesalahan saat mengupdate status. Silakan coba lagi.')
    }
  }

  const sendWhatsApp = (booking: Booking) => {
    const guest = booking.guest
    const product = booking.product

    let message = `✅ *PESANAN BARU - FRESH FLOWER SHOP*\n\n`
    message += `📋 *Informasi Pemesan*\n`
    message += `• Nama: ${guest.name}\n`
    message += `• Email: ${guest.email}\n`
    message += `• No. HP: ${guest.phone}\n\n`

    message += `📦 *Informasi Pengiriman*\n`
    message += `• Tipe: ${guest.deliveryType === 'pickup' ? 'Ambil di Toko' : 'Pengantaran'}\n`
    message += `• Tanggal Pesanan: ${new Date(booking.orderDate).toLocaleDateString('id-ID')}\n`
    message += `• Tanggal ${guest.deliveryType === 'pickup' ? 'Pengambilan' : 'Pengantaran'}: ${new Date(booking.pickupDate).toLocaleDateString('id-ID')}\n\n`

    if (guest.deliveryType === 'delivery' && guest.receiverName) {
      message += `📍 *Detail Pengantaran*\n`
      message += `• Nama Penerima: ${guest.receiverName}\n`
      message += `• No. HP Penerima: ${guest.receiverPhone}\n`
      message += `• Alamat: ${guest.receiverAddress}\n\n`
    }

    message += `🌸 *Detail Produk*\n`
    message += `• Nama: ${product.name}\n`
    message += `• Tipe: ${product.catalogType}\n`
    message += `• Harga: Rp ${(product.price ?? 0).toLocaleString('id-ID')}\n`
    message += `• Jumlah: ${booking.quantity}\n\n`

    message += `💰 *Total Biaya: Rp ${(booking.totalCost ?? 0).toLocaleString('id-ID')}*\n\n`

    const statusEmoji: Record<string, string> = {
      'Booking': '📝',
      'Confirmed': '✅',
      'Done Order': '✅',
      'Canceled': '❌'
    }

    message += `📊 *Status: ${statusEmoji[booking.status]} ${booking.status}*\n\n`

    message += `Terima kasih telah berbelanja di Fresh Flower Shop! 🌸\n`
    message += `Hubungi kami jika ada pertanyaan.`

    const phoneNumber = guest.phone.replace(/^0/, '62')
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      'Booking': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-yellow-100 text-yellow-800',
      'Done Order': 'bg-green-100 text-green-800',
      'Canceled': 'bg-red-100 text-red-800'
    }
    return statusStyles[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredBookings = bookings.filter(booking =>
    booking.guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group bookings by guest
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const guestId = booking.guest.id
    if (!acc[guestId]) {
      acc[guestId] = {
        guest: booking.guest,
        bookings: []
      }
    }
    acc[guestId].bookings.push(booking)
    return acc
  }, {} as Record<string, { guest: Booking['guest']; bookings: Booking[] }>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">Memuat pemesanan...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">Daftar Booking</h2>
        <div className="w-full max-w-sm ml-4">
          <Input
            type="search"
            placeholder="Cari berdasarkan nama, email, atau produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-yellow-200 focus:border-yellow-400 text-black placeholder:text-gray-400"
          />
        </div>
      </div>

      {Object.values(groupedBookings).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Tidak ada pemesanan ditemukan
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedBookings).map(({ guest, bookings }) => {
            const totalCost = bookings.reduce(
              (sum, b) => sum + (b.totalCost ?? 0),
              0
            )
            return (
              <Card key={guest.id} className="border-yellow-200">
                <CardContent className="p-2 sm:p-4 md:p-6">
                  {/* Guest Information */}
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-green-800 text-lg mb-2">
                      {guest.name}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Email: </span>
                        <span>{guest.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">WhatsApp: </span>
                        <span>{guest.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Metode: </span>
                        <span className="capitalize">
                          {guest.deliveryType === 'pickup' ? 'Ambil di Toko' : 'Pengantaran'}
                        </span>
                      </div>
                      {guest.receiverName && (
                        <div>
                          <span className="text-gray-600">Penerima: </span>
                          <span>{guest.receiverName}</span>
                        </div>
                      )}
                    </div>
                    {guest.receiverAddress && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Alamat: </span>
                        <span>{guest.receiverAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Bookings Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-yellow-200">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-green-800">
                            Produk
                          </th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-green-800">
                            Harga
                          </th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-green-800">
                            Jumlah
                          </th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-green-800">
                            Status
                          </th>
                          <th className="text-left py-2 px-2 text-sm font-semibold text-green-800">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-yellow-100 hover:bg-yellow-50">
                            <td className="py-3 px-3">
                              <div>
                                <div className="font-medium text-green-800">
                                  {booking.product.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {booking.product.catalogType}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {booking.orderDate
                                    ? new Date(booking.orderDate).toLocaleDateString('id-ID')
                                    : '-'}{' '}
                                  -{' '}
                                  {booking.pickupDate
                                    ? new Date(booking.pickupDate).toLocaleDateString('id-ID')
                                    : '-'}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              Rp {(booking.product?.price ?? 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-3">
                              {booking.quantity}
                            </td>
                            <td className="py-3 px-3 relative z-50">
                              <div className="relative">
                                <Select
                                  key={`status-${booking.id}-${booking.status}`}
                                  value={booking.status}
                                  onValueChange={(value) => {
                                    console.log('🔘 Status change triggered:', booking.id, value)
                                    handleStatusChange(booking.id, value)
                                  }}
                                  onOpenChange={(open) => console.log('📂 Select opened:', open)}
                                >
                                  <SelectTrigger className="w-32 cursor-pointer border-yellow-200 focus:border-yellow-400">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[9999] bg-white border-yellow-200">
                                    <SelectItem value="Booking">Booking</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Done Order">Done Order</SelectItem>
                                    <SelectItem value="Canceled">Canceled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center sm:text-left">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 border-green-200 hover:bg-green-100 px-2 sm:px-3 h-8"
                                onClick={() => sendWhatsApp(booking)}
                              >
                                <MessageCircle className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="mt-4 flex justify-between items-center pt-4 border-t border-yellow-200">
                    <div className="text-sm text-gray-600">
                      {bookings.length} produk
                    </div>
                    <div className="text-xl font-bold text-green-800">
                      Total: Rp {totalCost.toLocaleString('id-ID')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
