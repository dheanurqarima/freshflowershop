'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, Flower2, LogOut, LayoutDashboard, Package, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductCard from '@/components/ProductCard'
import ShoppingCartSheet from '@/components/ShoppingCartSheet'
import BookingFormDialog from '@/components/BookingFormDialog'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminProducts from '@/components/admin/AdminProducts'
import AdminBookings from '@/components/admin/AdminBookings'
import AdminCustomers from '@/components/admin/AdminCustomers'
import { useCart } from '@/contexts/CartContext'
import Footer from '@/components/Footer'

type CatalogType = 'All' | 'Bucket Fresh Flower' | 'Fresh Flower' | 'Bucket Fake Flower'

interface Product {
  id: string
  name: string
  catalogType: string
  detail: string
  price: number
  stock: number
  status: string
  image: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogType>('All')
  const [cartOpen, setCartOpen] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [adminTab, setAdminTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const { cartCount } = useCart()

  // Fetch products on mount and when filter/search changes
  useEffect(() => {
    fetchProducts()
  }, [selectedCatalog])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Check admin authentication on mount
  useEffect(() => {
    checkAdminAuth()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCatalog !== 'All') {
        params.append('catalogType', selectedCatalog)
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setAdminAuthenticated(data.authenticated)
      if (data.authenticated) {
        setAdminMode(true)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    }
  }

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setAdminAuthenticated(false)
      setAdminMode(false)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (adminMode && !adminAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setAdminAuthenticated(true)} />
  }

  if (adminMode && adminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
        {/* Admin Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-yellow-200 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Flower2 className="h-8 w-8 text-yellow-500" />
                <h1 className="text-xl font-bold text-green-800 hidden sm:block">
                  Fresh Flower Shop - Admin
                </h1>
              </div>
              <Button
                variant="outline"
                onClick={() => { handleAdminLogout(); setAdminMode(false) }}
                className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <div className="container mx-auto px-4 py-6">
          <Tabs value={adminTab} onValueChange={setAdminTab} className="space-y-6">
            <TabsList className="bg-white border border-yellow-200">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-700 data-[state=active]:text-white">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-green-700 data-[state=active]:text-white">
                <Package className="h-4 w-4 mr-2" />
                Produk
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-green-700 data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Booking
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-green-700 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Pelanggan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="products">
              <AdminProducts />
            </TabsContent>

            <TabsContent value="bookings">
              <AdminBookings />
            </TabsContent>

            <TabsContent value="customers">
              <AdminCustomers />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-yellow-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Flower2 className="h-8 w-8 text-yellow-500" />
              <div className="d-flex">
              <h1 className="text-xl font-bold text-green-800 hidden sm:block">
                Fresh Flower Shop
              </h1>
              <p className="text-xs text-green-600 d-block">Beautiful moments start here</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Cari bunga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-yellow-50 border-yellow-200 focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative bg-yellow-50 border-yellow-200 hover:bg-yellow-100">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-yellow-500 text-white text-xs p-0">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <ShoppingCartSheet onProceedToBooking={() => setBookingOpen(true)} />
              </Sheet>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdminMode(true)}
                className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Welcome Card */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-yellow-400 to-green-600 rounded-2xl p-8 md:p-12 text-white shadow-lg overflow-hidden relative">
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
              <div className="absolute animate-float-1" style={{ top: '10%', right: '20%' }}>
                <Flower2 className="h-32 w-32" />
              </div>
              <div className="absolute animate-float-2" style={{ top: '40%', right: '10%' }}>
                <Flower2 className="h-24 w-24" />
              </div>
              <div className="absolute animate-float-3" style={{ top: '70%', right: '30%' }}>
                <Flower2 className="h-20 w-20" />
              </div>
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                🌸 Selamat Datang di Fresh Flower Shop!
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                Temukan bunga terindah untuk setiap momen spesial Anda.
                Kualitas terbaik dengan harga terjangkau!
              </p>
            </div>
          </div>
        </section>

        {/* Product Filters */}
        <section className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-white rounded-xl shadow-sm border border-yellow-200">
            {(['All', 'Bucket Fresh Flower', 'Fresh Flower', 'Bucket Fake Flower'] as CatalogType[]).map((catalog) => (
              <Button
                key={catalog}
                variant={selectedCatalog === catalog ? "default" : "outline"}
                onClick={() => setSelectedCatalog(catalog)}
                className={
                  selectedCatalog === catalog
                    ? "bg-green-700 hover:bg-green-700 text-yellow-100"
                    : "bg-white border-yellow-200 hover:bg-yellow-50 text-green-800"
                }
              >
                <Flower2 className="h-4 w-4 mr-2" />
                {catalog}
              </Button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="container mx-auto px-4 py-6 pb-24">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Memuat produk...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🌸</div>
              <p className="text-lg">Tidak ada produk ditemukan</p>
              <p className="text-sm">Coba ubah kata kunci pencarian atau filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  catalogType={product.catalogType as any}
                  detail={product.detail || ''}
                  price={product.price}
                  stock={product.stock}
                  status={product.status}
                  image={product.image}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer - Only show on customer page */}
      <Footer />

      {/* Booking Form Dialog */}
      <BookingFormDialog open={bookingOpen} onOpenChange={setBookingOpen} />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float-1 {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float 5s ease-in-out infinite 0.5s;
        }
        .animate-float-3 {
          animation: float 6s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  )
}
