'use client'

import { useState, useEffect } from 'react'
import ReminderModal from '@/components/ReminderModal'

interface Pet {
  id: number
  name: string
  internalId: string
  species: string
}

interface Owner {
  id: number
  name: string
  identificationNumber: string
  phone?: string
  email?: string
}

interface Creator {
  id: number
  name: string
}

interface Reminder {
  id: number
  reminderType: string
  title: string
  message: string
  dueDate: string
  dueTime?: string
  priority: string
  status: string
  method: string
  sentDate?: string
  createdAt: string
  pet: Pet
  owner: Owner
  creator: Creator
  sender?: Creator
}

const REMINDER_STATUSES = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  SENT: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
} as const

const REMINDER_TYPES = {
  MEDICATION: { label: 'Medicación', icon: '💊', color: 'bg-red-50' },
  VACCINATION: { label: 'Vacunación', icon: '💉', color: 'bg-green-50' },
  CHECKUP: { label: 'Chequeo', icon: '🩺', color: 'bg-blue-50' },
  APPOINTMENT: { label: 'Cita', icon: '📅', color: 'bg-purple-50' },
  CUSTOM: { label: 'Personalizado', icon: '📝', color: 'bg-gray-50' }
} as const

const PRIORITY_LEVELS = {
  LOW: { label: 'Baja', color: 'text-gray-600' },
  MEDIUM: { label: 'Media', color: 'text-yellow-600' },
  HIGH: { label: 'Alta', color: 'text-red-600' }
} as const

const SPECIES_CONFIG = {
  DOG: { label: 'Perro', icon: '🐕' },
  CAT: { label: 'Gato', icon: '🐱' },
  BIRD: { label: 'Ave', icon: '🐦' },
  RABBIT: { label: 'Conejo', icon: '🐰' },
  HAMSTER: { label: 'Hámster', icon: '🐹' },
  FISH: { label: 'Pez', icon: '🐠' },
  REPTILE: { label: 'Reptil', icon: '🦎' },
  OTHER: { label: 'Otro', icon: '🐾' }
} as const

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReminder = () => {
    setSelectedReminder(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleModalSuccess = () => {
    fetchReminders()
  }

  const handleDeleteReminder = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar el recordatorio "${title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchReminders()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar el recordatorio')
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
      alert('Error de conexión')
    }
  }

  const handleMarkAsSent = async (id: number) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'mark-sent',
          sentBy: 1 // TODO: Get from session
        }),
      })

      if (response.ok) {
        fetchReminders()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al marcar como enviado')
      }
    } catch (error) {
      console.error('Error marking as sent:', error)
      alert('Error de conexión')
    }
  }

  const handleMarkAsCompleted = async (id: number) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark-completed' }),
      })

      if (response.ok) {
        fetchReminders()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al marcar como completado')
      }
    } catch (error) {
      console.error('Error marking as completed:', error)
      alert('Error de conexión')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      
      const dateUTC = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const tomorrowUTC = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
      
      if (dateUTC.getTime() === todayUTC.getTime()) {
        return 'Hoy'
      } else if (dateUTC.getTime() === tomorrowUTC.getTime()) {
        return 'Mañana'
      } else if (dateUTC < todayUTC) {
        return 'Vencido'
      } else {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        })
      }
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  const isOverdue = (dateString: string, status: string) => {
    if (status !== 'PENDING') return false
    try {
      const dueDate = new Date(dateString)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return dueDate < today
    } catch {
      return false
    }
  }

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = 
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.owner.identificationNumber.includes(searchTerm) ||
      reminder.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || reminder.status === statusFilter
    const matchesType = !typeFilter || reminder.reminderType === typeFilter
    const matchesPriority = !priorityFilter || reminder.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getStats = () => {
    const total = reminders.length
    const pending = reminders.filter(r => r.status === 'PENDING').length
    const overdue = reminders.filter(r => isOverdue(r.dueDate, r.status)).length
    const sent = reminders.filter(r => r.status === 'SENT').length
    const completed = reminders.filter(r => r.status === 'COMPLETED').length
    
    return { total, pending, overdue, sent, completed }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando recordatorios...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">🔔 Recordatorios</h1>
        <button 
          onClick={handleCreateReminder}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          + Nuevo Recordatorio
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Vencidos</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
          <div className="text-sm text-gray-600">Enviados</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completados</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar recordatorio
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título, mascota, propietario..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {Object.entries(REMINDER_STATUSES).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(REMINDER_TYPES).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚡ Prioridad
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las prioridades</option>
              {Object.entries(PRIORITY_LEVELS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Recordatorios ({filteredReminders.length})
          </h3>
        </div>
        
        {filteredReminders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || statusFilter || typeFilter || priorityFilter ? 'No se encontraron recordatorios' : 'No hay recordatorios registrados'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReminders.map((reminder) => {
              const statusConfig = REMINDER_STATUSES[reminder.status as keyof typeof REMINDER_STATUSES]
              const typeConfig = REMINDER_TYPES[reminder.reminderType as keyof typeof REMINDER_TYPES]
              const priorityConfig = PRIORITY_LEVELS[reminder.priority as keyof typeof PRIORITY_LEVELS]
              const speciesConfig = SPECIES_CONFIG[reminder.pet.species as keyof typeof SPECIES_CONFIG] || SPECIES_CONFIG.OTHER
              const overdueStatus = isOverdue(reminder.dueDate, reminder.status)
              
              return (
                <div key={reminder.id} className={`p-6 ${typeConfig.color} ${overdueStatus ? 'border-l-4 border-red-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{typeConfig.icon}</span>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            {reminder.title}
                            {overdueStatus && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                ⚠️ Vencido
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              {speciesConfig.icon} {reminder.pet.name} ({reminder.pet.internalId})
                            </span>
                            <span>👤 {reminder.owner.name}</span>
                            <span className={priorityConfig.color}>
                              ⚡ {priorityConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-3">
                        {reminder.message}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 {formatDate(reminder.dueDate)}</span>
                          {reminder.dueTime && (
                            <span>⏰ {reminder.dueTime}</span>
                          )}
                          <span>📞 {reminder.method}</span>
                          {reminder.sentDate && (
                            <span>✅ Enviado {new Date(reminder.sentDate).toLocaleDateString('es-ES')}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {reminder.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleMarkAsSent(reminder.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors text-sm"
                            title="Marcar como enviado"
                          >
                            📤 Enviado
                          </button>
                          <button
                            onClick={() => handleMarkAsCompleted(reminder.id)}
                            className="text-green-600 hover:text-green-900 transition-colors text-sm"
                            title="Marcar como completado"
                          >
                            ✅ Completado
                          </button>
                        </>
                      )}
                      {reminder.status === 'SENT' && (
                        <button
                          onClick={() => handleMarkAsCompleted(reminder.id)}
                          className="text-green-600 hover:text-green-900 transition-colors text-sm"
                          title="Marcar como completado"
                        >
                          ✅ Completado
                        </button>
                      )}
                      <button
                        onClick={() => handleEditReminder(reminder)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id, reminder.title)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <ReminderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        reminder={selectedReminder}
        mode={modalMode}
      />
    </div>
  )
}