import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    const services = await prisma.serviceCatalog.findMany({
      where: showAll ? {} : { active: true },
      orderBy: [
        { active: 'desc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(services)

  } catch (error) {
    console.error('Error fetching services:', error)
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
      description,
      category,
      price
    } = body

    // Validaciones básicas
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      )
    }

    // Crear el servicio
    const service = await prisma.serviceCatalog.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        price: parseFloat(price),
        active: true
      }
    })

    return NextResponse.json(service, { status: 201 })

  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}