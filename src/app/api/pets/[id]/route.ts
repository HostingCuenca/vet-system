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

    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            identificationNumber: true,
            phone: true,
            email: true,
            address: true,
          }
        },
        weights: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            weight: true,
            recordedAt: true,
            recordedBy: true,
            notes: true,
          }
        },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          take: 3,
          select: {
            id: true,
            visitDate: true,
            diagnosis: true,
            symptoms: true,
            veterinarian: true,
          }
        },
        vaccinations: {
          orderBy: { vaccinationDate: 'desc' },
          take: 5,
          select: {
            id: true,
            vaccineName: true,
            vaccinationDate: true,
            veterinarian: true,
            nextDueDate: true,
          }
        }
      }
    })

    if (!pet) {
      return NextResponse.json(
        { error: 'Mascota no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(pet)

  } catch (error) {
    console.error('Error fetching pet:', error)
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
    const { 
      name, 
      species, 
      breed, 
      birthDate, 
      gender, 
      color, 
      microchip, 
      currentWeight, 
      notes, 
      ownerId 
    } = body

    // Validaciones básicas
    if (!name || !ownerId || !species) {
      return NextResponse.json(
        { error: 'Nombre, propietario y especie son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la mascota existe
    const existingPet = await prisma.pet.findUnique({
      where: { id }
    })

    if (!existingPet) {
      return NextResponse.json(
        { error: 'Mascota no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el propietario existe
    const owner = await prisma.owner.findUnique({
      where: { id: parseInt(ownerId) }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'El propietario no existe' },
        { status: 400 }
      )
    }

    // Verificar microchip único si se proporciona
    if (microchip) {
      const petWithSameMicrochip = await prisma.pet.findFirst({
        where: {
          microchip: microchip.trim(),
          id: { not: id }
        }
      })

      if (petWithSameMicrochip) {
        return NextResponse.json(
          { error: 'Ya existe otra mascota con este microchip' },
          { status: 400 }
        )
      }
    }

    // Validar peso
    if (currentWeight && (parseFloat(currentWeight) <= 0 || parseFloat(currentWeight) > 999.99)) {
      return NextResponse.json(
        { error: 'El peso debe estar entre 0.01 y 999.99 kg' },
        { status: 400 }
      )
    }

    // Validar fecha de nacimiento
    if (birthDate && new Date(birthDate) > new Date()) {
      return NextResponse.json(
        { error: 'La fecha de nacimiento no puede ser futura' },
        { status: 400 }
      )
    }

    // Verificar si el peso cambió para crear registro
    const weightChanged = currentWeight && 
      parseFloat(currentWeight) !== parseFloat(existingPet.currentWeight?.toString() || '0')

    // Actualizar la mascota
    const updatedPet = await prisma.pet.update({
      where: { id },
      data: {
        name: name.trim(),
        species,
        breed: breed?.trim() || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: gender || 'UNKNOWN',
        color: color?.trim() || null,
        microchip: microchip?.trim() || null,
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        notes: notes?.trim() || null,
        ownerId: parseInt(ownerId),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            identificationNumber: true,
            phone: true,
          }
        }
      }
    })

    // Si el peso cambió, crear registro en historial
    if (weightChanged) {
      await prisma.petWeight.create({
        data: {
          petId: id,
          weight: parseFloat(currentWeight),
          recordedBy: 'SYSTEM',
          notes: 'Actualización de peso'
        }
      })
    }

    return NextResponse.json(updatedPet)

  } catch (error) {
    console.error('Error updating pet:', error)
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

    // Verificar que la mascota existe
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        medicalRecords: true,
        appointments: {
          where: {
            status: { in: ['SCHEDULED', 'CONFIRMED'] }
          }
        }
      }
    })

    if (!pet) {
      return NextResponse.json(
        { error: 'Mascota no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene citas activas
    if (pet.appointments.length > 0) {
      return NextResponse.json(
        { error: 'No se puede desactivar una mascota con citas programadas' },
        { status: 400 }
      )
    }

    // Soft delete - desactivar mascota
    await prisma.pet.update({
      where: { id },
      data: { 
        active: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Mascota desactivada exitosamente',
      petName: pet.name,
      internalId: pet.internalId
    })

  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}