import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        batches: {
          orderBy: {
            expirationDate: 'asc'
          }
        },
        stockMovements: {
          take: 20,
          orderBy: {
            movementDate: 'desc'
          },
          include: {
            performer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      categoryId,
      description,
      unitType,
      unitPrice,
      minimumStock,
      maximumStock,
      requiresPrescription,
      supplier,
      trackBatches
    } = body

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el nombre ya existe en otro producto
    if (name && name.trim() !== existingProduct.name) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          name: name.trim(),
          id: { not: parseInt(id) },
          active: true
        }
      })

      if (duplicateProduct) {
        return NextResponse.json(
          { error: 'Ya existe otro producto con este nombre' },
          { status: 400 }
        )
      }
    }

    // Actualizar el producto
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(unitType && { unitType }),
        ...(unitPrice !== undefined && { unitPrice: unitPrice ? parseFloat(unitPrice) : null }),
        ...(minimumStock !== undefined && { minimumStock: parseInt(minimumStock) }),
        ...(maximumStock !== undefined && { maximumStock: maximumStock ? parseInt(maximumStock) : null }),
        ...(requiresPrescription !== undefined && { requiresPrescription }),
        ...(supplier !== undefined && { supplier: supplier?.trim() || null }),
        ...(trackBatches !== undefined && { trackBatches }),
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(updatedProduct)

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete: marcar como inactivo
    const deactivatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        active: false
      }
    })

    return NextResponse.json(deactivatedProduct)

  } catch (error) {
    console.error('Error deactivating product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}