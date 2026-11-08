import { Bell, Menu, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface TopBarProps {
  onMenuClick: () => void
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard'
  if (pathname === '/tickets') return 'Tickets'
  if (pathname === '/tickets/new') return 'New Ticket'
  if (/^\/tickets\/[^/]+\/edit$/.test(pathname)) return 'Edit Ticket'
  if (/^\/tickets\/[^/]+$/.test(pathname)) return 'Ticket Details'
  return 'Support Intelligence'
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
