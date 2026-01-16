'use client'


import { Minus, Plus, Trash2, Image as ImageIcon  } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/CartContext'


interface ShoppingCartSheetProps {
  onProceedToBooking?: () => void
}

export default function ShoppingCartSheet({ onProceedToBooking }: ShoppingCartSheetProps) {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal

  return (
    <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white">
      <SheetHeader>
        <div className="flex items-center justify-between">
          <SheetTitle className="text-green-800">🛒 Keranjang Belanja</SheetTitle>
        </div>
      </SheetHeader>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🌸</div>
          <p className="text-lg">Keranjang Anda masih kosong</p>
          <p className="text-sm">Ayo tambahkan bunga favorit Anda!</p>
        </div>
      ) : (
        <div className="mt-2 space-y-4">
          {/* Cart Items */}
          <div className="space-y-2 max-h-200 overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 ml-2 mr-2">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-yellow-100 to-green-100 flex-shrink-0 relative">
                  {typeof item.image === 'string' && item.image !== '' ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-3xl">
                      🌸
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-green-800 text-sm line-clamp-1">
                    {item.name}
                  </h4>
                  {item.catalogType && (
                    <p className="text-xs text-gray-600 mb-1">{item.catalogType}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 border-yellow-300 hover:bg-yellow-100"
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 border-yellow-300 hover:bg-yellow-100"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>

                    {/* Remove Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-red-50 hover:text-red-600 ml-auto"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="mx-1 sticky bottom-0 bg-white pt-10 pb-6 ">
            <div className="space-y-1 border-t pt-4 border-green-200">
              <div className="flex justify-between text-lg font-bold text-green-800">
                <span className="ml-2">Total</span>
                <span className="mr-2">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-6"
                onClick={onProceedToBooking}
              >
                Order Now
              </Button>
              <Button
                variant="outline"
                className="w-full border-green-200 hover:bg-green-50 text-green-700 mb-1"
                onClick={clearCart}
              >
                Kosongkan Keranjang
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fef9c3;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ca8a04;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a16207;
        }
      `}</style>
    </SheetContent>
  )
}
