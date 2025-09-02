'use client'

import { useState, useEffect } from 'react'

interface MedicalRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  petId?: number
  petName?: string
  ownerName?: string
  mode: 'create' | 'edit'
  recordId?: number
}

interface FormData {
  petId: number
  veterinarianId: number
  visitDate: string
  visitTime: string
  reasonForVisit: string
  symptoms: string
  diagnosis: string
  treatment: string
  weight: string
  temperature: string
  notes: string
  followUpDate: string
  // Anamnesis básica
  anamnesis: {
    lastDewormingDate: string
    dewormingFrequency: string
    dewormingProducts: string
    feedType: string
    feedBrand: string
    reproductiveStatus: string
    behaviorChanges: string
    activityLevel: string
  }
  // Signos vitales básicos
  vitalSigns: {
    heartRate: string
    respiratoryRate: string
    bodyConditionScore: string
    hydrationStatus: string
    mentalStatus: string
    heartSounds: string
    mucousMembranes: string
    alertness: string
  }
  // Revisión por sistemas básica
  systemsReview: {
    skinCondition: string
    skinFindings: string
    respiratorySystem: string
    lungSounds: string
    digestiveSystem: string
    oralExamination: string
    nervousSystem: string
    eyeExamination: string
  }
}

const INITIAL_FORM_DATA: FormData = {
  petId: 0,
  veterinarianId: 0,
  visitDate: new Date().toISOString().split('T')[0],
  visitTime: '',
  reasonForVisit: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  weight: '',
  temperature: '',
  notes: '',
  followUpDate: '',
  anamnesis: {
    lastDewormingDate: '',
    dewormingFrequency: '',
    dewormingProducts: '',
    feedType: '',
    feedBrand: '',
    reproductiveStatus: '',
    behaviorChanges: '',
    activityLevel: '',
  },
  vitalSigns: {
    heartRate: '',
    respiratoryRate: '',
    bodyConditionScore: '',
    hydrationStatus: '',
    mentalStatus: '',
    heartSounds: '',
    mucousMembranes: '',
    alertness: '',
  },
  systemsReview: {
    skinCondition: '',
    skinFindings: '',
    respiratorySystem: '',
    lungSounds: '',
    digestiveSystem: '',
    oralExamination: '',
    nervousSystem: '',
    eyeExamination: '',
  }
}

