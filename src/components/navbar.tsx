import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <span className="text-2xl font-bold text-blue-600">🏥 VetSystem</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link 
              href="/components" 
              className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Componentes
            </Link>
            <Link 
              href="/auth/login" 
              className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}