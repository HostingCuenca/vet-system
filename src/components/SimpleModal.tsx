'use client'

interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SimpleModal({ isOpen, onClose }: SimpleModalProps) {
  console.log('SimpleModal render, isOpen:', isOpen)
  
  if (!isOpen) {
    console.log('Modal not open, returning null')
    return null
  }

  console.log('Rendering modal')

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Modal de Prueba</h2>
        <p className="mb-4">Este es un modal simple para probar que funciona</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}