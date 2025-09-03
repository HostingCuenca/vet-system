import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        sale: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                },
                service: {
                  select: {
                    name: true,
                    category: true
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
            identificationNumber: true
          }
        },
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            internalId: true
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(receipts)

  } catch (error) {
    console.error('Error fetching receipts:', error)
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
      saleId,
      petId,
      ownerId,
      veterinarianId,
      createdBy
    } = body

    // Validaciones básicas
    if (!saleId || !createdBy) {
      return NextResponse.json(
        { error: 'ID de venta y usuario creador son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la venta existe
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(saleId) },
      include: {
        items: {
          include: {
            product: true,
            service: true
          }
        },
        cashSession: {
          include: {
            cashRegister: true
          }
        }
      }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un recibo para esta venta
    const existingReceipt = await prisma.receipt.findUnique({
      where: { saleId: parseInt(saleId) }
    })

    if (existingReceipt) {
      return NextResponse.json(
        { error: 'Ya existe un recibo para esta venta' },
        { status: 400 }
      )
    }

    // Generate receipt number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const receiptCount = await prisma.receipt.count({
      where: {
        receiptNumber: {
          startsWith: `REC${today}`
        }
      }
    })
    const receiptNumber = `REC${today}${String(receiptCount + 1).padStart(4, '0')}`

    // Crear el recibo
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        saleId: parseInt(saleId),
        petId: petId ? parseInt(petId) : null,
        ownerId: ownerId ? parseInt(ownerId) : null,
        veterinarianId: veterinarianId ? parseInt(veterinarianId) : null,
        issueDate: new Date(),
        totalAmount: sale.total,
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
        notes: sale.notes,
        createdBy: parseInt(createdBy)
      },
      include: {
        sale: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true
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
            identificationNumber: true
          }
        },
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            internalId: true
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

    return NextResponse.json(receipt, { status: 201 })

  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}