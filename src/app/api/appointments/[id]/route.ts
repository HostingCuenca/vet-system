import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        pet: {
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
            }
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(appointment)

  } catch (error) {
    console.error('Error fetching appointment:', error)
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
      petId,
      veterinarianId,
      appointmentDate,
      appointmentTime,
      duration,
      reason,
      status,
      notes
    } = body

    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Si se están cambiando fecha/hora/veterinario, verificar disponibilidad
    if (
      (appointmentDate && appointmentDate !== existingAppointment.appointmentDate.toISOString().split('T')[0]) ||
      (appointmentTime && appointmentTime !== existingAppointment.appointmentTime) ||
      (veterinarianId && veterinarianId !== existingAppointment.veterinarianId)
    ) {
      const newVetId = veterinarianId || existingAppointment.veterinarianId
      const newDate = appointmentDate || existingAppointment.appointmentDate.toISOString().split('T')[0]
      const newTime = appointmentTime || existingAppointment.appointmentTime

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: parseInt(id) }, // Excluir la cita actual
          veterinarianId: parseInt(newVetId),
          appointmentDate: new Date(newDate),
          appointmentTime: newTime,
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
          }
        }
      })

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'El veterinario ya tiene una cita programada en ese horario' },
          { status: 409 }
        )
      }
    }

    // Actualizar la cita
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        ...(petId && { petId: parseInt(petId) }),
        ...(veterinarianId && { veterinarianId: parseInt(veterinarianId) }),
        ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
        ...(appointmentTime && { appointmentTime }),
        ...(duration && { duration: parseInt(duration) }),
        ...(reason && { reason: reason.trim() }),
        ...(status && { status }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
      include: {
        pet: {
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
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(updatedAppointment)

  } catch (error) {
    console.error('Error updating appointment:', error)
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
    
    // Verificar que la cita existe
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Marcar como cancelada en lugar de eliminar
    const cancelledAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CANCELLED',
        notes: appointment.notes 
          ? `${appointment.notes}\n\nCancelada el ${new Date().toLocaleString('es-ES')}`
          : `Cancelada el ${new Date().toLocaleString('es-ES')}`
      }
    })

    return NextResponse.json(cancelledAppointment)

  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}