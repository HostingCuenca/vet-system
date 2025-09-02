import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        pets: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            species: true,
            internalId: true,
            breed: true,
            birthDate: true,
            gender: true,
            createdAt: true,
          }
        }
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(owner)

  } catch (error) {
    console.error('Error fetching owner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, identificationNumber, phone, email, address } = body

    // Validaciones básicas
    if (!name || !identificationNumber) {
      return NextResponse.json(
        { error: 'Nombre y cédula son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el propietario existe
    const existingOwner = await prisma.owner.findUnique({
      where: { id }
    })

    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si la cédula ya existe en otro propietario
    const ownerWithSameId = await prisma.owner.findFirst({
      where: {
        identificationNumber: identificationNumber.trim(),
        id: { not: id }
      }
    })

    if (ownerWithSameId) {
      return NextResponse.json(
        { error: 'Ya existe otro propietario con esta cédula' },
        { status: 400 }
      )
    }

    // Actualizar el propietario
    const updatedOwner = await prisma.owner.update({
      where: { id },
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

    return NextResponse.json(updatedOwner)

  } catch (error) {
    console.error('Error updating owner:', error)
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

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar si el propietario existe
    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        pets: {
          where: { active: true }
        }
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene mascotas activas
    if (owner.pets.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un propietario con mascotas activas' },
        { status: 400 }
      )
    }

    // Eliminar el propietario
    await prisma.owner.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Propietario eliminado exitosamente' })

  } catch (error) {
    console.error('Error deleting owner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}