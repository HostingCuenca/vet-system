'use client'

import { useState, useEffect } from 'react'
import ProductModal from '@/components/ProductModal'

interface Category {
  id: number
  name: string
  description?: string
}

interface Product {
  id: number
  name: string
  categoryId?: number
  description?: string
  unitType: string
  unitPrice?: number
  currentStock: number
  minimumStock: number
  maximumStock?: number
  requiresPrescription: boolean
  supplier?: string
  trackBatches: boolean
  active: boolean
  category?: Category
  batches?: any[]
}

const UNIT_TYPE_LABELS = {
  ML: 'ml',
  MG: 'mg', 
  TABLETS: 'tabletas',
  UNITS: 'unidades',
  KG: 'kg',
  GRAMS: 'g',
  CAPSULES: 'cápsulas'
} as const

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/product-categories')
      ])
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleModalSuccess = () => {
    fetchData()
  }

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar el producto')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error de conexión')
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) {
      return { status: 'sin-stock', color: 'bg-red-100 text-red-800', label: 'Sin Stock' }
    } else if (product.currentStock <= product.minimumStock) {
      return { status: 'stock-bajo', color: 'bg-yellow-100 text-yellow-800', label: 'Stock Bajo' }
    } else if (product.maximumStock && product.currentStock >= product.maximumStock) {
      return { status: 'stock-alto', color: 'bg-purple-100 text-purple-800', label: 'Stock Alto' }
    } else {
      return { status: 'stock-normal', color: 'bg-green-100 text-green-800', label: 'Stock Normal' }
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !categoryFilter || product.categoryId?.toString() === categoryFilter

    const stockStatus = getStockStatus(product)
    const matchesStock = !stockFilter || stockStatus.status === stockFilter

    return matchesSearch && matchesCategory && matchesStock
  })

  const getStockStats = () => {
    const total = products.length
    const sinStock = products.filter(p => p.currentStock <= 0).length
    const stockBajo = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minimumStock).length
    const stockNormal = products.filter(p => {
      const isAboveMinimum = p.currentStock > p.minimumStock
      const isBelowMaximum = !p.maximumStock || p.currentStock < p.maximumStock
      return isAboveMinimum && isBelowMaximum
    }).length
    
    return { total, sinStock, stockBajo, stockNormal }
  }

  const stats = getStockStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando inventario...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📦 Inventario</h1>
        <button 
          onClick={handleCreateProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Productos</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.sinStock}</div>
          <div className="text-sm text-gray-600">Sin Stock</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.stockBajo}</div>
          <div className="text-sm text-gray-600">Stock Bajo</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.stockNormal}</div>
          <div className="text-sm text-gray-600">Stock Normal</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar producto
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre, proveedor, descripción..."
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Filtrar por categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Filtrar por stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los niveles</option>
              <option value="sin-stock">Sin Stock</option>
              <option value="stock-bajo">Stock Bajo</option>
              <option value="stock-normal">Stock Normal</option>
              <option value="stock-alto">Stock Alto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Productos ({filteredProducts.length})
          </h3>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || categoryFilter || stockFilter ? 'No se encontraron productos' : 'No hay productos registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  const unitLabel = UNIT_TYPE_LABELS[product.unitType as keyof typeof UNIT_TYPE_LABELS] || product.unitType
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {product.name}
                            {product.requiresPrescription && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                🩺 Receta
                              </span>
                            )}
                            {product.trackBatches && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                📅 Lotes
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category?.name || 'Sin categoría'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {product.currentStock} {unitLabel}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mín: {product.minimumStock} {unitLabel}
                          {product.maximumStock && (
                            <span> | Máx: {product.maximumStock} {unitLabel}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.unitPrice ? 
                            `$${product.unitPrice.toLocaleString()}` : 
                            'No definido'
                          }
                        </div>
                        {product.unitPrice && (
                          <div className="text-xs text-gray-500">
                            por {unitLabel}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.supplier || 'No definido'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        product={selectedProduct}
        mode={modalMode}
      />
    </div>
  )
}