export default function MedicalRecordModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  petId, 
  petName,
  ownerName,
  mode,
  recordId
}: MedicalRecordModalProps) {
  console.log('MedicalRecordModal render:', { isOpen, mode, petId, petName })
  
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [veterinarians, setVeterinarians] = useState<any[]>([])

  const steps = [
    { title: 'Información Básica', icon: '📋' },
    { title: 'Anamnesis', icon: '📝' },
    { title: 'Signos Vitales', icon: '🩺' },
    { title: 'Revisión por Sistemas', icon: '🔍' },
  ]

  useEffect(() => {
    if (isOpen) {
      fetchVeterinarians()
      if (petId) {
        setFormData(prev => ({ ...prev, petId }))
      }
      if (mode === 'edit' && recordId) {
        fetchMedicalRecord()
      }
    }
  }, [isOpen, petId, mode, recordId])

  const fetchVeterinarians = async () => {
    try {
      // Aquí podrías crear un endpoint específico para veterinarios
      // Por ahora simulamos algunos datos
      setVeterinarians([
        { id: 1, name: 'Dr. María González' },
        { id: 2, name: 'Dr. Carlos Rodríguez' },
      ])
    } catch (error) {
      console.error('Error fetching veterinarians:', error)
    }
  }

  const fetchMedicalRecord = async () => {
    if (!recordId) return
    
    try {
      const response = await fetch(`/api/medical-records/${recordId}`)
      if (response.ok) {
        const record = await response.json()
        // Aquí cargarías los datos del registro para editar
        console.log('Medical record loaded:', record)
      }
    } catch (error) {
      console.error('Error fetching medical record:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [section, field] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev.anamnesis],
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.reasonForVisit.trim() || !formData.veterinarianId) {
      setError('Motivo de consulta y veterinario son requeridos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = mode === 'create' 
        ? '/api/medical-records' 
        : `/api/medical-records/${recordId}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al guardar el registro médico')
        return
      }

      onSuccess()
      onClose()
      resetForm()

    } catch (error) {
      console.error('Error saving medical record:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA)
    setCurrentStep(0)
    setError('')
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      resetForm()
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) {
    console.log('Modal not open, returning null')
    return null
  }

  console.log('Rendering MedicalRecordModal')

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg p-6 shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-medium text-gray-900">
              {mode === 'create' ? '📋 Nueva Ficha Clínica' : '✏️ Editar Ficha Clínica'}
            </h3>
            {petName && (
              <p className="text-sm text-gray-600 mt-1">
                {petName} - {ownerName}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Step Progress */}
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index <= currentStep 
                  ? 'text-blue-600' 
                  : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-2 ${
                index <= currentStep 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {step.icon} {step.title}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Step 0: Información Básica */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Veterinario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Veterinario *
                    </label>
                    <select
                      name="veterinarianId"
                      value={formData.veterinarianId}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar veterinario...</option>
                      {veterinarians.map((vet) => (
                        <option key={vet.id} value={vet.id}>
                          {vet.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de consulta *
                    </label>
                    <input
                      type="date"
                      name="visitDate"
                      value={formData.visitDate}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      name="visitTime"
                      value={formData.visitTime}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      step="0.1"
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="5.5"
                    />
                  </div>
                </div>

                {/* Motivo de consulta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo de consulta *
                  </label>
                  <textarea
                    name="reasonForVisit"
                    value={formData.reasonForVisit}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Consulta de rutina, vacunación, síntomas específicos..."
                  />
                </div>

                {/* Síntomas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Síntomas
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Descripción detallada de los síntomas observados..."
                  />
                </div>
              </div>
            )}

            {/* Step 1: Anamnesis */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">📝 Anamnesis</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Última desparasitación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Última desparasitación
                    </label>
                    <input
                      type="date"
                      name="anamnesis.lastDewormingDate"
                      value={formData.anamnesis.lastDewormingDate}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Frecuencia desparasitación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frecuencia desparasitación
                    </label>
                    <select
                      name="anamnesis.dewormingFrequency"
                      value={formData.anamnesis.dewormingFrequency}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Mensual">Mensual</option>
                      <option value="Cada 3 meses">Cada 3 meses</option>
                      <option value="Cada 6 meses">Cada 6 meses</option>
                      <option value="Anual">Anual</option>
                      <option value="Nunca">Nunca</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de alimentación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de alimentación
                    </label>
                    <select
                      name="anamnesis.feedType"
                      value={formData.anamnesis.feedType}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Concentrado">Concentrado</option>
                      <option value="Casera">Casera</option>
                      <option value="Mixta">Mixta</option>
                    </select>
                  </div>

                  {/* Estado reproductivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado reproductivo
                    </label>
                    <select
                      name="anamnesis.reproductiveStatus"
                      value={formData.anamnesis.reproductiveStatus}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Entero">Entero</option>
                      <option value="Castrado">Castrado</option>
                      <option value="Esterilizado">Esterilizado</option>
                    </select>
                  </div>
                </div>

                {/* Cambios de comportamiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cambios de comportamiento
                  </label>
                  <textarea
                    name="anamnesis.behaviorChanges"
                    value={formData.anamnesis.behaviorChanges}
                    onChange={handleChange}
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Describa cualquier cambio en el comportamiento del animal..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Signos Vitales */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">🩺 Signos Vitales</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Frecuencia cardíaca */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FC (ppm)
                    </label>
                    <input
                      type="number"
                      name="vitalSigns.heartRate"
                      value={formData.vitalSigns.heartRate}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="80"
                    />
                  </div>

                  {/* Frecuencia respiratoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FR (rpm)
                    </label>
                    <input
                      type="number"
                      name="vitalSigns.respiratoryRate"
                      value={formData.vitalSigns.respiratoryRate}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="20"
                    />
                  </div>

                  {/* Temperatura */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperatura (°C)
                    </label>
                    <input
                      type="number"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                      step="0.1"
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="38.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Estado de hidratación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado de hidratación
                    </label>
                    <select
                      name="vitalSigns.hydrationStatus"
                      value={formData.vitalSigns.hydrationStatus}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Normal">Normal</option>
                      <option value="Leve">Deshidratación leve</option>
                      <option value="Moderada">Deshidratación moderada</option>
                      <option value="Severa">Deshidratación severa</option>
                    </select>
                  </div>

                  {/* Estado mental */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado mental
                    </label>
                    <select
                      name="vitalSigns.alertness"
                      value={formData.vitalSigns.alertness}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Alerta">Alerta</option>
                      <option value="Letárgico">Letárgico</option>
                      <option value="Deprimido">Deprimido</option>
                      <option value="Estuporoso">Estuporoso</option>
                      <option value="Comatoso">Comatoso</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Revisión por Sistemas */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">🔍 Revisión por Sistemas</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sistema tegumentario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sistema tegumentario
                    </label>
                    <select
                      name="systemsReview.skinCondition"
                      value={formData.systemsReview.skinCondition}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="N">Normal</option>
                      <option value="AN">Anormal</option>
                      <option value="NE">No examinado</option>
                    </select>
                  </div>

                  {/* Sistema respiratorio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sistema respiratorio
                    </label>
                    <select
                      name="systemsReview.respiratorySystem"
                      value={formData.systemsReview.respiratorySystem}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="N">Normal</option>
                      <option value="AN">Anormal</option>
                      <option value="NE">No examinado</option>
                    </select>
                  </div>
                </div>

                {/* Diagnóstico y Tratamiento */}
                <div className="space-y-4 mt-6 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnóstico
                    </label>
                    <textarea
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      disabled={loading}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="Diagnóstico principal y diferenciales..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tratamiento
                    </label>
                    <textarea
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleChange}
                      disabled={loading}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="Plan de tratamiento detallado..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={loading}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                ← Anterior
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Ficha' : 'Actualizar Ficha')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}