'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/courses', label: 'Courses' },
    { href: '/dashboard/assignments', label: 'Assignments' },
    { href: '/dashboard/profile', label: 'Profile' },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded transition-colors ${
              pathname === item.href
                ? 'bg-blue-600'
                : 'hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
