import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/tickets': 'Tickets',
}

export function TopBar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Support Intelligence'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-1">
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
