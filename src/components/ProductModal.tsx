'use client'

import { useState, useEffect } from 'react'

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
  category?: Category
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: Product | null
  mode: 'create' | 'edit'
}

const UNIT_TYPES = [
  { value: 'ML', label: 'Mililitros (ml)' },
  { value: 'MG', label: 'Miligramos (mg)' },
  { value: 'TABLETS', label: 'Tabletas' },
  { value: 'UNITS', label: 'Unidades' },
  { value: 'KG', label: 'Kilogramos (kg)' },
  { value: 'GRAMS', label: 'Gramos (g)' },
  { value: 'CAPSULES', label: 'Cápsulas' }
]

export default function ProductModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  product, 
  mode
}: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    unitType: 'UNITS',
    unitPrice: '',
    currentStock: '0',
    minimumStock: '5',
    maximumStock: '',
    requiresPrescription: false,
    supplier: '',
    trackBatches: false
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      
      if (mode === 'edit' && product) {
        setFormData({
          name: product.name,
          categoryId: product.categoryId?.toString() || '',
          description: product.description || '',
          unitType: product.unitType,
          unitPrice: product.unitPrice?.toString() || '',
          currentStock: product.currentStock.toString(),
          minimumStock: product.minimumStock.toString(),
          maximumStock: product.maximumStock?.toString() || '',
          requiresPrescription: product.requiresPrescription,
          supplier: product.supplier || '',
          trackBatches: product.trackBatches
        })
      } else if (mode === 'create') {
        resetForm()
      }
    }
  }, [isOpen, product, mode])

  const fetchCategories = async () => {
    setLoadingData(true)
    try {
      const response = await fetch('/api/product-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === 'edit' 
        ? `/api/products/${product?.id}` 
        : '/api/products'
      
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || null,
          unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
          currentStock: parseInt(formData.currentStock),
          minimumStock: parseInt(formData.minimumStock),
          maximumStock: formData.maximumStock ? parseInt(formData.maximumStock) : null,
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
        resetForm()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al guardar el producto')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      description: '',
      unitType: 'UNITS',
      unitPrice: '',
      currentStock: '0',
      minimumStock: '5',
      maximumStock: '',
      requiresPrescription: false,
      supplier: '',
      trackBatches: false
    })
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg p-6 shadow-xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            📦 {mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Cargando datos...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Amoxicilina 250mg, Vacuna Triple..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏷️ Categoría
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📏 Tipo de Unidad *
                </label>
                <select
                  value={formData.unitType}
                  onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {UNIT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💰 Precio por Unidad
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15000.00"
                />
              </div>

              {/* Current Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Stock Actual
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Minimum Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⚠️ Stock Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Maximum Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📈 Stock Máximo
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maximumStock}
                  onChange={(e) => setFormData({ ...formData, maximumStock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opcional"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏭 Proveedor
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Laboratorio ABC"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📄 Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada del producto..."
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="requiresPrescription" className="ml-2 text-sm text-gray-700">
                  🩺 Requiere Receta Médica
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="trackBatches"
                  checked={formData.trackBatches}
                  onChange={(e) => setFormData({ ...formData, trackBatches: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="trackBatches" className="ml-2 text-sm text-gray-700">
                  📅 Control de Lotes y Vencimientos (FIFO)
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Guardando...' : (mode === 'edit' ? 'Actualizar' : 'Crear')} Producto
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}