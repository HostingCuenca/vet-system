import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true
      },
      include: {
        category: true,
        batches: {
          where: {
            status: 'ACTIVE',
            quantity: {
              gt: 0
            }
          },
          orderBy: {
            expirationDate: 'asc'
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    })

    return NextResponse.json(products)

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      categoryId, 
      description, 
      unitType, 
      unitPrice, 
      currentStock, 
      minimumStock, 
      maximumStock,
      requiresPrescription, 
      supplier,
      trackBatches 
    } = body

    // Validaciones básicas
    if (!name || !unitType) {
      return NextResponse.json(
        { error: 'Nombre y tipo de unidad son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un producto con este nombre
    const existingProduct = await prisma.product.findFirst({
      where: { 
        name: name.trim(),
        active: true
      }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este nombre' },
        { status: 400 }
      )
    }

    // Validar categoría si se proporciona
    if (categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: parseInt(categoryId) }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'La categoría no existe' },
          { status: 400 }
        )
      }
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        categoryId: categoryId ? parseInt(categoryId) : null,
        description: description?.trim() || null,
        unitType,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        currentStock: currentStock ? parseInt(currentStock) : 0,
        minimumStock: minimumStock ? parseInt(minimumStock) : 5,
        maximumStock: maximumStock ? parseInt(maximumStock) : null,
        requiresPrescription: requiresPrescription || false,
        supplier: supplier?.trim() || null,
        trackBatches: trackBatches || false,
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}