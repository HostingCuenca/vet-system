'use client'

import { useState, useEffect } from 'react'
import AppointmentModal from '@/components/AppointmentModal'

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
}

interface CreatedBy {
  id: number
  name: string
}

interface Appointment {
  id: number
  appointmentDate: string
  appointmentTime: string
  duration: number
  reason: string
  status: string
  notes?: string
  createdAt: string
  pet: Pet
  veterinarian: Veterinarian
  createdBy: CreatedBy
}

const APPOINTMENT_STATUSES = {
  SCHEDULED: { label: 'Programada', color: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  IN_PROGRESS: { label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: 'Completada', color: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: 'No Asistió', color: 'bg-gray-100 text-gray-800' }
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAppointment = () => {
    setSelectedAppointment(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleModalSuccess = () => {
    fetchAppointments()
  }

  const handleCancelAppointment = async (id: number, petName: string) => {
    if (!confirm(`¿Estás seguro de cancelar la cita de ${petName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAppointments()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al cancelar la cita')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Error de conexión')
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchAppointments()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al actualizar el estado')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error de conexión')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Fecha inválida'
      }
      
      // Use UTC to avoid timezone issues
      const dateUTC = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      const todayUTC = new Date()
      todayUTC.setUTCHours(0, 0, 0, 0)
      const tomorrowUTC = new Date(todayUTC)
      tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1)
      
      if (dateUTC.getTime() === todayUTC.getTime()) {
        return 'Hoy'
      } else if (dateUTC.getTime() === tomorrowUTC.getTime()) {
        return 'Mañana'
      } else {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        })
      }
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  const formatTime = (timeString: string) => {
    try {
      if (!timeString) return 'Sin hora'
      
      // Handle different time formats
      let time: Date
      if (timeString.includes('T')) {
        // ISO format like "1970-01-01T10:10:00.000Z"
        time = new Date(timeString)
      } else {
        // Simple time format like "10:10"
        time = new Date(`1970-01-01T${timeString}:00.000Z`)
      }
      
      if (isNaN(time.getTime())) return 'Hora inválida'
      
      return time.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC' // Use UTC to avoid timezone issues
      })
    } catch (error) {
      return 'Hora inválida'
    }
  }

  const getUpcomingAppointments = () => {
    if (!appointments.length) return []
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return appointments.filter(apt => {
        try {
          const aptDate = new Date(apt.appointmentDate)
          return aptDate >= today && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(apt.status)
        } catch {
          return false
        }
      })
    } catch {
      return []
    }
  }

  const getTodayAppointments = () => {
    if (!appointments.length) return []
    try {
      const today = new Date().toISOString().split('T')[0]
      return appointments.filter(apt => {
        try {
          return apt.appointmentDate.split('T')[0] === today && 
            !['CANCELLED'].includes(apt.status)
        } catch {
          return false
        }
      })
    } catch {
      return []
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet.internalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet.owner.identificationNumber.includes(searchTerm) ||
      appointment.veterinarian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || appointment.status === statusFilter

    const matchesDate = !dateFilter || appointment.appointmentDate.split('T')[0] === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando citas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📅 Citas Médicas</h1>
        <button 
          onClick={handleCreateAppointment}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          + Nueva Cita
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar cita
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mascota, propietario, veterinario..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Filtrar por estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {Object.entries(APPOINTMENT_STATUSES).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Filtrar por fecha
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
          <div className="text-sm text-gray-600">Total citas</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{getTodayAppointments().length}</div>
          <div className="text-sm text-gray-600">Citas hoy</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{getUpcomingAppointments().length}</div>
          <div className="text-sm text-gray-600">Próximas citas</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{filteredAppointments.length}</div>
          <div className="text-sm text-gray-600">Filtradas</div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Citas ({filteredAppointments.length})
          </h3>
        </div>
        
        {filteredAppointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || statusFilter || dateFilter ? 'No se encontraron citas' : 'No hay citas registradas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha / Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mascota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veterinario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
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
                {filteredAppointments.map((appointment) => {
                  const speciesConfig = SPECIES_CONFIG[appointment.pet.species as keyof typeof SPECIES_CONFIG] || SPECIES_CONFIG.OTHER
                  const statusConfig = APPOINTMENT_STATUSES[appointment.status as keyof typeof APPOINTMENT_STATUSES]
                  
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(appointment.appointmentTime)} ({appointment.duration}min)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{speciesConfig.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.pet.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.pet.internalId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.pet.owner.name}</div>
                        <div className="text-sm text-gray-500">{appointment.pet.owner.identificationNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Dr. {appointment.veterinarian.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {appointment.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          {appointment.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'CONFIRMED')}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Confirmar"
                            >
                              ✅
                            </button>
                          )}
                          {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id, appointment.pet.name)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Cancelar"
                            >
                              ❌
                            </button>
                          )}
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
      <AppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        appointment={selectedAppointment}
        mode={modalMode}
      />
    </div>
  )
}