import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

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

    let imageUrl = ''

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const ext = imageFile.name.split('.').pop()
      const fileName = `products/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: false
        })

      if (error) {
        console.error(error)
        return NextResponse.json(
          { error: 'Image upload failed' },
          { status: 500 }
        )
      }

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`
    }

    const product = await prisma.product.create({
      data: {
        name,
        catalogType,
        detail,
        price,
        stock,
        status,
        image: imageUrl
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
