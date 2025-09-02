'use client'

import { useState, useEffect } from 'react'

interface Owner {
  id: number
  name: string
  identificationNumber: string
  phone?: string
}

interface Pet {
  id: number
  name: string
  internalId: string
  species: string
  breed?: string
  owner: Owner
}

interface Veterinarian {
  id: number
  name: string
  email: string
  phone?: string
}

interface Appointment {
  id: number
  appointmentDate: string
  appointmentTime: string
  duration: number
  reason: string
  status: string
  notes?: string
  pet: Pet
  veterinarian: Veterinarian
}

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  appointment?: Appointment | null
  mode: 'create' | 'edit'
  preSelectedPetId?: number
}

const APPOINTMENT_STATUSES = {
  SCHEDULED: { label: 'Programada', color: 'blue' },
  CONFIRMED: { label: 'Confirmada', color: 'green' },
  IN_PROGRESS: { label: 'En Progreso', color: 'yellow' },
  COMPLETED: { label: 'Completada', color: 'emerald' },
  CANCELLED: { label: 'Cancelada', color: 'red' },
  NO_SHOW: { label: 'No Asistió', color: 'gray' }
} as const

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' }
]

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  appointment, 
  mode,
  preSelectedPetId 
}: AppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    petId: preSelectedPetId || '',
    veterinarianId: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    reason: '',
    status: 'SCHEDULED',
    notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
      
      if (mode === 'edit' && appointment) {
        setFormData({
          petId: appointment.pet.id,
          veterinarianId: appointment.veterinarian.id,
          appointmentDate: appointment.appointmentDate.split('T')[0],
          appointmentTime: appointment.appointmentTime,
          duration: appointment.duration,
          reason: appointment.reason,
          status: appointment.status,
          notes: appointment.notes || ''
        })
      } else if (mode === 'create') {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0]
        setFormData(prev => ({
          ...prev,
          appointmentDate: today,
          petId: preSelectedPetId || ''
        }))
      }
    }
  }, [isOpen, appointment, mode, preSelectedPetId])

  const fetchInitialData = async () => {
    setLoadingData(true)
    try {
      const [petsResponse, veterinariansResponse] = await Promise.all([
        fetch('/api/pets'),
        fetch('/api/veterinarians')
      ])

      if (petsResponse.ok) {
        const petsData = await petsResponse.json()
        setPets(petsData)
      }

      if (veterinariansResponse.ok) {
        const vetsData = await veterinariansResponse.json()
        setVeterinarians(vetsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === 'edit' 
        ? `/api/appointments/${appointment?.id}` 
        : '/api/appointments'
      
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          petId: parseInt(formData.petId as string),
          veterinarianId: parseInt(formData.veterinarianId as string),
          duration: parseInt(formData.duration as string),
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
        resetForm()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al guardar la cita')
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      petId: preSelectedPetId || '',
      veterinarianId: '',
      appointmentDate: '',
      appointmentTime: '',
      duration: 30,
      reason: '',
      status: 'SCHEDULED',
      notes: ''
    })
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const getMinDateTime = () => {
    const now = new Date()
    return now.toISOString().slice(0, 16)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            📅 {mode === 'edit' ? 'Editar Cita' : 'Nueva Cita'}
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
              {/* Pet Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🐾 Mascota *
                </label>
                <select
                  value={formData.petId}
                  onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar mascota</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.internalId} - {pet.name} ({pet.owner.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Veterinarian Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👨‍⚕️ Veterinario *
                </label>
                <select
                  value={formData.veterinarianId}
                  onChange={(e) => setFormData({ ...formData, veterinarianId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar veterinario</option>
                  {veterinarians.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      Dr. {vet.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Fecha *
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Hora *
                </label>
                <input
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⌛ Duración
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status (only for edit mode) */}
              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📊 Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(APPOINTMENT_STATUSES).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Motivo de la Cita *
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                placeholder="Consulta general, vacunación, control, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Información adicional sobre la cita..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                {loading ? 'Guardando...' : (mode === 'edit' ? 'Actualizar' : 'Crear')} Cita
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}