import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const owners = await prisma.owner.findMany({
      include: {
        pets: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            species: true,
            internalId: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(owners)

  } catch (error) {
    console.error('Error fetching owners:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, identificationNumber, phone, email, address } = body

    // Validaciones básicas
    if (!name || !identificationNumber) {
      return NextResponse.json(
        { error: 'Nombre y cédula son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un propietario con esta cédula
    const existingOwner = await prisma.owner.findUnique({
      where: { identificationNumber }
    })

    if (existingOwner) {
      return NextResponse.json(
        { error: 'Ya existe un propietario con esta cédula' },
        { status: 400 }
      )
    }

    // Crear el propietario
    const owner = await prisma.owner.create({
      data: {
        name: name.trim(),
        identificationNumber: identificationNumber.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
      },
      include: {
        pets: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            species: true,
            internalId: true,
          }
        }
      }
    })

    return NextResponse.json(owner, { status: 201 })

  } catch (error) {
    console.error('Error creating owner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}