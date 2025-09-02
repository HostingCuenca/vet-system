'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalOwners: number
  totalPets: number
  todayAppointments: number
  lowStockProducts: number
  pendingReminders: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalOwners: 0,
    totalPets: 0,
    todayAppointments: 0,
    lowStockProducts: 0,
    pendingReminders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return null
  }

  const userRole = session.user.role
  const userName = session.user.name?.split(' ')[0] || 'Usuario'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const getRoleTitle = () => {
    switch (userRole) {
      case 'ADMIN': return 'Administrador'
      case 'VETERINARIAN': return 'Doctor'
      case 'RECEPTIONIST': return ''
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {getRoleTitle()} {userName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenido al panel de control de VetSystem
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Propietarios
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.totalOwners}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🐕</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Mascotas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.totalPets}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {(userRole === 'ADMIN' || userRole === 'VETERINARIAN' || userRole === 'RECEPTIONIST') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Citas Hoy
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.todayAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Stock Bajo
                  </dt>
                  <dd className="text-lg font-medium text-red-600">
                    {loading ? '...' : stats.lowStockProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recordatorios
                  </dt>
                  <dd className="text-lg font-medium text-yellow-600">
                    {loading ? '...' : stats.pendingReminders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/owners"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 hover:border-blue-200 hover:shadow-sm"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <h3 className="font-medium">Buscar Propietario</h3>
                <p className="text-sm text-gray-600">Por cédula o nombre</p>
              </div>
            </div>
          </a>

          {(userRole === 'ADMIN' || userRole === 'VETERINARIAN' || userRole === 'RECEPTIONIST') && (
            <a
              href="/dashboard/appointments"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 hover:border-blue-200 hover:shadow-sm"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📅</span>
                <div>
                  <h3 className="font-medium">Nueva Cita</h3>
                  <p className="text-sm text-gray-600">Agendar consulta</p>
                </div>
              </div>
            </a>
          )}

          <a
            href="/dashboard/pets"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 hover:border-blue-200 hover:shadow-sm"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">🐕</span>
              <div>
                <h3 className="font-medium">Registrar Mascota</h3>
                <p className="text-sm text-gray-600">Nueva mascota</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Role-specific content */}
      {userRole === 'ADMIN' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">👑 Panel de Administrador</h3>
          <p className="text-blue-700">
            Tienes acceso completo al sistema. Puedes gestionar usuarios, configuraciones y ver todos los reportes.
          </p>
        </div>
      )}

      {userRole === 'VETERINARIAN' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-2">🩺 Panel del Veterinario</h3>
          <p className="text-green-700">
            Puedes acceder a historiales médicos, crear recetas, programar citas y gestionar el inventario médico.
          </p>
        </div>
      )}

      {userRole === 'RECEPTIONIST' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-purple-900 mb-2">📝 Panel del Recepcionista</h3>
          <p className="text-purple-700">
            Puedes registrar propietarios y mascotas, gestionar citas y generar comprobantes.
          </p>
        </div>
      )}
    </div>
  )
}