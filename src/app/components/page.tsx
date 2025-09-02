'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'

export default function ComponentsPage() {
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Cita agendada correctamente', type: 'success' },
    { id: 2, message: 'Stock bajo en Amoxicilina', type: 'warning' },
    { id: 3, message: 'Error al conectar con el servidor', type: 'error' },
  ])

  const handleButtonClick = (action: string) => {
    console.log(`Action: ${action}`)
    if (action === 'loading') {
      setLoading(!loading)
    }
  }

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 Showcase de Componentes</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora todos los componentes de la interfaz del sistema veterinario con Open Sans como fuente principal.
            </p>
          </div>

          {/* Typography */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Tipografía</h2>
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Heading 1 (4xl, font-bold)</h1>
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-gray-800">Heading 2 (3xl, font-semibold)</h2>
              </div>
              <div>
                <h3 className="text-2xl font-medium text-gray-800">Heading 3 (2xl, font-medium)</h3>
              </div>
              <div>
                <h4 className="text-xl font-medium text-gray-700">Heading 4 (xl, font-medium)</h4>
              </div>
              <div>
                <p className="text-base text-gray-600 font-normal">Texto normal (base, font-normal) - Esta es una muestra de texto regular usando Open Sans.</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-light">Texto pequeño (sm, font-light) - Texto secundario y notas.</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-light">Texto muy pequeño (xs, font-light) - Texto auxiliar.</p>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔘 Botones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Primarios</h3>
                <button 
                  onClick={() => handleButtonClick('primary')}
                  className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Botón Primario
                </button>
                <button 
                  onClick={() => handleButtonClick('primary-lg')}
                  className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md text-lg"
                >
                  Primario Grande
                </button>
                <button 
                  onClick={() => handleButtonClick('loading')}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Cargando...' : 'Con Estado de Carga'}
                </button>
              </div>

              {/* Secondary Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Secundarios</h3>
                <button 
                  onClick={() => handleButtonClick('secondary')}
                  className="w-full bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Botón Secundario
                </button>
                <button 
                  onClick={() => handleButtonClick('outline')}
                  className="w-full border-2 border-blue-600 text-blue-600 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200"
                >
                  Botón Outline
                </button>
                <button 
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-medium px-4 py-2 rounded-md cursor-not-allowed"
                >
                  Botón Deshabilitado
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">De Acción</h3>
                <button 
                  onClick={() => handleButtonClick('success')}
                  className="w-full bg-green-600 text-white font-medium px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm"
                >
                  ✅ Éxito
                </button>
                <button 
                  onClick={() => handleButtonClick('warning')}
                  className="w-full bg-yellow-500 text-white font-medium px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
                >
                  ⚠️ Advertencia
                </button>
                <button 
                  onClick={() => handleButtonClick('danger')}
                  className="w-full bg-red-600 text-white font-medium px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 shadow-sm"
                >
                  ❌ Peligro
                </button>
              </div>
            </div>
          </section>

          {/* Form Elements */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Elementos de Formulario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Input de Texto
                  </label>
                  <input
                    type="text"
                    placeholder="Escribe algo aquí..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                    <option>Selecciona una opción</option>
                    <option>Opción 1</option>
                    <option>Opción 2</option>
                    <option>Opción 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Textarea
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe un mensaje..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Checkbox
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Opción 1</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Opción 2 (seleccionada)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radio
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="radio-group" className="border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Opción A</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="radio-group" className="border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Opción B (seleccionada)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cards and Notifications */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔔 Notificaciones y Tarjetas</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Notifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Notificaciones</h3>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border-l-4 flex justify-between items-start ${
                        notification.type === 'success'
                          ? 'bg-green-50 border-green-400 text-green-800'
                          : notification.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                          : 'bg-red-50 border-red-400 text-red-800'
                      }`}
                    >
                      <span className="text-sm font-medium">{notification.message}</span>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cards */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Tarjetas</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Tarjeta Simple</h4>
                      <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Esta es una tarjeta de ejemplo con contenido básico y buena tipografía.
                    </p>
                    <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      Ver más →
                    </button>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Tarjeta con Sombra</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Activo
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tarjeta con sombra y elemento de estado para mejor jerarquía visual.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Color Palette */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎨 Paleta de Colores</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Blue 600', class: 'bg-blue-600', text: 'text-white' },
                { name: 'Blue 100', class: 'bg-blue-100', text: 'text-blue-800' },
                { name: 'Green 600', class: 'bg-green-600', text: 'text-white' },
                { name: 'Green 100', class: 'bg-green-100', text: 'text-green-800' },
                { name: 'Yellow 500', class: 'bg-yellow-500', text: 'text-white' },
                { name: 'Yellow 100', class: 'bg-yellow-100', text: 'text-yellow-800' },
                { name: 'Red 600', class: 'bg-red-600', text: 'text-white' },
                { name: 'Red 100', class: 'bg-red-100', text: 'text-red-800' },
                { name: 'Gray 900', class: 'bg-gray-900', text: 'text-white' },
                { name: 'Gray 600', class: 'bg-gray-600', text: 'text-white' },
                { name: 'Gray 300', class: 'bg-gray-300', text: 'text-gray-900' },
                { name: 'Gray 100', class: 'bg-gray-100', text: 'text-gray-900' },
              ].map((color) => (
                <div key={color.name} className={`${color.class} ${color.text} p-4 rounded-lg text-center`}>
                  <div className="text-xs font-medium">{color.name}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}