'use client'

import { useState, useEffect } from 'react'

interface Owner {
  name: string
  identificationNumber: string
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
}

interface MedicalRecord {
  id: number
  visitDate: string
  visitTime?: string
  reasonForVisit: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  weight?: number
  temperature?: number
  notes?: string
  followUpDate?: string
  createdAt: string
  pet: Pet
  veterinarian: Veterinarian
  anamnesis?: any
  vitalSigns?: any
  systemsReview?: any
  prescriptions: any[]
}

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

export default function MedicalRecordsPage() {
  console.log('MedicalRecordsPage rendering')
  
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  const fetchMedicalRecords = async () => {
    try {
      const response = await fetch('/api/medical-records')
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Error fetching medical records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
  }

  const handleDownloadPDF = async (recordId: number) => {
    try {
      const response = await fetch(`/api/medical-records/${recordId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `ficha-clinica-${recordId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error al descargar el PDF')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Sin hora'
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.pet.internalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.pet.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.pet.owner.identificationNumber.includes(searchTerm) ||
      record.reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSpecies = !speciesFilter || record.pet.species === speciesFilter

    return matchesSearch && matchesSpecies
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando fichas clínicas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📋 Fichas Clínicas</h1>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar en fichas clínicas
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mascota, propietario, diagnóstico, motivo..."
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
          <div className="text-2xl font-bold text-blue-600">{records.length}</div>
          <div className="text-sm text-gray-600">Total fichas</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{filteredRecords.length}</div>
          <div className="text-sm text-gray-600">Filtradas</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {records.filter(r => new Date(r.visitDate) >= new Date(Date.now() - 7*24*60*60*1000)).length}
          </div>
          <div className="text-sm text-gray-600">Esta semana</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {records.filter(r => r.followUpDate && new Date(r.followUpDate) > new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Seguimientos pendientes</div>
        </div>
      </div>

      {/* Medical Records List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Fichas Clínicas ({filteredRecords.length})
          </h3>
        </div>
        
        {filteredRecords.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || speciesFilter ? 'No se encontraron fichas clínicas' : 'No hay fichas clínicas registradas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mascota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha / Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veterinario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const speciesConfig = SPECIES_CONFIG[record.pet.species as keyof typeof SPECIES_CONFIG] || SPECIES_CONFIG.OTHER
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{speciesConfig.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.pet.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.pet.internalId} • {speciesConfig.label}
                              {record.pet.breed && ` • ${record.pet.breed}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.pet.owner.name}</div>
                        <div className="text-sm text-gray-500">{record.pet.owner.identificationNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(record.visitDate)}</div>
                        <div className="text-sm text-gray-500">{formatTime(record.visitTime)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.reasonForVisit}
                        </div>
                        {record.diagnosis && (
                          <div className="text-sm text-green-600 max-w-xs truncate">
                            📝 {record.diagnosis}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.veterinarian.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(record.id)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Descargar PDF"
                          >
                            📄
                          </button>
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

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                📋 Ficha Clínica Completa
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadPDF(selectedRecord.id)}
                  className="text-green-600 hover:text-green-800 px-3 py-1 border border-green-300 rounded"
                >
                  📄 Descargar PDF
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Medical Record Details */}
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">👤 Propietario</h4>
                  <p className="text-gray-700">{selectedRecord.pet.owner.name}</p>
                  <p className="text-sm text-gray-500">CC: {selectedRecord.pet.owner.identificationNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🐾 Mascota</h4>
                  <p className="text-gray-700">
                    {SPECIES_CONFIG[selectedRecord.pet.species as keyof typeof SPECIES_CONFIG]?.icon} {selectedRecord.pet.name} ({selectedRecord.pet.internalId})
                  </p>
                  <p className="text-sm text-gray-500">
                    {SPECIES_CONFIG[selectedRecord.pet.species as keyof typeof SPECIES_CONFIG]?.label}
                    {selectedRecord.pet.breed && ` • ${selectedRecord.pet.breed}`}
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📅 Información de la Consulta</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Fecha:</span> {formatDate(selectedRecord.visitDate)}</p>
                    <p><span className="font-medium">Hora:</span> {formatTime(selectedRecord.visitTime)}</p>
                    <p><span className="font-medium">Veterinario:</span> {selectedRecord.veterinarian.name}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">⚖️ Mediciones</h4>
                  <div className="space-y-1 text-sm">
                    {selectedRecord.weight && <p><span className="font-medium">Peso:</span> {selectedRecord.weight} kg</p>}
                    {selectedRecord.temperature && <p><span className="font-medium">Temperatura:</span> {selectedRecord.temperature}°C</p>}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🎯 Motivo de Consulta</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedRecord.reasonForVisit}</p>
                </div>

                {selectedRecord.symptoms && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🔍 Síntomas</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedRecord.symptoms}</p>
                  </div>
                )}

                {selectedRecord.diagnosis && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">📝 Diagnóstico</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-500">{selectedRecord.diagnosis}</p>
                  </div>
                )}

                {selectedRecord.treatment && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">💊 Tratamiento</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">{selectedRecord.treatment}</p>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">📋 Notas Adicionales</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>

              {/* Extended Data Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                {selectedRecord.anamnesis && (
                  <div className="bg-yellow-50 p-3 rounded">
                    <h5 className="font-medium text-yellow-800 mb-1">📝 Anamnesis</h5>
                    <p className="text-xs text-yellow-700">Datos completos disponibles en PDF</p>
                  </div>
                )}
                {selectedRecord.vitalSigns && (
                  <div className="bg-red-50 p-3 rounded">
                    <h5 className="font-medium text-red-800 mb-1">🩺 Signos Vitales</h5>
                    <p className="text-xs text-red-700">Datos completos disponibles en PDF</p>
                  </div>
                )}
                {selectedRecord.systemsReview && (
                  <div className="bg-purple-50 p-3 rounded">
                    <h5 className="font-medium text-purple-800 mb-1">🔍 Revisión por Sistemas</h5>
                    <p className="text-xs text-purple-700">Datos completos disponibles en PDF</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}