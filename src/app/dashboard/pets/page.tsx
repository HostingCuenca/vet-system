'use client'

import { useState, useEffect } from 'react'
import PetModal from '@/components/PetModal'
import MedicalRecordModal from '@/components/MedicalRecordModal'
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
  birthDate?: string
  gender: string
  color?: string
  microchip?: string
  currentWeight?: number
  notes?: string
  ownerId: number
  createdAt: string
  owner: Owner
}

const SPECIES_CONFIG = {
  DOG: { label: 'Perro', icon: '🐕', color: 'blue' },
  CAT: { label: 'Gato', icon: '🐱', color: 'orange' },
  BIRD: { label: 'Ave', icon: '🐦', color: 'green' },
  RABBIT: { label: 'Conejo', icon: '🐰', color: 'pink' },
  HAMSTER: { label: 'Hámster', icon: '🐹', color: 'yellow' },
  FISH: { label: 'Pez', icon: '🐠', color: 'cyan' },
  REPTILE: { label: 'Reptil', icon: '🦎', color: 'emerald' },
  OTHER: { label: 'Otro', icon: '🐾', color: 'gray' }
} as const

const GENDER_CONFIG = {
  MALE: { label: 'Macho', icon: '♂️' },
  FEMALE: { label: 'Hembra', icon: '♀️' },
  UNKNOWN: { label: 'Desconocido', icon: '❓' }
} as const

export default function PetsPage() {
  console.log('PetsPage rendering')
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [showMedicalModal, setShowMedicalModal] = useState(false)
  const [medicalRecordPet, setMedicalRecordPet] = useState<Pet | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentPet, setAppointmentPet] = useState<Pet | null>(null)

  console.log('Current state:', { 
    petsCount: pets.length, 
    searchTerm, 
    speciesFilter, 
    showModal, 
    selectedPet: !!selectedPet,
    modalMode 
  })

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/pets')
      if (response.ok) {
        const data = await response.json()
        setPets(data)
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePet = () => {
    console.log('Creating pet - opening modal')
    setSelectedPet(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditPet = (pet: Pet) => {
    console.log('Editing pet:', pet.name)
    setSelectedPet(pet)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleModalSuccess = () => {
    fetchPets()
  }

  const handleCreateMedicalRecord = (pet: Pet) => {
    console.log('Creating medical record for pet:', pet.name)
    setMedicalRecordPet(pet)
    setShowMedicalModal(true)
  }

  const handleMedicalModalSuccess = () => {
    setShowMedicalModal(false)
    setMedicalRecordPet(null)
    // Optionally refresh data or show success message
  }

  const handleCreateAppointment = (pet: Pet) => {
    console.log('Creating appointment for pet:', pet.name)
    setAppointmentPet(pet)
    setShowAppointmentModal(true)
  }

  const handleAppointmentModalSuccess = () => {
    setShowAppointmentModal(false)
    setAppointmentPet(null)
    // Optionally show success message
  }

  const handleDeletePet = async (id: number, name: string, internalId: string) => {
    if (!confirm(`¿Estás seguro de desactivar la mascota "${name}" (${internalId})?`)) {
      return
    }

    try {
      const response = await fetch(`/api/pets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPets()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al desactivar la mascota')
      }
    } catch (error) {
      console.error('Error deleting pet:', error)
      alert('Error de conexión')
    }
  }

  const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return 'Sin fecha'
    
    const birth = new Date(birthDate)
    const today = new Date()
    
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    
    if (months < 0) {
      years--
      months += 12
    }
    
    if (years > 0) return `${years} año${years > 1 ? 's' : ''}`
    if (months > 0) return `${months} mes${months > 1 ? 'es' : ''}`
    
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} día${days > 1 ? 's' : ''}`
  }

  const filteredPets = pets.filter(pet => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.internalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.owner.identificationNumber.includes(searchTerm) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSpecies = !speciesFilter || pet.species === speciesFilter

    return matchesSearch && matchesSpecies
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando mascotas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">🐾 Mascotas</h1>
        <button 
          onClick={handleCreatePet}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          + Nueva Mascota
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar mascota
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ID interno, nombre, propietario, raza..."
            />
          </div>

          {/* Species Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🐕 Filtrar por especie
            </label>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las especies</option>
              {Object.entries(SPECIES_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{pets.length}</div>
          <div className="text-sm text-gray-600">Total mascotas</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{filteredPets.length}</div>
          <div className="text-sm text-gray-600">Filtradas</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {pets.filter(pet => pet.species === 'DOG').length}
          </div>
          <div className="text-sm text-gray-600">🐕 Perros</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {pets.filter(pet => pet.species === 'CAT').length}
          </div>
          <div className="text-sm text-gray-600">🐱 Gatos</div>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Mascotas ({filteredPets.length})
          </h3>
        </div>
        
        {filteredPets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || speciesFilter ? 'No se encontraron mascotas' : 'No hay mascotas registradas'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredPets.map((pet) => {
              const speciesConfig = SPECIES_CONFIG[pet.species as keyof typeof SPECIES_CONFIG] || SPECIES_CONFIG.OTHER
              const genderConfig = GENDER_CONFIG[pet.gender as keyof typeof GENDER_CONFIG] || GENDER_CONFIG.UNKNOWN
              
              return (
                <div
                  key={pet.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{speciesConfig.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{pet.name}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {pet.internalId}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleCreateAppointment(pet)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors duration-200"
                        title="Nueva Cita"
                      >
                        📅
                      </button>
                      <button 
                        onClick={() => handleCreateMedicalRecord(pet)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200"
                        title="Nueva Ficha Clínica"
                      >
                        📋
                      </button>
                      <button 
                        onClick={() => handleEditPet(pet)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeletePet(pet.id, pet.name, pet.internalId)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                        title="Desactivar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2">📋</span>
                      <span>{speciesConfig.label}</span>
                      {pet.breed && <span className="text-gray-400"> • {pet.breed}</span>}
                    </div>
                    
                    <div className="flex items-center">
                      <span className="mr-2">{genderConfig.icon}</span>
                      <span>{genderConfig.label}</span>
                      {pet.currentWeight && (
                        <span className="text-gray-400"> • {pet.currentWeight} kg</span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <span className="mr-2">🎂</span>
                      <span>{calculateAge(pet.birthDate)}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      <span>{pet.owner.name}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="mr-2">📞</span>
                      <span>{pet.owner.phone || 'Sin teléfono'}</span>
                    </div>

                    {pet.microchip && (
                      <div className="flex items-center">
                        <span className="mr-2">🔍</span>
                        <span className="text-xs font-mono">{pet.microchip}</span>
                      </div>
                    )}
                  </div>

                  {pet.color && (
                    <div className="mt-3 flex items-center">
                      <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                        🎨 {pet.color}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <PetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        pet={selectedPet}
        mode={modalMode}
      />

      <MedicalRecordModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        onSuccess={handleMedicalModalSuccess}
        petId={medicalRecordPet?.id}
        petName={medicalRecordPet?.name}
        ownerName={medicalRecordPet?.owner.name}
        mode="create"
      />

      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSuccess={handleAppointmentModalSuccess}
        preSelectedPetId={appointmentPet?.id}
        mode="create"
      />
    </div>
  )
}