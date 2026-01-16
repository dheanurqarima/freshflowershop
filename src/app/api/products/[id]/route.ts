import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const catalogType = formData.get('catalogType') as string
    const detail = formData.get('detail') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const status = formData.get('status') as string
    const imageFile = formData.get('image') as File | null

    const existing = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    let imageUrl = existing.image

    // 🔥 UPLOAD GAMBAR BARU JIKA ADA
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
        console.error(error)
        return NextResponse.json(
          { error: 'Image upload failed' },
          { status: 500 }
        )
      }

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`
    }

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