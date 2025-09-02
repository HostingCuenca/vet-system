'use client'

import { useState, useEffect } from 'react'
import OwnerSelector from './OwnerSelector'

interface Pet {
  id?: number
  name: string
  species: string
  breed?: string
  birthDate?: string
  gender?: string
  color?: string
  microchip?: string
  currentWeight?: number
  notes?: string
  ownerId: number
}

interface PetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  pet?: Pet | null
  mode: 'create' | 'edit'
}

const SPECIES_OPTIONS = [
  { value: 'DOG', label: 'Perro', icon: '🐕' },
  { value: 'CAT', label: 'Gato', icon: '🐱' },
  { value: 'BIRD', label: 'Ave', icon: '🐦' },
  { value: 'RABBIT', label: 'Conejo', icon: '🐰' },
  { value: 'HAMSTER', label: 'Hámster', icon: '🐹' },
  { value: 'FISH', label: 'Pez', icon: '🐠' },
  { value: 'REPTILE', label: 'Reptil', icon: '🦎' },
  { value: 'OTHER', label: 'Otro', icon: '🐾' }
]

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Macho', icon: '♂️' },
  { value: 'FEMALE', label: 'Hembra', icon: '♀️' },
  { value: 'UNKNOWN', label: 'Desconocido', icon: '❓' }
]

export default function PetModal({ isOpen, onClose, onSuccess, pet, mode }: PetModalProps) {
  console.log('PetModal render:', { isOpen, mode, pet: !!pet })
  
  const [formData, setFormData] = useState<Pet>({
    name: pet?.name || '',
    species: pet?.species || '',
    breed: pet?.breed || '',
    birthDate: pet?.birthDate || '',
    gender: pet?.gender || 'UNKNOWN',
    color: pet?.color || '',
    microchip: pet?.microchip || '',
    currentWeight: pet?.currentWeight || undefined,
    notes: pet?.notes || '',
    ownerId: pet?.ownerId || 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    console.log('isOpen changed:', isOpen)
  }, [isOpen])

  useEffect(() => {
    if (pet) {
      console.log('Pet changed, updating form:', pet)
      setFormData({
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        birthDate: pet.birthDate || '',
        gender: pet.gender || 'UNKNOWN',
        color: pet.color || '',
        microchip: pet.microchip || '',
        currentWeight: pet.currentWeight || undefined,
        notes: pet.notes || '',
        ownerId: pet.ownerId || 0,
      })
    } else {
      console.log('Pet is null, resetting form')
      setFormData({
        name: '',
        species: '',
        breed: '',
        birthDate: '',
        gender: 'UNKNOWN',
        color: '',
        microchip: '',
        currentWeight: undefined,
        notes: '',
        ownerId: 0,
      })
    }
  }, [pet])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ownerId' ? parseInt(value) || 0 : value
    }))

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Campos requeridos
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido'
    if (!formData.species) newErrors.species = 'Especie es requerida'
    if (!formData.ownerId) newErrors.ownerId = 'Propietario es requerido'

    // Validaciones específicas
    if (formData.currentWeight && (formData.currentWeight <= 0 || formData.currentWeight > 999.99)) {
      newErrors.currentWeight = 'Peso debe estar entre 0.01 y 999.99 kg'
    }

    if (formData.birthDate && new Date(formData.birthDate) > new Date()) {
      newErrors.birthDate = 'Fecha de nacimiento no puede ser futura'
    }

    if (formData.microchip && formData.microchip.length > 50) {
      newErrors.microchip = 'Microchip no puede exceder 50 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = mode === 'create' 
        ? '/api/pets' 
        : `/api/pets/${pet?.id}`
      
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
        setError(data.error || 'Error al guardar la mascota')
        return
      }

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        species: '',
        breed: '',
        birthDate: '',
        gender: 'UNKNOWN',
        color: '',
        microchip: '',
        currentWeight: undefined,
        notes: '',
        ownerId: 0,
      })
      setErrors({})

    } catch (error) {
      console.error('Error saving pet:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError('')
      setErrors({})
    }
  }

  if (!isOpen) {
    console.log('Modal not open, returning null')
    return null
  }

  console.log('Rendering PetModal')

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-6">
            {mode === 'create' ? '🐾 Nueva Mascota' : '✏️ Editar Mascota'}
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Propietario */}
            <OwnerSelector
              selectedOwnerId={formData.ownerId || null}
              onSelect={(ownerId) => {
                setFormData(prev => ({ ...prev, ownerId }))
                if (errors.ownerId) {
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.ownerId
                    return newErrors
                  })
                }
              }}
              error={errors.ownerId}
              disabled={loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Max, Luna, Charlie..."
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Especie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especie *
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                    errors.species ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar especie...</option>
                  {SPECIES_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                {errors.species && <p className="mt-1 text-sm text-red-600">{errors.species}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Raza */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Golden Retriever, Siamés..."
                />
              </div>

              {/* Género */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha de nacimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                    errors.birthDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
              </div>

              {/* Peso actual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso actual (kg)
                </label>
                <input
                  type="number"
                  name="currentWeight"
                  value={formData.currentWeight || ''}
                  onChange={handleChange}
                  disabled={loading}
                  step="0.01"
                  min="0.01"
                  max="999.99"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                    errors.currentWeight ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="5.50"
                />
                {errors.currentWeight && <p className="mt-1 text-sm text-red-600">{errors.currentWeight}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Dorado, Negro, Blanco..."
                />
              </div>

              {/* Microchip */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Microchip
                </label>
                <input
                  type="text"
                  name="microchip"
                  value={formData.microchip}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                    errors.microchip ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123456789012345"
                />
                {errors.microchip && <p className="mt-1 text-sm text-red-600">{errors.microchip}</p>}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="Información adicional sobre la mascota..."
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Mascota' : 'Actualizar Mascota')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}