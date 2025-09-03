import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const reminder = await prisma.reminder.findUnique({
      where: { id: parseInt(id) },
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
      }
    })

    if (!reminder) {
      return NextResponse.json(
        { error: 'Recordatorio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(reminder)

  } catch (error) {
    console.error('Error fetching reminder:', error)
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
      reminderType,
      title,
      message,
      dueDate,
      dueTime,
      priority,
      method,
      status
    } = body

    // Verificar que el recordatorio existe
    const existingReminder = await prisma.reminder.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingReminder) {
      return NextResponse.json(
        { error: 'Recordatorio no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el recordatorio
    const updatedReminder = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: {
        ...(reminderType && { reminderType }),
        ...(title && { title: title.trim() }),
        ...(message && { message: message.trim() }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(dueTime !== undefined && { 
          dueTime: dueTime ? new Date(`1970-01-01T${dueTime}:00.000Z`) : null 
        }),
        ...(priority && { priority }),
        ...(method && { method }),
        ...(status && { status }),
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

    return NextResponse.json(updatedReminder)

  } catch (error) {
    console.error('Error updating reminder:', error)
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
    
    // Verificar que el recordatorio existe
    const reminder = await prisma.reminder.findUnique({
      where: { id: parseInt(id) }
    })

    if (!reminder) {
      return NextResponse.json(
        { error: 'Recordatorio no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el recordatorio
    await prisma.reminder.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Recordatorio eliminado correctamente' })

  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Marcar como enviado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, sentBy } = body

    if (action === 'mark-sent') {
      const updatedReminder = await prisma.reminder.update({
        where: { id: parseInt(id) },
        data: {
          status: 'SENT',
          sentDate: new Date(),
          sentBy: sentBy ? parseInt(sentBy) : null
        }
      })

      return NextResponse.json(updatedReminder)
    } else if (action === 'mark-completed') {
      const updatedReminder = await prisma.reminder.update({
        where: { id: parseInt(id) },
        data: {
          status: 'COMPLETED'
        }
      })

      return NextResponse.json(updatedReminder)
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating reminder status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}