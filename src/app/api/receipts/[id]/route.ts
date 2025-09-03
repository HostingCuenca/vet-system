import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const receiptId = parseInt(params.id)

    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        sale: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    unitType: true
                  }
                },
                service: {
                  select: {
                    name: true,
                    category: true
                  }
                }
              }
            },
            cashSession: {
              include: {
                cashRegister: {
                  select: {
                    name: true,
                    location: true
                  }
                }
              }
            }
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
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            internalId: true,
            breed: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true
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

    if (!receipt) {
      return NextResponse.json(
        { error: 'Recibo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(receipt)

  } catch (error) {
    console.error('Error fetching receipt:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}