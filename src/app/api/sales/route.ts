import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Función helper para generar número de recibo
async function generateReceiptNumber(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const receiptCount = await prisma.receipt.count({
    where: {
      receiptNumber: {
        startsWith: `REC${today}`
      }
    }
  })
  return `REC${today}${String(receiptCount + 1).padStart(4, '0')}`
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        cashSession: {
          select: {
            id: true,
            cashRegister: {
              select: {
                name: true,
                location: true
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
        receipt: {
          select: {
            id: true,
            receiptNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(sales)

  } catch (error) {
    console.error('Error fetching sales:', error)
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
      cashSessionId,
      ownerId,
      items,
      paymentMethod,
      notes,
      soldBy
    } = body

    // Validaciones básicas
    if (!cashSessionId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Sesión de caja e items son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la sesión existe y está abierta
    const session = await prisma.cashSession.findUnique({
      where: { id: parseInt(cashSessionId) }
    })

    if (!session || session.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Sesión de caja no encontrada o cerrada' },
        { status: 400 }
      )
    }

    // Generate sale number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const saleCount = await prisma.sale.count({
      where: {
        saleNumber: {
          startsWith: `VTA${today}`
        }
      }
    })
    const saleNumber = `VTA${today}${String(saleCount + 1).padStart(3, '0')}`

    // Calcular total
    let subtotal = 0
    const processedItems = []

    for (const item of items) {
      if (item.type === 'PRODUCT') {
        // Verificar producto y stock
        const product = await prisma.product.findUnique({
          where: { id: parseInt(item.productId) }
        })

        if (!product) {
          return NextResponse.json(
            { error: `Producto no encontrado: ${item.productId}` },
            { status: 400 }
          )
        }

        if (product.currentStock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuficiente para ${product.name}. Disponible: ${product.currentStock}` },
            { status: 400 }
          )
        }

        const itemTotal = item.quantity * (item.unitPrice || product.unitPrice)
        processedItems.push({
          itemType: 'PRODUCT',
          productId: parseInt(item.productId),
          description: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice || product.unitPrice,
          total: itemTotal
        })

        subtotal += itemTotal

      } else if (item.type === 'SERVICE') {
        // Verificar servicio
        const service = await prisma.serviceCatalog.findUnique({
          where: { id: parseInt(item.serviceId) }
        })

        if (!service || !service.active) {
          return NextResponse.json(
            { error: `Servicio no encontrado: ${item.serviceId}` },
            { status: 400 }
          )
        }

        const itemTotal = item.quantity * (item.unitPrice || parseFloat(service.price.toString()))
        processedItems.push({
          itemType: 'SERVICE',
          serviceId: parseInt(item.serviceId),
          description: service.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice || parseFloat(service.price.toString()),
          total: itemTotal
        })

        subtotal += itemTotal
      }
    }

    const total = subtotal // Sin impuestos por ahora

    // Crear la venta con transacción
    const sale = await prisma.$transaction(async (tx) => {
      // Crear la venta
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          cashSessionId: parseInt(cashSessionId),
          ownerId: ownerId ? parseInt(ownerId) : null,
          soldBy: parseInt(soldBy) || 1,
          paymentMethod: paymentMethod || 'CASH',
          subtotal,
          total,
          notes: notes?.trim() || null
        }
      })

      // Crear los items
      for (const item of processedItems) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId || null,
            serviceId: item.serviceId || null,
            itemType: item.itemType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }
        })

        // Si es producto, actualizar stock
        if (item.itemType === 'PRODUCT' && item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                decrement: item.quantity
              }
            }
          })
        }
      }

      // Actualizar balance de la sesión según método de pago
      const updateData: any = {
        totalSales: {
          increment: total
        }
      }

      if (paymentMethod === 'CASH') {
        updateData.totalCash = { increment: total }
      } else if (paymentMethod === 'CARD') {
        updateData.totalCard = { increment: total }
      } else if (paymentMethod === 'TRANSFER') {
        updateData.totalTransfer = { increment: total }
      }

      await tx.cashSession.update({
        where: { id: parseInt(cashSessionId) },
        data: updateData
      })

      return newSale
    })

    // Crear el recibo automáticamente
    const receiptNumber = await generateReceiptNumber()
    
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        saleId: sale.id,
        petId: ownerId ? null : null, // TODO: Asociar mascota si está disponible
        ownerId: ownerId ? parseInt(ownerId) : null,
        veterinarianId: null, // TODO: Asociar veterinario si está disponible  
        issueDate: new Date(),
        totalAmount: total,
        paymentMethod: paymentMethod || 'CASH',
        paymentStatus: 'PAID',
        notes: notes?.trim() || null,
        createdBy: parseInt(soldBy) || 1
      }
    })

    // Obtener la venta completa con relaciones
    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        cashSession: {
          select: {
            id: true,
            cashRegister: {
              select: {
                name: true,
                location: true
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
        receipt: {
          select: {
            id: true,
            receiptNumber: true
          }
        }
      }
    })

    return NextResponse.json(completeSale, { status: 201 })

  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}