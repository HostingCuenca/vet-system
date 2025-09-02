'use client'

import { useState, useEffect } from 'react'
import OwnerModal from '@/components/OwnerModal'
import SimpleModal from '@/components/SimpleModal'

interface Owner {
  id: number
  name: string
  identificationNumber: string
  phone?: string
  email?: string
  address?: string
  pets: Array<{
    id: number
    name: string
    species: string
    internalId: string
  }>
}

export default function OwnersPage() {
  console.log('OwnersPage rendering')
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showSimpleModal, setShowSimpleModal] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  console.log('Current state:', { showModal, showSimpleModal, selectedOwner, modalMode })

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

  const handleCreateOwner = () => {
    console.log('Creating owner - opening modal')
    setSelectedOwner(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleModalSuccess = () => {
    fetchOwners()
  }

  const handleDeleteOwner = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar al propietario "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/owners/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchOwners()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar el propietario')
      }
    } catch (error) {
      console.error('Error deleting owner:', error)
      alert('Error de conexión')
    }
  }

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.identificationNumber.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando propietarios...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">👥 Propietarios</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSimpleModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            🧪 Test Modal
          </button>
          <button 
            onClick={handleCreateOwner}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            + Nuevo Propietario
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔍 Buscar por cédula o nombre
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="12345678 o Juan Pérez"
          />
        </div>
      </div>

      {/* Owners List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Propietarios ({filteredOwners.length})
          </h3>
        </div>
        
        {filteredOwners.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No se encontraron propietarios' : 'No hay propietarios registrados'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredOwners.map((owner) => (
              <li key={owner.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-lg font-medium text-gray-900">{owner.name}</h4>
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        CC: {owner.identificationNumber}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      {owner.phone && (
                        <div className="flex items-center">
                          <span className="mr-2">📞</span>
                          {owner.phone}
                        </div>
                      )}
                      {owner.email && (
                        <div className="flex items-center">
                          <span className="mr-2">📧</span>
                          {owner.email}
                        </div>
                      )}
                      {owner.address && (
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          {owner.address}
                        </div>
                      )}
                    </div>
                    {owner.pets.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Mascotas ({owner.pets.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {owner.pets.map((pet) => (
                            <span
                              key={pet.id}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                            >
                              {pet.species === 'DOG' && '🐕'}
                              {pet.species === 'CAT' && '🐱'}
                              {pet.species === 'BIRD' && '🐦'}
                              {pet.species === 'RABBIT' && '🐰'}
                              {pet.species === 'OTHER' && '🐾'}
                              {pet.name} ({pet.internalId})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-6 flex-shrink-0 flex gap-2">
                    <button 
                      onClick={() => handleEditOwner(owner)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteOwner(owner.id, owner.name)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      <SimpleModal 
        isOpen={showSimpleModal}
        onClose={() => setShowSimpleModal(false)}
      />
      
      <OwnerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        owner={selectedOwner}
        mode={modalMode}
      />
    </div>
  )
}