'use client'

import { useState, useEffect } from 'react'

interface Owner {
  id: number
  name: string
  identificationNumber: string
  phone?: string
}

interface OwnerSelectorProps {
  selectedOwnerId: number | null
  onSelect: (ownerId: number) => void
  error?: string
  disabled?: boolean
}

export default function OwnerSelector({ selectedOwnerId, onSelect, error, disabled }: OwnerSelectorProps) {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/owners')
      if (response.ok) {
        const data = await response.json()
        setOwners(data)
      }
    } catch (error) {
      console.error('Error fetching owners:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.identificationNumber.includes(searchTerm) ||
    (owner.phone && owner.phone.includes(searchTerm))
  )

  const selectedOwner = owners.find(owner => owner.id === selectedOwnerId)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Propietario *
      </label>
      
      {loading ? (
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Cargando propietarios...
        </div>
      ) : (
        <div className="relative">
          {/* Selected owner display / dropdown trigger */}
          <div
            className={`w-full px-3 py-2 border rounded-md cursor-pointer transition-colors ${
              disabled 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-white hover:bg-gray-50'
            } ${error ? 'border-red-300' : 'border-gray-300'} ${
              isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            {selectedOwner ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{selectedOwner.name}</span>
                  <span className="text-gray-500 ml-2">CC: {selectedOwner.identificationNumber}</span>
                </div>
                <span className="text-gray-400">▼</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Seleccionar propietario...</span>
                <span className="text-gray-400">▼</span>
              </div>
            )}
          </div>

          {/* Dropdown */}
          {isOpen && !disabled && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {/* Search input */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Buscar por nombre, cédula o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Options list */}
              <div className="py-1">
                {filteredOwners.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    {searchTerm ? 'No se encontraron propietarios' : 'No hay propietarios disponibles'}
                  </div>
                ) : (
                  filteredOwners.map((owner) => (
                    <div
                      key={owner.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                        selectedOwnerId === owner.id ? 'bg-blue-100 font-medium' : ''
                      }`}
                      onClick={() => {
                        onSelect(owner.id)
                        setIsOpen(false)
                        setSearchTerm('')
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{owner.name}</div>
                          <div className="text-sm text-gray-500">
                            CC: {owner.identificationNumber}
                            {owner.phone && ` • ${owner.phone}`}
                          </div>
                        </div>
                        {selectedOwnerId === owner.id && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}