import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()

    // ===== BASIC FIELDS =====
    const name = formData.get('name') as string
    const catalogType = formData.get('catalogType') as string
    const detail = formData.get('detail') as string
    const status = formData.get('status') as string
    const imageFile = formData.get('image') as File | null
    const priceRaw = formData.get('price') as string | null
    const stockRaw = formData.get('stock') as string | null

    // ===== GET EXISTING PRODUCT =====
    const existing = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // ===== SAFE PARSE PRICE & STOCK =====
    const price =
      priceRaw && priceRaw !== ''
        ? parseFloat(priceRaw)
        : existing.price

    const stock =
      stockRaw && stockRaw !== ''
        ? parseInt(stockRaw)
        : existing.stock

    // ===== IMAGE HANDLING =====
    let imageUrl = existing.image

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const ext = imageFile.name.split('.').pop()
      const fileName = `products/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true
        })

      if (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
          { error: 'Image upload failed' },
          { status: 500 }
        )
      }

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`
    }

    // ===== UPDATE PRODUCT =====
    const updated = await prisma.product.update({
      where: { id: params.id },
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
