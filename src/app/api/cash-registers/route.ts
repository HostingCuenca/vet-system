import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const registers = await prisma.cashRegister.findMany({
      where: { active: true },
      include: {
        sessions: {
          where: { status: 'OPEN' },
          include: {
            openedByUser: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(registers)

  } catch (error) {
    console.error('Error fetching cash registers:', error)
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
      name,
      location
    } = body

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Nombre y ubicación son requeridos' },
        { status: 400 }
      )
    }

    const register = await prisma.cashRegister.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        active: true
      }
    })

    return NextResponse.json(register, { status: 201 })

  } catch (error) {
    console.error('Error creating cash register:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}