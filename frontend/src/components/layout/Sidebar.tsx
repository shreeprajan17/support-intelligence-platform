import { LayoutDashboard, Moon, Sun, Ticket, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext.tsx'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

function SidebarContent({ onClose, showClose }: { onClose: () => void; showClose?: boolean }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img src="/tramium-color.svg" alt="Tramium" className="w-8 h-8" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Tramium</span>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
          Main
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                  ].join(' ')
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">SP</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Shree Prajan</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Admin</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop — always visible */}
      <aside className="hidden lg:flex w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col flex-shrink-0">
        <SidebarContent onClose={onClose} />
      </aside>

      {/* Mobile — slides in as overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col lg:hidden transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <SidebarContent onClose={onClose} showClose />
      </aside>
    </>
  )
}
