'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: number
  name: string
  unitPrice: number
  currentStock: number
  category: {
    name: string
  }
  batches: Array<{
    quantity: number
    expirationDate: string
    status: string
  }>
}

interface Service {
  id: number
  name: string
  description?: string
  category?: string
  price: number
}

interface Owner {
  id: number
  name: string
  identificationNumber: string
  phone?: string
}

interface CashSession {
  id: number
  status: string
  totalSales: number
  cashRegister: {
    name: string
    location: string
  }
  openedByUser: {
    name: string
  }
}

interface SaleItem {
  id: string
  type: 'PRODUCT' | 'SERVICE'
  productId?: number
  serviceId?: number
  name: string
  code?: string
  unitPrice: number
  quantity: number
  subtotal: number
  maxQuantity?: number
}

export default function SalesInterface() {
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [sessions, setSessions] = useState<CashSession[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedSession, setSelectedSession] = useState<number | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, servicesRes, ownersRes, sessionsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/services'),
        fetch('/api/owners'),
        fetch('/api/cash-sessions')
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.filter((p: Product) => 
          p.currentStock > 0
        ))
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }

      if (ownersRes.ok) {
        const ownersData = await ownersRes.json()
        setOwners(ownersData)
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        const openSessions = sessionsData.filter((s: CashSession) => s.status === 'OPEN')
        setSessions(openSessions)
        if (openSessions.length === 1) {
          setSelectedSession(openSessions[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: Product | Service, type: 'PRODUCT' | 'SERVICE') => {
    const existingIndex = saleItems.findIndex(saleItem => 
      saleItem.type === type && 
      (type === 'PRODUCT' ? saleItem.productId === item.id : saleItem.serviceId === item.id)
    )

    if (existingIndex >= 0) {
      const updatedItems = [...saleItems]
      const currentItem = updatedItems[existingIndex]
      
      if (type === 'PRODUCT') {
        const product = item as Product
        if (currentItem.quantity < product.currentStock) {
          currentItem.quantity += 1
          currentItem.subtotal = currentItem.quantity * currentItem.unitPrice
          setSaleItems(updatedItems)
        } else {
          alert(`Stock máximo disponible: ${product.currentStock}`)
        }
      } else {
        currentItem.quantity += 1
        currentItem.subtotal = currentItem.quantity * currentItem.unitPrice
        setSaleItems(updatedItems)
      }
    } else {
      if (type === 'PRODUCT') {
        const product = item as Product
        setSaleItems([...saleItems, {
          id: `${type}-${item.id}-${Date.now()}`,
          type,
          productId: item.id,
          name: item.name,
          unitPrice: product.unitPrice,
          quantity: 1,
          subtotal: product.unitPrice,
          maxQuantity: product.currentStock
        }])
      } else {
        const service = item as Service
        setSaleItems([...saleItems, {
          id: `${type}-${item.id}-${Date.now()}`,
          type,
          serviceId: item.id,
          name: item.name,
          code: service.code,
          unitPrice: service.basePrice,
          quantity: 1,
          subtotal: service.basePrice
        }])
      }
    }
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSaleItems(saleItems.filter(item => item.id !== itemId))
      return
    }

    const updatedItems = saleItems.map(item => {
      if (item.id === itemId) {
        const validQuantity = item.maxQuantity ? Math.min(newQuantity, item.maxQuantity) : newQuantity
        return {
          ...item,
          quantity: validQuantity,
          subtotal: validQuantity * item.unitPrice
        }
      }
      return item
    })
    
    setSaleItems(updatedItems)
  }

  const removeItem = (itemId: string) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId))
  }

  const getTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const processSale = async () => {
    if (!selectedSession) {
      alert('Debe seleccionar una sesión de caja')
      return
    }

    if (saleItems.length === 0) {
      alert('Debe agregar al menos un item a la venta')
      return
    }

    setProcessing(true)
    try {
      const saleData = {
        cashSessionId: selectedSession,
        ownerId: selectedCustomer,
        paymentMethod,
        notes,
        soldBy: 1, // TODO: Get from session
        items: saleItems.map(item => ({
          type: item.type,
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      })

      if (response.ok) {
        const sale = await response.json()
        alert(`Venta procesada exitosamente. ID: ${sale.id}`)
        
        // Reset form
        setSaleItems([])
        setSelectedCustomer(null)
        setNotes('')
        
        // Refresh data to update stock
        fetchData()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al procesar la venta')
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error de conexión')
    } finally {
      setProcessing(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-gray-600">Cargando punto de venta...</div>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No hay sesiones de caja abiertas</h3>
          <p className="text-gray-600 mb-4">Para realizar ventas, primero debe abrir una sesión de caja</p>
          <a 
            href="/dashboard/cash"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a Gestión de Cajas
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Left Panel - Products/Services */}
      <div className="flex-1 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">🛒 Punto de Venta</h1>
          
          {/* Session Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sesión de Caja</label>
            <select
              value={selectedSession || ''}
              onChange={(e) => setSelectedSession(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar sesión</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.cashRegister.name} - {session.cashRegister.location} ({formatCurrency(parseFloat(session.totalSales.toString()))})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Buscar productos o servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          {/* Tabs */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'products'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Productos ({filteredProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'services'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🩺 Servicios ({filteredServices.length})
            </button>
          </div>
        </div>

        {/* Products/Services Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'products' && filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product, 'PRODUCT')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
              >
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(product.unitPrice)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Stock: {product.currentStock}
                  </span>
                </div>
              </div>
            ))}

            {activeTab === 'services' && filteredServices.map(service => (
              <div
                key={service.id}
                onClick={() => addToCart(service, 'SERVICE')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
              >
                <h3 className="font-medium text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{service.category}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(service.basePrice)}
                  </span>
                  {service.duration && (
                    <span className="text-xs text-gray-500">
                      {service.duration} min
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{service.code}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🛒 Carrito de Venta</h2>
          
          {/* Customer Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente (Opcional)</label>
            <select
              value={selectedCustomer || ''}
              onChange={(e) => setSelectedCustomer(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Cliente anónimo</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} - {owner.identificationNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {saleItems.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🛒</div>
                <p>Carrito vacío</p>
                <p className="text-sm">Haz clic en productos o servicios para agregar</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {saleItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      {item.code && (
                        <p className="text-xs text-gray-500">{item.code}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-xs flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.unitPrice)} c/u
                      </div>
                      <div className="font-bold text-green-600">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {saleItems.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="space-y-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">💵 Efectivo</option>
                  <option value="CARD">💳 Tarjeta</option>
                  <option value="TRANSFER">🏦 Transferencia</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(getTotal())}
                  </span>
                </div>

                <button
                  onClick={processSale}
                  disabled={processing || !selectedSession}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {processing ? 'Procesando...' : '💰 Procesar Venta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}