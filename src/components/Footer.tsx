'use client'

import { Flower2, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flower2 className="h-8 w-8 text-yellow-400" />
              <h3 className="text-xl font-bold">Fresh Flower Shop</h3>
            </div>
            <p className="text-green-100 text-sm">
              Temukan bunga terindah untuk setiap momen spesial Anda. 
              Kualitas terbaik dengan harga terjangkau!
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-yellow-400">Hubungi Kami</h4>
            <div className="space-y-2 text-sm text-green-100">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@freshflowershop.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jalan Bunga No. 123, Jakarta</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-semibold mb-4 text-yellow-400">Jam Operasional</h4>
            <div className="space-y-1 text-sm text-green-100">
              <div>Senin - Jumat: 08:00 - 20:00</div>
              <div>Sabtu: 09:00 - 18:00</div>
              <div>Minggu: 10:00 - 17:00</div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-6 text-center text-sm text-green-200">
          <p>© {new Date().getFullYear()} Fresh Flower Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
