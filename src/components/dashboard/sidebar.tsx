'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

interface NavItem {
  name: string
  href: string
  icon: string
  roles: string[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'] },
  { name: 'Propietarios', href: '/dashboard/owners', icon: '👥', roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'] },
  { name: 'Mascotas', href: '/dashboard/pets', icon: '🐕', roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'] },
  { name: 'Historiales', href: '/dashboard/medical-records', icon: '📋', roles: ['ADMIN', 'VETERINARIAN'] },
  { name: 'Citas', href: '/dashboard/appointments', icon: '📅', roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'] },
  { name: 'Inventario', href: '/dashboard/inventory', icon: '📦', roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'] },
  { name: 'Recordatorios', href: '/dashboard/reminders', icon: '🔔', roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'] },
  { name: 'Comprobantes', href: '/dashboard/receipts', icon: '💰', roles: ['ADMIN', 'RECEPTIONIST'] },
  { name: 'Usuarios', href: '/dashboard/users', icon: '👤', roles: ['ADMIN'] },
  { name: 'Configuración', href: '/dashboard/settings', icon: '⚙️', roles: ['ADMIN'] },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const userRole = session.user.role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="flex flex-col w-64 bg-gray-800 min-h-screen">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <span className="text-white text-xl font-bold">🏥 VetSystem</span>
      </div>

      {/* User info */}
      <div className="px-4 py-3 bg-gray-700">
        <p className="text-sm font-medium text-white">{session.user.name}</p>
        <p className="text-xs text-gray-300">
          {userRole === 'ADMIN' && '👑 Administrador'}
          {userRole === 'VETERINARIAN' && '🩺 Veterinario'}
          {userRole === 'RECEPTIONIST' && '📝 Recepcionista'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {filteredNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              pathname === item.href
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="flex-shrink-0 p-2">
        <button
          onClick={handleSignOut}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
        >
          <span className="mr-3 text-lg">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}