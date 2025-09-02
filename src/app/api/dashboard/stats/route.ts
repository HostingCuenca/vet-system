import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get today's date for appointments
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    // Fetch all stats in parallel
    const [
      totalOwners,
      totalPets,
      todayAppointments,
      lowStockProducts,
      pendingReminders
    ] = await Promise.all([
      prisma.owner.count(),
      
      prisma.pet.count({
        where: { active: true }
      }),
      
      prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
          }
        }
      }),
      
      prisma.product.count({
        where: {
          active: true,
          currentStock: {
            lte: prisma.product.fields.minimumStock
          }
        }
      }),
      
      prisma.reminder.count({
        where: {
          status: 'PENDING',
          dueDate: {
            lte: today
          }
        }
      })
    ])

    return NextResponse.json({
      totalOwners,
      totalPets,
      todayAppointments,
      lowStockProducts,
      pendingReminders,
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}