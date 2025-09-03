import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    const where = sessionId ? { cashSessionId: parseInt(sessionId) } : {}

    const movements = await prisma.cashMovement.findMany({
      where,
      include: {
        cashSession: {
          select: {
            id: true,
            openedAt: true,
            cashRegister: {
              select: {
                name: true,
                location: true
              }
            }
          }
        },
        performer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(movements)

  } catch (error) {
    console.error('Error fetching cash movements:', error)
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
      sessionId,
      movementType,
      amount,
      reason,
      performedBy
    } = body

    // Validaciones
    if (!sessionId || !movementType || !amount || !reason || !performedBy) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (!['IN', 'OUT', 'ADJUSTMENT', 'EXPIRED', 'LOST'].includes(movementType)) {
      return NextResponse.json(
        { error: 'Tipo de movimiento no válido' },
        { status: 400 }
      )
    }

    // Verificar que la sesión existe y está abierta
    const session = await prisma.cashSession.findUnique({
      where: { id: parseInt(sessionId) }
    })

    if (!session || session.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Sesión de caja no encontrada o cerrada' },
        { status: 400 }
      )
    }

    // Crear el movimiento
    const movement = await prisma.cashMovement.create({
      data: {
        cashSessionId: parseInt(sessionId),
        movementType,
        amount: parseFloat(amount),
        reason: reason.trim(),
        performedBy: parseInt(performedBy)
      },
      include: {
        cashSession: {
          select: {
            id: true,
            openedAt: true,
            cashRegister: {
              select: {
                name: true,
                location: true
              }
            }
          }
        },
        performer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(movement, { status: 201 })

  } catch (error) {
    console.error('Error creating cash movement:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}