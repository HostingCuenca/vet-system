'use client'

import { useState, useEffect } from 'react'
import CashSessionModal from '@/components/CashSessionModal'
import CashRegisterModal from '@/components/CashRegisterModal'

interface CashRegister {
  id: number
  name: string
  location: string
  description?: string
  currentSession?: {
    id: number
    status: string
    openedAt: string
    openingBalance: number
    currentBalance: number
    openedBy: {
      id: number
      name: string
    }
  }[]
}

interface CashSession {
  id: number
  status: string
  openedAt: string
  closedAt?: string
  openingBalance: number
  currentBalance?: number
  finalBalance?: number
  difference?: number
  cashRegister: {
    id: number
    name: string
    location: string
  }
  openedBy: {
    id: number
    name: string
  }
  closedBy?: {
    id: number
    name: string
  }
  sales: Array<{
    id: number
    total: number
    createdAt: string
  }>
  movements: Array<{
    id: number
    type: string
    amount: number
    description: string
    createdAt: string
  }>
}

export default function CashManagement() {
  const [registers, setRegisters] = useState<CashRegister[]>([])
  const [sessions, setSessions] = useState<CashSession[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'open' | 'close'>('open')
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>()
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [registersRes, sessionsRes] = await Promise.all([
        fetch('/api/cash-registers'),
        fetch('/api/cash-sessions')
      ])

      if (registersRes.ok) {
        const registersData = await registersRes.json()
        setRegisters(registersData)
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        setSessions(sessionsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCash = () => {
    setModalMode('open')
    setSelectedSessionId(undefined)
    setModalOpen(true)
  }

  const handleCloseCash = (sessionId: number) => {
    setModalMode('close')
    setSelectedSessionId(sessionId)
    setModalOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-gray-600">Cargando gestión de cajas...</div>
        </div>
      </div>
    )
  }

  const openSessions = sessions.filter(s => s.status === 'OPEN')
  const closedSessions = sessions.filter(s => s.status === 'CLOSED').slice(0, 10)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Gestión de Cajas</h1>
          <p className="text-gray-600">Administra las cajas registradoras y sesiones de dinero</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nueva Caja
          </button>
          <button
            onClick={handleOpenCash}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Abrir Sesión
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      {openSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🟢 Cajas Abiertas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.cashRegister.name}</h3>
                    <p className="text-sm text-gray-600">{session.cashRegister.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Apertura:</span>
                    <span className="text-sm font-medium">{formatCurrency(session.openingBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Balance Actual:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(session.currentBalance || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ventas:</span>
                    <span className="text-sm font-medium">{session.sales.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Abierto por:</span>
                    <span className="text-sm font-medium">{session.openedBy.name}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Abierto: {formatDateTime(session.openedAt)}
                </div>

                <button
                  onClick={() => handleCloseCash(session.id)}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Cerrar Caja
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Registers */}
      {registers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🏪 Cajas Registradoras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {registers.map((register) => {
              const hasActiveSession = register.currentSession && register.currentSession.length > 0
              return (
                <div key={register.id} className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{register.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{register.location}</p>
                  {register.description && (
                    <p className="text-xs text-gray-500 mb-3">{register.description}</p>
                  )}
                  <div className={`text-xs px-2 py-1 rounded ${
                    hasActiveSession 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hasActiveSession ? 'Sesión Activa' : 'Disponible'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Closed Sessions */}
      {closedSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Sesiones Recientes</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Inicial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Final
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diferencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {closedSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {session.cashRegister.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.cashRegister.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatDateTime(session.openedAt)}</div>
                          {session.closedAt && (
                            <div className="text-xs text-gray-500">
                              hasta {formatDateTime(session.closedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(session.openingBalance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(session.finalBalance || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${
                          (session.difference || 0) === 0 
                            ? 'text-green-600' 
                            : (session.difference || 0) > 0 
                              ? 'text-blue-600' 
                              : 'text-red-600'
                        }`}>
                          {formatCurrency(session.difference || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.sales.length} ventas
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Data */}
      {registers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-medium">No hay cajas registradoras</h3>
            <p className="text-sm">Primero necesitas configurar las cajas registradoras</p>
          </div>
        </div>
      )}

      <CashSessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        mode={modalMode}
        sessionId={selectedSessionId}
      />

      <CashRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}