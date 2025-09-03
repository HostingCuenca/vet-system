import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import puppeteer from 'puppeteer'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const receiptId = parseInt(params.id)

    // Obtener el recibo completo
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

    // Generar HTML para el recibo
    const html = generateReceiptHTML(receipt)

    // Generar PDF
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    })
    
    await browser.close()

    // Retornar el PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-${receipt.receiptNumber}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating receipt PDF:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function generateReceiptHTML(receipt: any): string {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const paymentMethodNames = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    CREDIT: 'Crédito'
  }

  const speciesNames = {
    DOG: 'Perro',
    CAT: 'Gato',
    BIRD: 'Ave',
    RABBIT: 'Conejo',
    HAMSTER: 'Hamster',
    FISH: 'Pez',
    REPTILE: 'Reptil',
    OTHER: 'Otro'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo ${receipt.receiptNumber}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.4;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .clinic-name {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin: 0;
        }
        
        .clinic-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin: 5px 0;
        }
        
        .receipt-number {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          background: #f3f4f6;
          padding: 8px 16px;
          border-radius: 6px;
          display: inline-block;
        }
        
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .info-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
        }
        
        .info-title {
          font-weight: bold;
          color: #10b981;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        
        .info-row {
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
        }
        
        .info-label {
          font-weight: 500;
          color: #6b7280;
          min-width: 120px;
        }
        
        .info-value {
          color: #111827;
          font-weight: 500;
        }
        
        .items-section {
          margin: 30px 0;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .items-table th {
          background: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tr:hover {
          background: #f9fafb;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .item-type-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }
        
        .item-type-service {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .item-type-product {
          background: #d1fae5;
          color: #065f46;
        }
        
        .totals-section {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }
        
        .totals-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          min-width: 300px;
          border: 1px solid #e5e7eb;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }
        
        .totals-label {
          color: #6b7280;
        }
        
        .totals-value {
          font-weight: 500;
        }
        
        .total-final {
          border-top: 2px solid #2563eb;
          padding-top: 8px;
          margin-top: 12px;
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        .payment-status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
        }
        
        .status-paid {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        @media print {
          body { margin: 0; }
          .info-section { break-inside: avoid; }
          .items-section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="clinic-name">🏥 VetSystem</h1>
        <p class="clinic-subtitle">Sistema Veterinario Integral</p>
        <div class="receipt-number">Recibo N° ${receipt.receiptNumber}</div>
      </div>

      <div class="info-section">
        <div class="info-box">
          <div class="info-title">📋 Información del Recibo</div>
          <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${formatDate(receipt.issueDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Venta N°:</span>
            <span class="info-value">${receipt.sale.saleNumber}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Caja:</span>
            <span class="info-value">${receipt.sale.cashSession.cashRegister.name} - ${receipt.sale.cashSession.cashRegister.location}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Atendido por:</span>
            <span class="info-value">${receipt.creator.name}</span>
          </div>
          ${receipt.veterinarian ? `
          <div class="info-row">
            <span class="info-label">Veterinario:</span>
            <span class="info-value">${receipt.veterinarian.name}</span>
          </div>
          ` : ''}
        </div>

        <div class="info-box">
          <div class="info-title">👤 Información del Cliente</div>
          ${receipt.owner ? `
          <div class="info-row">
            <span class="info-label">Propietario:</span>
            <span class="info-value">${receipt.owner.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Cédula:</span>
            <span class="info-value">${receipt.owner.identificationNumber}</span>
          </div>
          ${receipt.owner.phone ? `
          <div class="info-row">
            <span class="info-label">Teléfono:</span>
            <span class="info-value">${receipt.owner.phone}</span>
          </div>
          ` : ''}
          ${receipt.owner.email ? `
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${receipt.owner.email}</span>
          </div>
          ` : ''}
          ` : `
          <div class="info-row">
            <span class="info-value">Venta sin propietario registrado</span>
          </div>
          `}
          
          ${receipt.pet ? `
          <div class="info-row" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <span class="info-label">Mascota:</span>
            <span class="info-value">${receipt.pet.name} (${receipt.pet.internalId})</span>
          </div>
          <div class="info-row">
            <span class="info-label">Especie:</span>
            <span class="info-value">${speciesNames[receipt.pet.species as keyof typeof speciesNames] || receipt.pet.species}</span>
          </div>
          ${receipt.pet.breed ? `
          <div class="info-row">
            <span class="info-label">Raza:</span>
            <span class="info-value">${receipt.pet.breed}</span>
          </div>
          ` : ''}
          ` : ''}
        </div>
      </div>

      <div class="items-section">
        <h2 class="section-title">📦 Detalle de Items</h2>
        <table class="items-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descripción</th>
              <th class="text-center">Cantidad</th>
              <th class="text-right">Precio Unit.</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.sale.items.map((item: any) => `
              <tr>
                <td>
                  <span class="item-type-badge ${item.itemType === 'SERVICE' ? 'item-type-service' : 'item-type-product'}">
                    ${item.itemType === 'SERVICE' ? 'Servicio' : 'Producto'}
                  </span>
                </td>
                <td>
                  <strong>${item.description}</strong>
                  ${item.service ? `<br><small style="color: #6b7280;">${item.service.category || 'Sin categoría'}</small>` : ''}
                  ${item.product ? `<br><small style="color: #6b7280;">${item.product.unitType}</small>` : ''}
                </td>
                <td class="text-center">${parseFloat(item.quantity).toLocaleString()}</td>
                <td class="text-right">${formatCurrency(parseFloat(item.unitPrice))}</td>
                <td class="text-right"><strong>${formatCurrency(parseFloat(item.total))}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="totals-section">
        <div class="totals-box">
          <div class="totals-row">
            <span class="totals-label">Subtotal:</span>
            <span class="totals-value">${formatCurrency(parseFloat(receipt.sale.subtotal))}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">Descuento:</span>
            <span class="totals-value">${formatCurrency(parseFloat(receipt.sale.discount))}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">IVA:</span>
            <span class="totals-value">${formatCurrency(parseFloat(receipt.sale.tax))}</span>
          </div>
          <div class="totals-row total-final">
            <span class="totals-label">TOTAL:</span>
            <span class="totals-value">${formatCurrency(parseFloat(receipt.totalAmount))}</span>
          </div>
          <div class="totals-row" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <span class="totals-label">Método de Pago:</span>
            <span class="totals-value">${paymentMethodNames[receipt.paymentMethod as keyof typeof paymentMethodNames]}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">Estado:</span>
            <span class="payment-status ${receipt.paymentStatus === 'PAID' ? 'status-paid' : 'status-pending'}">
              ${receipt.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>

      ${receipt.notes ? `
      <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <strong style="color: #92400e;">📝 Notas:</strong>
        <p style="margin: 8px 0; color: #92400e;">${receipt.notes}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>¡Gracias por confiar en nosotros para el cuidado de su mascota!</p>
        <p>Este documento es válido como comprobante de pago</p>
        <p style="margin-top: 10px; font-size: 12px;">
          Generado el ${formatDate(new Date().toISOString())}
        </p>
      </div>
    </body>
    </html>
  `
}