import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Fetching appointments with relations...')
    
    const appointmentCount = await prisma.appointment.count()
    console.log('Total appointments in DB:', appointmentCount)
    
    if (appointmentCount === 0) {
      return NextResponse.json([])
    }
    
    // Get appointments with all related data
    const appointments = await prisma.appointment.findMany({
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
        },
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' }
      ]
    })
    
    console.log('Appointments with relations fetched:', appointments.length)
    
    // Transform the data to match the expected format
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.durationMinutes, // Map durationMinutes to duration
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      pet: appointment.pet,
      veterinarian: appointment.veterinarian,
      createdBy: appointment.creator // Map creator to createdBy
    }))

    return NextResponse.json(transformedAppointments)

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating appointment...')
    const body = await request.json()
    console.log('Request body:', body)
    
    const {
      petId,
      veterinarianId,
      appointmentDate,
      appointmentTime,
      duration = 30,
      reason,
      notes,
      createdById
    } = body

    console.log('Parsed data:', { petId, veterinarianId, appointmentDate, appointmentTime, duration, reason })

    // Validaciones básicas
    if (!petId || !veterinarianId || !appointmentDate || !appointmentTime || !reason) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'Mascota, veterinario, fecha, hora y motivo son requeridos' },
        { status: 400 }
      )
    }

    console.log('Basic validation passed')

    try {
      // Verificar que la mascota existe
      console.log('Checking if pet exists with ID:', petId)
      const petData = await prisma.pet.findUnique({
        where: { id: parseInt(petId) },
        include: { owner: true }
      })

      if (!petData) {
        console.log('Pet not found')
        return NextResponse.json(
          { error: 'La mascota no existe' },
          { status: 400 }
        )
      }
      
      console.log('Pet found:', petData.name)

      // Verificar que el veterinario existe
      console.log('Checking if veterinarian exists with ID:', veterinarianId)
      const vetData = await prisma.user.findFirst({
        where: {
          id: parseInt(veterinarianId),
          role: 'VETERINARIAN',
          active: true
        }
      })

      if (!vetData) {
        console.log('Veterinarian not found or not active')
        return NextResponse.json(
          { error: 'El veterinario no existe o no está activo' },
          { status: 400 }
        )
      }
      
      console.log('Veterinarian found:', vetData.name)

      // Simple appointment creation
      console.log('Creating appointment...')
      const appointment = await prisma.appointment.create({
        data: {
          appointmentDate: new Date(appointmentDate),
          appointmentTime: new Date(`1970-01-01T${appointmentTime}:00.000Z`),
          durationMinutes: parseInt(duration),
          reason: reason.trim(),
          notes: notes?.trim() || null,
          status: 'SCHEDULED',
          pet: {
            connect: { id: parseInt(petId) }
          },
          veterinarian: {
            connect: { id: parseInt(veterinarianId) }
          },
          creator: {
            connect: { id: parseInt(veterinarianId) }
          },
          owner: {
            connect: { id: petData.owner.id }
          }
        }
      })
      
      console.log('Appointment created successfully:', appointment.id)

      // Return appointment with full data structure expected by frontend
      const fullAppointment = {
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        duration: appointment.durationMinutes,
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
        pet: {
          ...petData,
          owner: {
            id: petData.owner.id,
            name: petData.owner.name,
            identificationNumber: petData.owner.identificationNumber,
            phone: petData.owner.phone,
          }
        },
        veterinarian: {
          id: vetData.id,
          name: vetData.name,
          email: vetData.email,
        },
        createdBy: {
          id: vetData.id,
          name: vetData.name,
        }
      }

      return NextResponse.json(fullAppointment, { status: 201 })

    } catch (dbError) {
      console.error('Database error in POST:', dbError)
      return NextResponse.json(
        { error: 'Database error', details: dbError.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('General error creating appointment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}