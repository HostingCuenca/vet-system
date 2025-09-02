'use client'

import { useState, useEffect } from 'react'

interface Owner {
  id?: number
  name: string
  identificationNumber: string
  phone?: string
  email?: string
  address?: string
}

interface OwnerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  owner?: Owner | null
  mode: 'create' | 'edit'
}

export default function OwnerModal({ isOpen, onClose, onSuccess, owner, mode }: OwnerModalProps) {
  console.log('OwnerModal render:', { isOpen, mode, owner: !!owner })
  const [formData, setFormData] = useState<Owner>({
    name: owner?.name || '',
    identificationNumber: owner?.identificationNumber || '',
    phone: owner?.phone || '',
    email: owner?.email || '',
    address: owner?.address || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('isOpen changed:', isOpen)
  }, [isOpen])

  useEffect(() => {
    if (owner) {
      console.log('Owner changed, updating form:', owner)
      setFormData({
        name: owner.name || '',
        identificationNumber: owner.identificationNumber || '',
        phone: owner.phone || '',
        email: owner.email || '',
        address: owner.address || '',
      })
    } else {
      console.log('Owner is null, resetting form')
      setFormData({
        name: '',
        identificationNumber: '',
        phone: '',
        email: '',
        address: '',
      })
    }
  }, [owner])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = mode === 'create' 
        ? '/api/owners' 
        : `/api/owners/${owner?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al guardar el propietario')
        return
      }

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        identificationNumber: '',
        phone: '',
        email: '',
        address: '',
      })

    } catch (error) {
      console.error('Error saving owner:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError('')
      setFormData({
        name: owner?.name || '',
        identificationNumber: owner?.identificationNumber || '',
        phone: owner?.phone || '',
        email: owner?.email || '',
        address: owner?.address || '',
      })
    }
  }

  if (!isOpen) {
    console.log('Modal not open, returning null')
    return null
  }

  console.log('Rendering OwnerModal')

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={handleClose}
    >
      {/* Modal panel */}
      <div 
        className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
          <div>
            <div className="mt-3 text-center sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {mode === 'create' ? '👤 Nuevo Propietario' : '✏️ Editar Propietario'}
              </h3>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula *
                  </label>
                  <input
                    type="text"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="juan@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Calle 123 #45-67, Barrio Centro"
                  />
                </div>

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  )
}