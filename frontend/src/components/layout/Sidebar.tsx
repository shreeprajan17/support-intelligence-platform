import { LayoutDashboard, Ticket } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
]

export function Sidebar() {
  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">SIP</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">SupportIQ</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
          Main
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
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

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-indigo-700">HV</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Husain V.</p>
            <p className="text-xs text-gray-500 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
