import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sessions = await prisma.cashSession.findMany({
      include: {
        cashRegister: true,
        openedByUser: {
          select: {
            id: true,
            name: true
          }
        },
        closedByUser: {
          select: {
            id: true,
            name: true
          }
        },
        sales: {
          select: {
            id: true,
            total: true,
            createdAt: true
          }
        },
        cashMovements: {
          select: {
            id: true,
            movementType: true,
            amount: true,
            reason: true,
            createdAt: true
          }
        }
      },
      orderBy: { openedAt: 'desc' }
    })

    return NextResponse.json(sessions)

  } catch (error) {
    console.error('Error fetching cash sessions:', error)
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
      cashRegisterId, 
      openingBalance, 
      openedBy,
      action 
    } = body

    if (action === 'open') {
      // Check if there's already an open session for this register
      const existingSession = await prisma.cashSession.findFirst({
        where: {
          cashRegisterId: parseInt(cashRegisterId),
          status: 'OPEN'
        }
      })

      if (existingSession) {
        return NextResponse.json(
          { error: 'Ya hay una sesión de caja abierta para este registro' },
          { status: 400 }
        )
      }

      // Generate session number
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const sessionCount = await prisma.cashSession.count({
        where: {
          sessionNumber: {
            startsWith: `CSH${today}`
          }
        }
      })
      const sessionNumber = `CSH${today}${String(sessionCount + 1).padStart(3, '0')}`

      // Create new cash session
      const session = await prisma.cashSession.create({
        data: {
          sessionNumber,
          cashRegisterId: parseInt(cashRegisterId),
          initialCash: parseFloat(openingBalance),
          status: 'OPEN',
          openedBy: parseInt(openedBy)
        },
        include: {
          cashRegister: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          openedByUser: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      // Create initial cash movement for opening balance
      if (parseFloat(openingBalance) > 0) {
        await prisma.cashMovement.create({
          data: {
            cashSessionId: session.id,
            movementType: 'IN',
            amount: parseFloat(openingBalance),
            reason: 'Apertura de caja',
            performedBy: parseInt(openedBy)
          }
        })
      }

      return NextResponse.json(session, { status: 201 })

    } else if (action === 'close') {
      const { sessionId, finalBalance, closedBy } = body

      // Verify session exists and is open
      const session = await prisma.cashSession.findUnique({
        where: { id: parseInt(sessionId) },
        include: {
          cashMovements: true,
          sales: {
            include: {
              items: true
            }
          }
        }
      })

      if (!session || session.status !== 'OPEN') {
        return NextResponse.json(
          { error: 'Sesión de caja no encontrada o ya cerrada' },
          { status: 400 }
        )
      }

      // Calculate expected balance
      const totalSales = session.sales.reduce((total, sale) => total + parseFloat(sale.total.toString()), 0)
      const totalMovements = session.cashMovements.reduce((total, mov) => {
        return total + (mov.movementType === 'IN' ? parseFloat(mov.amount.toString()) : -parseFloat(mov.amount.toString()))
      }, 0)
      const expectedBalance = parseFloat(session.initialCash.toString()) + totalSales + totalMovements

      // Close the session
      const closedSession = await prisma.cashSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closedBy: parseInt(closedBy),
          actualCash: parseFloat(finalBalance),
          expectedCash: expectedBalance,
          difference: parseFloat(finalBalance) - expectedBalance
        },
        include: {
          cashRegister: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          openedByUser: {
            select: {
              id: true,
              name: true
            }
          },
          closedByUser: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      return NextResponse.json(closedSession)
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error managing cash session:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}