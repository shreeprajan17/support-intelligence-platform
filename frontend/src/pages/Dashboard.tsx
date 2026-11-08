import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'
import type { Priority, Status, Ticket } from '../types/ticket.ts'

const STAT_CARDS = [
  {
    label: 'Open Tickets',
    value: '24',
    icon: AlertCircle,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    label: 'In Progress',
    value: '8',
    icon: TrendingUp,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    label: 'Resolved Today',
    value: '15',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    label: 'Avg Response',
    value: '2.4h',
    icon: Clock,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
  },
]

const RECENT_TICKETS: Ticket[] = [
  {
    id: 'tk-001',
    subject: 'Unable to log in to account',
    description: '',
    customer_email: 'alice@example.com',
    category: 'Authentication',
    priority: 'high',
    status: 'open',
    created_at: '2026-11-08T09:00:00Z',
    updated_at: '2026-11-08T09:00:00Z',
  },
  {
    id: 'tk-002',
    subject: 'Billing charge appears twice this month',
    description: '',
    customer_email: 'bob@techcorp.io',
    category: 'Billing',
    priority: 'high',
    status: 'in_progress',
    created_at: '2026-11-08T08:30:00Z',
    updated_at: '2026-11-08T10:15:00Z',
  },
  {
    id: 'tk-003',
    subject: 'Export to CSV is not working',
    description: '',
    customer_email: 'carol@demo.com',
    category: 'Bug',
    priority: 'medium',
    status: 'open',
    created_at: '2026-11-08T07:45:00Z',
    updated_at: '2026-11-08T07:45:00Z',
  },
  {
    id: 'tk-004',
    subject: 'Request for API access credentials',
    description: '',
    customer_email: 'dave@startup.dev',
    category: 'API',
    priority: 'low',
    status: 'resolved',
    created_at: '2026-11-07T16:00:00Z',
    updated_at: '2026-11-08T09:30:00Z',
  },
  {
    id: 'tk-005',
    subject: 'Dashboard charts not rendering in Firefox',
    description: '',
    customer_email: 'eve@company.net',
    category: 'Bug',
    priority: 'medium',
    status: 'in_progress',
    created_at: '2026-11-07T14:20:00Z',
    updated_at: '2026-11-08T11:00:00Z',
  },
]

const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  low: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
}

const STATUS_STYLES: Record<Status, string> = {
  open: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  closed: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200',
}

const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent tickets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Recent Tickets</h2>
          <p className="text-sm text-gray-500 mt-0.5">Latest activity across your support queue</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Subject
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Priority
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_TICKETS.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {ticket.subject}
                    </p>
                    {ticket.category && (
                      <p className="text-xs text-gray-400 mt-0.5">{ticket.category}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{ticket.customer_email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[ticket.priority]}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}
                    >
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {formatDate(ticket.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
