'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Sale {
  id: number
  saleNumber: string
  saleDate: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  total: number
  notes?: string
  cashSession: {
    id: number
    cashRegister: {
      name: string
      location: string
    }
  }
  owner?: {
    id: number
    name: string
    identificationNumber: string
  }
  items: Array<{
    id: number
    itemType: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    product?: {
      name: string
    }
    service?: {
      name: string
      category?: string
    }
  }>
  receipt?: {
    id: number
    receiptNumber: string
  }
}

export default function TransactionsHistory() {
  const { data: session } = useSession()
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [expandedSale, setExpandedSale] = useState<number | null>(null)

  // Verificar permisos
  useEffect(() => {
    if (session && !['ADMIN', 'RECEPTIONIST'].includes(session.user.role)) {
      router.push('/dashboard')
      return
    }
  }, [session, router])

  useEffect(() => {
    if (session && ['ADMIN', 'RECEPTIONIST'].includes(session.user.role)) {
      fetchSales()
    }
  }, [session])

  if (session && !['ADMIN', 'RECEPTIONIST'].includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600">No tienes permisos para ver el historial de transacciones.</p>
        </div>
      </div>
    )
  }

  const fetchSales = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sales')
      if (response.ok) {
        const data = await response.json()
        setSales(data)
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = async (receiptId: number, receiptNumber: string) => {
    try {
      const response = await fetch(`/api/receipts/${receiptId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `comprobante-${receiptNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Error al generar el PDF del comprobante')
      }
    } catch (error) {
      console.error('Error downloading receipt:', error)
      alert('Error al descargar el comprobante')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return '💵'
      case 'CARD': return '💳'
      case 'TRANSFER': return '🏦'
      case 'CREDIT': return '📄'
      default: return '💰'
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'Efectivo'
      case 'CARD': return 'Tarjeta'
      case 'TRANSFER': return 'Transferencia'
      case 'CREDIT': return 'Crédito'
      default: return method
    }
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.owner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.owner?.identificationNumber.includes(searchTerm) ||
      sale.receipt?.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPayment = !paymentFilter || sale.paymentMethod === paymentFilter

    const matchesDate = !dateFilter || 
      new Date(sale.saleDate).toISOString().slice(0, 10) === dateFilter

    return matchesSearch && matchesPayment && matchesDate
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-gray-600">Cargando historial de transacciones...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Historial de Transacciones</h1>
          <p className="text-gray-600">Consulta y gestiona las ventas realizadas</p>
        </div>
        <button
          onClick={fetchSales}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Número de venta, cliente, cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los métodos</option>
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="CREDIT">Crédito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales.map(sale => (
          <div key={sale.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Venta #{sale.saleNumber}
                    </h3>
                    {sale.receipt && (
                      <span className="text-sm text-gray-600">
                        Comprobante: {sale.receipt.receiptNumber}
                      </span>
                    )}
                    <span className="flex items-center text-sm text-gray-600">
                      {getPaymentMethodIcon(sale.paymentMethod)}
                      <span className="ml-1">{getPaymentMethodLabel(sale.paymentMethod)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cliente:</span>{' '}
                      {sale.owner ? `${sale.owner.name} (${sale.owner.identificationNumber})` : 'Sin cliente'}
                    </div>
                    <div>
                      <span className="font-medium">Caja:</span>{' '}
                      {sale.cashSession.cashRegister.name}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>{' '}
                      {formatDateTime(sale.saleDate)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatCurrency(sale.total)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {sale.receipt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadReceipt(sale.receipt!.id, sale.receipt!.receiptNumber)
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        📄 PDF
                      </button>
                    )}
                    <span className="text-sm text-gray-500">
                      {expandedSale === sale.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedSale === sale.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Detalles de la venta:</h4>
                <div className="space-y-2">
                  {sale.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div>
                        <span className="font-medium">{item.description}</span>
                        {item.itemType === 'SERVICE' && item.service?.category && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {item.service.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {sale.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notas:</span> {sale.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-300">
                  <span className="font-medium text-gray-900">Subtotal:</span>
                  <span className="text-lg font-bold">{formatCurrency(sale.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(sale.total)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium">No hay transacciones</h3>
            <p className="text-sm">
              {searchTerm || paymentFilter || dateFilter 
                ? 'No se encontraron transacciones con los filtros aplicados' 
                : 'Aún no se han realizado ventas'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}