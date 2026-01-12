'use client'

import { useState } from 'react'
import { MapPin, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCart } from '@/contexts/CartContext'

interface BookingFormDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function BookingFormDialog({ open, onOpenChange }: BookingFormDialogProps) {
  const { cartItems, cartTotal, clearCart } = useCart()
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    pickupDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Submit each cart item as a booking
      for (const item of cartItems) {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: item.id,
            guestData: {
              ...formData,
              deliveryType
            },
            quantity: item.quantity,
            pickupDate: formData.pickupDate
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create booking')
        }
      }

      // Clear cart and close dialog
      clearCart()
      onOpenChange?.(false)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        pickupDate: ''
      })
      setDeliveryType('pickup')
    } catch (error) {
      console.error('Error submitting booking:', error)
      setError('Gagal membuat booking. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-green-800 text-2xl">📋 Form Booking</DialogTitle>
          <DialogDescription>
            Lengkapi data diri Anda untuk melanjutkan pemesanan
          </DialogDescription>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🌸</div>
            <p className="text-lg">Keranjang Anda masih kosong</p>
            <p className="text-sm">Tambahkan produk terlebih dahulu</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Cart Summary */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-green-800 mb-2">Ringkasan Pesanan</h3>
              <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-green-800 mt-3 pt-3 border-t border-yellow-300">
                <span>Total</span>
                <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Delivery Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Pilih Metode Pengiriman</Label>
              <RadioGroup value={deliveryType} onValueChange={(v) => setDeliveryType(v as 'pickup' | 'delivery')}>
                <div className="flex items-center space-x-2 border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Store className="h-5 w-5 text-green-700" />
                    <div>
                      <div className="font-semibold text-green-800">Ambil di Toko</div>
                      <div className="text-sm text-gray-600">Datang langsung ke toko kami</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-4 bg-green-50 border-green-200">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                    <MapPin className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-semibold text-green-800">Pengantaran</div>
                      <div className="text-sm text-gray-600">Kami antar ke alamat Anda</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-green-800 text-lg">Informasi Pemesan</h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    className="border-yellow-200 focus:border-yellow-400"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@example.com"
                    className="border-yellow-200 focus:border-yellow-400"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Nomor WhatsApp *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="081234567890"
                    className="border-yellow-200 focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Receiver Information (if delivery) */}
            {deliveryType === 'delivery' && (
              <div className="space-y-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-green-800 text-lg">Informasi Penerima</h3>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="receiverName">Nama Penerima *</Label>
                    <Input
                      id="receiverName"
                      value={formData.receiverName}
                      onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                      required
                      placeholder="Nama penerima paket"
                      className="border-yellow-200 focus:border-yellow-400"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="receiverPhone">Nomor Telepon Penerima *</Label>
                    <Input
                      id="receiverPhone"
                      type="tel"
                      value={formData.receiverPhone}
                      onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                      required
                      placeholder="081234567890"
                      className="border-yellow-200 focus:border-yellow-400"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="receiverAddress">Alamat Lengkap *</Label>
                    <Input
                      id="receiverAddress"
                      value={formData.receiverAddress}
                      onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
                      required
                      placeholder="Jalan, No. Rumah, Kelurahan, Kecamatan, Kota, Kode Pos"
                      className="border-yellow-200 focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pickup Date */}
            <div className="space-y-4">
              <h3 className="font-semibold text-green-800 text-lg">
                {deliveryType === 'pickup' ? 'Tanggal Pengambilan' : 'Tanggal Pengantaran'}
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="pickupDate">Tanggal *</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="border-yellow-200 focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-green-200 hover:bg-green-50 text-green-700"
                onClick={() => onOpenChange?.(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Konfirmasi Booking'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
