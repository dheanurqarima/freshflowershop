import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { unlink } from 'fs/promises'
import path from 'path'

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const catalogType = formData.get('catalogType') as string
    const detail = formData.get('detail') as string
    const price = formData.get('price') as string
    const stock = formData.get('stock') as string
    const status = formData.get('status') as string
    const imageFile = formData.get('image') as File

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    let imageName = existingProduct.image

    // Handle new image upload
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
      
      // Save new file
      const filePath = path.join(uploadDir, imageName)
      await writeFile(filePath, buffer)

      // Delete old image if exists
      if (existingProduct.image) {
        try {
          const oldFilePath = path.join(uploadDir, existingProduct.image)
          await unlink(oldFilePath)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        catalogType,
        detail,
        price: price ? parseFloat(price) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        status,
        image: imageName
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { isDeleted: true }
    })

    return NextResponse.json({
      message: 'Product soft deleted successfully'
    })
  } catch (error) {
    console.error('SOFT DELETE ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
