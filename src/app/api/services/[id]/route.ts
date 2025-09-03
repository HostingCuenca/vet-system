import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      name,
      description,
      category,
      price,
      active = true
    } = body

    const id = parseInt(params.id)

    // Validaciones básicas
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el servicio existe
    const existingService = await prisma.serviceCatalog.findUnique({
      where: { id }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el servicio
    const service = await prisma.serviceCatalog.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        price: parseFloat(price),
        active: Boolean(active),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(service)

  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Verificar que el servicio existe
    const existingService = await prisma.serviceCatalog.findUnique({
      where: { id }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // En lugar de eliminar completamente, marcar como inactivo
    // para preservar el historial de ventas
    const service = await prisma.serviceCatalog.update({
      where: { id },
      data: {
        active: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Servicio desactivado correctamente', service })

  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const service = await prisma.serviceCatalog.findUnique({
      where: { id }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(service)

  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}