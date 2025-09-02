import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      where: {
        active: true
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
      },
      orderBy: [
        { internalId: 'asc' }
      ]
    })

    return NextResponse.json(pets)

  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función helper para auto-generar internalId
async function generateInternalId(): Promise<string> {
  const lastPet = await prisma.pet.findFirst({
    orderBy: { id: 'desc' },
    select: { internalId: true }
  })

  if (!lastPet) return 'P001'

  const lastNumber = parseInt(lastPet.internalId.slice(1))
  const nextNumber = lastNumber + 1

  return `P${nextNumber.toString().padStart(3, '0')}`
}

// Función helper para generar QR code
function generateQRCode(): string {
  return `PET-${crypto.randomUUID()}`
}

export async function POST(request: Request) {
  try {
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
      const existingPet = await prisma.pet.findFirst({
        where: { microchip: microchip.trim() }
      })

      if (existingPet) {
        return NextResponse.json(
          { error: 'Ya existe una mascota con este microchip' },
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

    // Auto-generar campos
    const internalId = await generateInternalId()
    const qrCode = generateQRCode()

    // Crear la mascota
    const pet = await prisma.pet.create({
      data: {
        name: name.trim(),
        internalId,
        qrCode,
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

    // Si hay peso inicial, crear registro en historial
    if (currentWeight) {
      await prisma.petWeight.create({
        data: {
          petId: pet.id,
          weight: parseFloat(currentWeight),
          recordedBy: 'SYSTEM',
          notes: 'Peso inicial'
        }
      })
    }

    return NextResponse.json(pet, { status: 201 })

  } catch (error) {
    console.error('Error creating pet:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}