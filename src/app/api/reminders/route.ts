import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            internalId: true,
            species: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            identificationNumber: true,
            phone: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ]
    })

    return NextResponse.json(reminders)

  } catch (error) {
    console.error('Error fetching reminders:', error)
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
      petId, 
      reminderType,
      title,
      message,
      dueDate,
      dueTime,
      priority,
      method,
      createdById
    } = body

    // Validaciones básicas
    if (!petId || !reminderType || !title || !message || !dueDate) {
      return NextResponse.json(
        { error: 'Mascota, tipo, título, mensaje y fecha son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la mascota existe
    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(petId) },
      include: {
        owner: true
      }
    })

    if (!pet) {
      return NextResponse.json(
        { error: 'La mascota no existe' },
        { status: 400 }
      )
    }

    // Crear el recordatorio
    const reminder = await prisma.reminder.create({
      data: {
        petId: parseInt(petId),
        ownerId: pet.ownerId,
        reminderType,
        title: title.trim(),
        message: message.trim(),
        dueDate: new Date(dueDate),
        dueTime: dueTime ? new Date(`1970-01-01T${dueTime}:00.000Z`) : null,
        priority: priority || 'MEDIUM',
        method: method || 'WHATSAPP',
        status: 'PENDING',
        createdBy: parseInt(createdById) || 1 // Default admin user
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            internalId: true,
            species: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            identificationNumber: true,
            phone: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(reminder, { status: 201 })

  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}