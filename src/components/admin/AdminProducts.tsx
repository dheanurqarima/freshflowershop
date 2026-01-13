'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Product {
  id: string
  name: string
  catalogType: string
  detail?: string
  price: number
  stock: number
  status: string
  image?: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    catalogType: '',
    detail: '',
    price: '',
    stock: '',
    status: 'Available'
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('catalogType', formData.catalogType)
    formDataToSend.append('detail', formData.detail)
    formDataToSend.append('price', formData.price)
    formDataToSend.append('stock', formData.stock)
    formDataToSend.append('status', formData.status)

    const imageFile = (document.getElementById('productImage') as HTMLInputElement)?.files?.[0]
    if (imageFile) {
      formDataToSend.append('image', imageFile)
    }

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      if (response.ok) {
        await fetchProducts()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      catalogType: product.catalogType,
      detail: product.detail || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      status: product.status
    })
    if (product.image) {
      setImagePreview(`/uploads/${product.image}`)
    }
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      catalogType: '',
      detail: '',
      price: '',
      stock: '',
      status: 'Available'
    })
    setImagePreview('')
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    setDialogOpen(open)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">Manajemen Produk</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => setEditingProduct(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-green-800">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription>
                Lengkapi informasi produk di bawah ini
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Bunga *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Contoh: Rose Bouquet"
                  className="border-yellow-200 focus:border-yellow-400 text-black placeholder:text-gray-400"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="catalogType">Tipe Katalog *</Label>
                <Select
                  value={formData.catalogType}
                  onValueChange={(value) => setFormData({ ...formData, catalogType: value })}
                  required
                >
                  <SelectTrigger className="border-yellow-200">
                    <SelectValue placeholder="Pilih tipe katalog" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-yellow-200">
                    <SelectItem value="Bucket Fresh Flower">Bucket Fresh Flower</SelectItem>
                    <SelectItem value="Fresh Flower">Fresh Flower</SelectItem>
                    <SelectItem value="Bucket Fake Flower">Bucket Fake Flower</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="detail">Detail Produk</Label>
                <Textarea
                  id="detail"
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  placeholder="Deskripsi produk..."
                  className="border-yellow-200 focus:border-yellow-400 min-h-[100px] text-black placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Harga (Rp) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    placeholder="150000"
                    className="border-yellow-200 focus:border-yellow-400 text-black placeholder:text-gray-400"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stock">Stok *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    min="0"
                    placeholder="10"
                    className="border-yellow-200 focus:border-yellow-400 text-black placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="border-yellow-200">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-yellow-200">
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Booked">Booked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="productImage">Gambar Produk</Label>
                <div className="border-2 border-dashed border-yellow-200 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 bg-white hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          setImagePreview('')
                          ;(document.getElementById('productImage') as HTMLInputElement).value = ''
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Klik atau drag untuk upload gambar
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG hingga 5MB
                      </p>
                    </div>
                  )}
                  <Input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {!imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 border-yellow-200 hover:bg-yellow-50"
                      onClick={() => document.getElementById('productImage')?.click()}
                    >
                      Pilih File
                    </Button>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                  onClick={() => setDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {editingProduct ? 'Update' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat produk...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <CardProduct
              key={product.id}
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CardProduct({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white border border-yellow-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center">
        {product.image ? (
          <img
            src={`/uploads/${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🌹</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-green-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.detail || 'Tidak ada deskripsi'}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {product.catalogType}
          </span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            {product.status}
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-green-700">
            Rp {product.price.toLocaleString('id-ID')}
          </span>
          <span className="text-sm text-gray-600">
            Stok: {product.stock}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-yellow-200 hover:bg-yellow-50"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Hapus
          </Button>
        </div>
      </div>
    </div>
  )
}
