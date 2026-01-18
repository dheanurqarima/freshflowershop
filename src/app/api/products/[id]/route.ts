import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is missing' },
        { status: 400 }
      )
    }

    const formData = await request.formData()

    const name = formData.get('name') as string
    const catalogType = formData.get('catalogType') as string
    const detail = formData.get('detail') as string
    const price = Number(formData.get('price'))
    const stock = Number(formData.get('stock'))
    const status = formData.get('status') as string
    const image = formData.get('image') as File | null

    if (!name || !catalogType || isNaN(price) || isNaN(stock)) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      )
    }

    const existing = await prisma.product.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    let imageUrl = existing.image

    // 🔹 Jika user upload gambar baru
    if (image && image.size > 0) {
      // TODO: upload ke storage (Supabase / local / cloudinary)
      // sementara contoh:
      imageUrl = existing.image
    }

    await prisma.product.update({
      where: { id },
      data: {
        name,
        catalogType,
        detail,
        price,
        stock,
        status,
        image: imageUrl,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Product updated successfully' })
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is missing' },
        { status: 400 }
      )
    }

    const existing = await prisma.product.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // soft delete
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    })

    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('DELETE PRODUCT ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

