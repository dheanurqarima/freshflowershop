'use client'

import { ShoppingCart, FileText, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCart } from '@/contexts/CartContext'

interface ProductCardProps {
  id?: string
  name?: string
  catalogType?: string
  detail?: string
  price?: number | null
  stock?: number | null
  status?: string
  image?: string | null
}

/** Helper agar tidak crash */
const safeNumber = (value: any) => Number(value ?? 0)

export default function ProductCard({
  id = '1',
  name = 'Rose Bouquet',
  catalogType = 'Fresh Flower',
  detail = 'Beautiful fresh rose bouquet perfect for any occasion',
  price = 0,
  stock = 0,
  status = 'Available',
  image = null,
}: ProductCardProps) {
  const { addToCart } = useCart()

  const safePrice = safeNumber(price)
  const safeStock = safeNumber(stock)

  const imageUrl =
  typeof image === 'string' && image.trim() !== ''
    ? image
    : null

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price: safePrice,
      quantity: 1,
      catalogType,
      stock: safeStock,
      image: imageUrl ?? '',
    })
  }

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-yellow-200">
      <div className="aspect-square bg-gradient-to-br from-yellow-100 to-green-100 relative">
        {/* Product Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-green-400" />
          </div>
        )}

        {/* Status Badge */}
        {status !== 'Available' && (
          <Badge className="absolute top-2 right-2 bg-gray-500 z-10">
            {status}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-green-800 mb-1 line-clamp-1">
          {name}
        </h3>

        <Badge className="mb-2 bg-yellow-200 hover:bg-yellow-300 text-xs">
          {catalogType}
        </Badge>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {detail}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-green-700">
            Rp {safePrice.toLocaleString('id-ID')}
          </p>

          <Badge
            variant={safeStock > 0 ? 'default' : 'destructive'}
            className={safeStock > 0 ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {safeStock > 0 ? `Stok: ${safeStock}` : 'Habis'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          size="sm"
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={handleAddToCart}
          disabled={safeStock === 0 || status !== 'Available'}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          Keranjang
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-green-200 hover:bg-green-50 text-green-700"
            >
              <FileText className="h-4 w-4 mr-1" />
              Detail
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-green-800">
                {name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-yellow-100 to-green-100 rounded-lg flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={400}
                    height={400}
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="h-20 w-20 text-green-400" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    {catalogType}
                  </Badge>

                  <Badge
                    variant={safeStock > 0 ? 'default' : 'destructive'}
                    className={safeStock > 0 ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {safeStock > 0 ? `Stok: ${safeStock}` : 'Habis'}
                  </Badge>

                  <Badge variant={status === 'Available' ? 'default' : 'secondary'}>
                    {status}
                  </Badge>
                </div>

                <p className="text-gray-700">
                  {detail}
                </p>

                <div className="text-2xl font-bold text-green-700">
                  Rp {safePrice.toLocaleString('id-ID')}
                </div>
              </div>

              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={handleAddToCart}
                disabled={safeStock === 0 || status !== 'Available'}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Tambah ke Keranjang
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
