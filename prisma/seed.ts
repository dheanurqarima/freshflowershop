import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Check if products already exist
  const existingProducts = await prisma.product.count()
  if (existingProducts > 0) {
    console.log('✅ Products already exist, skipping seed')
    return
  }

  // Create sample products
  const products = [
    {
      name: 'Rose Bouquet Premium',
      catalogType: 'Bucket Fresh Flower',
      detail: 'Bucket mawar merah premium dengan wrapping elegan. Cocok untuk hadiah ulang tahun atau anniversary.',
      price: 250000,
      stock: 15,
      status: 'Available',
      image: ''
    },
    {
      name: 'Sunflower Field',
      catalogType: 'Fresh Flower',
      detail: 'Bunga matahari segar dengan batang panjang. Menambahkan keceriaan di ruangan Anda.',
      price: 85000,
      stock: 20,
      status: 'Available',
      image: ''
    },
    {
      name: 'Pink Lily Elegance',
      catalogType: 'Bucket Fresh Flower',
      detail: 'Lily pink yang elegan dengan filler baby breath. Sempurna untuk momen romantis.',
      price: 350000,
      stock: 10,
      status: 'Available',
      image: ''
    },
    {
      name: 'Mixed Flower Bucket',
      catalogType: 'Bucket Fresh Flower',
      detail: 'Kombinasi berbagai bunga segar dengan warna-warna cerah. Cocok untuk ucapan selamat.',
      price: 180000,
      stock: 12,
      status: 'Available',
      image: ''
    },
    {
      name: 'Tulip Romance',
      catalogType: 'Fresh Flower',
      detail: 'Bunga tulip merah yang melambangkan cinta sejati. Kualitas impor premium.',
      price: 200000,
      stock: 8,
      status: 'Available',
      image: ''
    },
    {
      name: 'Orchid White',
      catalogType: 'Fresh Flower',
      detail: 'Anggrek putih yang tahan lama dan elegan. Dekorasi modern untuk rumah atau kantor.',
      price: 300000,
      stock: 6,
      status: 'Available',
      image: ''
    },
    {
      name: 'Hydrangea Blue',
      catalogType: 'Bucket Fresh Flower',
      detail: 'Hydrangea biru yang cantik dengan volum penuh. Bucket premium dengan wrapping eksklusif.',
      price: 400000,
      stock: 5,
      status: 'Available',
      image: ''
    },
    {
      name: 'Carnation Bundle',
      catalogType: 'Fresh Flower',
      detail: 'Bundel karnasi warna-warni. Tahan lama dan cocok untuk berbagai kesempatan.',
      price: 120000,
      stock: 18,
      status: 'Available',
      image: ''
    },
    {
      name: 'Silk Rose Arrangement',
      catalogType: 'Bucket Fake Flower',
      detail: 'Aransemen mawar sutra yang terlihat natural. Tahan lama untuk dekorasi permanen.',
      price: 150000,
      stock: 25,
      status: 'Available',
      image: ''
    },
    {
      name: 'Artificial Sunflower',
      catalogType: 'Bucket Fake Flower',
      detail: 'Bunga matahari buatan yang cerah dan tahan lama. Dekorasi yang tidak memerlukan perawatan.',
      price: 95000,
      stock: 30,
      status: 'Available',
      image: ''
    },
    {
      name: 'Premium Rose Box',
      catalogType: 'Bucket Fresh Flower',
      detail: 'Box mawar merah premium dengan desain eksklusif. Hadiah mewah untuk orang terkasih.',
      price: 450000,
      stock: 7,
      status: 'Available',
      image: ''
    },
    {
      name: 'Gerbera Daisy Mix',
      catalogType: 'Fresh Flower',
      detail: 'Gerbera dengan berbagai warna cerah. Bunga yang ramah dan menyenangkan.',
      price: 75000,
      stock: 22,
      status: 'Available',
      image: ''
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
    console.log(`✓ Created: ${product.name}`)
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
