import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET - Fetch all products or filter by catalog type
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const catalogType = searchParams.get('catalogType')
    const search = searchParams.get('search')

    const where: any = {}

    if (catalogType && catalogType !== 'All') {
      where.catalogType = catalogType
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const products = await prisma.product.findMany({
      where: {
        ...where,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create new product with image upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const catalogType = formData.get('catalogType') as string
    const detail = formData.get('detail') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const status = formData.get('status') as string || 'Available'
    const imageFile = formData.get('image') as File

    if (!name || !catalogType || isNaN(price) || isNaN(stock)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let imageName = ''
    
    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      
      // Generate unique filename
      const timestamp = Date.now()
      const ext = path.extname(imageFile.name)
      imageName = `${timestamp}${ext}`
      
      // Save file
      const filePath = path.join(uploadDir, imageName)
      await writeFile(filePath, buffer)
    }

    const product = await prisma.product.create({
      data: {
        name,
        catalogType,
        detail,
        price,
        stock,
        status,
        image: imageName
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
