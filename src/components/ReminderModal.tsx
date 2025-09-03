'use client'

import { useState, useEffect } from 'react'

interface Pet {
  id: number
  name: string
  internalId: string
  species: string
  owner: {
    id: number
    name: string
    identificationNumber: string
    phone?: string
  }
}

interface Reminder {
  id: number
  reminderType: string
  title: string
  message: string
  dueDate: string
  dueTime?: string
  priority: string
  method: string
  status: string
  pet: Pet
}

interface ReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  reminder?: Reminder | null
  mode: 'create' | 'edit'
  preSelectedPetId?: number
}

const REMINDER_TYPES = [
  { value: 'MEDICATION', label: 'Medicación', icon: '💊' },
  { value: 'VACCINATION', label: 'Vacunación', icon: '💉' },
  { value: 'CHECKUP', label: 'Chequeo', icon: '🩺' },
  { value: 'APPOINTMENT', label: 'Cita', icon: '📅' },
  { value: 'CUSTOM', label: 'Personalizado', icon: '📝' }
]

const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Baja', color: 'text-gray-600' },
  { value: 'MEDIUM', label: 'Media', color: 'text-yellow-600' },
  { value: 'HIGH', label: 'Alta', color: 'text-red-600' }
]

const CONTACT_METHODS = [
  { value: 'WHATSAPP', label: 'WhatsApp', icon: '📱' },
  { value: 'EMAIL', label: 'Email', icon: '📧' },
  { value: 'PHONE', label: 'Teléfono', icon: '☎️' },
  { value: 'INTERNAL', label: 'Interno', icon: '🔔' }
]

export default function ReminderModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  reminder, 
  mode,
  preSelectedPetId 
}: ReminderModalProps) {
  const [loading, setLoading] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    petId: preSelectedPetId || '',
    reminderType: 'CUSTOM',
    title: '',
    message: '',
    dueDate: '',
    dueTime: '',
    priority: 'MEDIUM',
    method: 'WHATSAPP'
  })

  useEffect(() => {
    if (isOpen) {
      fetchPets()
      
      if (mode === 'edit' && reminder) {
        setFormData({
          petId: reminder.pet.id,
          reminderType: reminder.reminderType,
          title: reminder.title,
          message: reminder.message,
          dueDate: reminder.dueDate.split('T')[0],
          dueTime: reminder.dueTime || '',
          priority: reminder.priority,
          method: reminder.method
        })
      } else if (mode === 'create') {
        // Set default date to tomorrow
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        setFormData(prev => ({
          ...prev,
          dueDate: tomorrow.toISOString().split('T')[0],
          petId: preSelectedPetId || ''
        }))
      }
    }
  }, [isOpen, reminder, mode, preSelectedPetId])

  const fetchPets = async () => {
    setLoadingData(true)
    try {
      const response = await fetch('/api/pets')
      if (response.ok) {
        const data = await response.json()
        setPets(data)
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === 'edit' 
        ? `/api/reminders/${reminder?.id}` 
        : '/api/reminders'
      
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          petId: parseInt(formData.petId as string),
          createdById: 1 // TODO: Get from session
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
        resetForm()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al guardar el recordatorio')
      }
    } catch (error) {
      console.error('Error saving reminder:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    setFormData({
      petId: preSelectedPetId || '',
      reminderType: 'CUSTOM',
      title: '',
      message: '',
      dueDate: tomorrow.toISOString().split('T')[0],
      dueTime: '',
      priority: 'MEDIUM',
      method: 'WHATSAPP'
    })
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const handleReminderTypeChange = (type: string) => {
    setFormData({ ...formData, reminderType: type })
    
    // Auto-fill title based on type
    const typeConfig = REMINDER_TYPES.find(t => t.value === type)
    if (typeConfig && !formData.title) {
      const selectedPet = pets.find(p => p.id === parseInt(formData.petId as string))
      if (selectedPet) {
        setFormData(prev => ({
          ...prev,
          title: `${typeConfig.label} - ${selectedPet.name}`,
          message: prev.message || `Recordatorio de ${typeConfig.label.toLowerCase()} para ${selectedPet.name}`
        }))
      }
    }
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
            🔔 {mode === 'edit' ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
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
              <div className="md:col-span-2">
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

              {/* Reminder Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Tipo de Recordatorio *
                </label>
                <select
                  value={formData.reminderType}
                  onChange={(e) => handleReminderTypeChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {REMINDER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⚡ Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Fecha Límite *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Due Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Hora (Opcional)
                </label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contact Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📞 Método de Contacto
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CONTACT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.icon} {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Vacuna anual, Control post-operatorio..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 Mensaje *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                placeholder="Detalle completo del recordatorio para el propietario..."
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
                {loading ? 'Guardando...' : (mode === 'edit' ? 'Actualizar' : 'Crear')} Recordatorio
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}