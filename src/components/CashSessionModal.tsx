'use client'

import { useState, useEffect } from 'react'

interface CashRegister {
  id: number
  name: string
  location: string
  description?: string
  currentSession?: {
    id: number
    status: string
    openedBy: {
      id: number
      name: string
    }
  }[]
}

interface CashSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mode: 'open' | 'close'
  sessionId?: number
}

export default function CashSessionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  mode,
  sessionId 
}: CashSessionModalProps) {
  const [loading, setLoading] = useState(false)
  const [registers, setRegisters] = useState<CashRegister[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    cashRegisterId: '',
    openingBalance: '0.00',
    finalBalance: '0.00',
    openedBy: 1, // TODO: Get from session
    closedBy: 1  // TODO: Get from session
  })

  useEffect(() => {
    if (isOpen) {
      fetchRegisters()
      if (mode === 'close') {
        // For close mode, we might want to fetch current session info
        // This will be handled when we have session management
      }
    }
  }, [isOpen, mode])

  const fetchRegisters = async () => {
    setLoadingData(true)
    try {
      const response = await fetch('/api/cash-registers')
      if (response.ok) {
        const data = await response.json()
        setRegisters(data)
      }
    } catch (error) {
      console.error('Error fetching registers:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = mode === 'open' ? {
        action: 'open',
        cashRegisterId: formData.cashRegisterId,
        openingBalance: formData.openingBalance,
        openedBy: formData.openedBy
      } : {
        action: 'close',
        sessionId: sessionId,
        finalBalance: formData.finalBalance,
        closedBy: formData.closedBy
      }

      const response = await fetch('/api/cash-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        onSuccess()
        onClose()
        resetForm()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al gestionar la sesión de caja')
      }
    } catch (error) {
      console.error('Error managing cash session:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      cashRegisterId: '',
      openingBalance: '0.00',
      finalBalance: '0.00',
      openedBy: 1,
      closedBy: 1
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
        className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            💰 {mode === 'open' ? 'Abrir Caja' : 'Cerrar Caja'}
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
            {mode === 'open' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏪 Caja Registradora *
                  </label>
                  <select
                    value={formData.cashRegisterId}
                    onChange={(e) => setFormData({ ...formData, cashRegisterId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar caja</option>
                    {registers
                      .filter(register => !register.currentSession || register.currentSession.length === 0)
                      .map((register) => (
                        <option key={register.id} value={register.id}>
                          {register.name} - {register.location}
                        </option>
                      ))}
                  </select>
                  {registers.every(register => register.currentSession && register.currentSession.length > 0) && (
                    <p className="text-sm text-yellow-600 mt-1">
                      ⚠️ Todas las cajas tienen sesiones activas
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💵 Dinero Inicial *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                    required
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Cantidad de dinero con la que se inicia la caja
                  </p>
                </div>
              </>
            )}

            {mode === 'close' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💵 Dinero Final *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.finalBalance}
                  onChange={(e) => setFormData({ ...formData, finalBalance: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Cantidad de dinero real al cerrar la caja
                </p>
              </div>
            )}

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
                {loading ? 'Procesando...' : (mode === 'open' ? 'Abrir Caja' : 'Cerrar Caja')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}