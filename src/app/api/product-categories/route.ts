import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        products: {
          where: {
            active: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    // Validaciones básicas
    if (!name) {
      return NextResponse.json(
        { error: 'Nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una categoría con este nombre
    const existingCategory = await prisma.productCategory.findFirst({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con este nombre' },
        { status: 400 }
      )
    }

    // Crear la categoría
    const category = await prisma.productCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      }
    })

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}