import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useTickets } from '../hooks/useTickets.ts'
import type { Priority, Status } from '../types/ticket.ts'

const STAT_CARDS = [
  {
    label: 'Open Tickets',
    value: '—',
    icon: AlertCircle,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    label: 'In Progress',
    value: '—',
    icon: TrendingUp,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    label: 'Resolved Today',
    value: '—',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    label: 'Avg Response',
    value: '—',
    icon: Clock,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
  },
]

const PRIORITY_STYLES: Record<Priority, string> = {
  critical: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-300',
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

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="space-y-2">
              <div className="h-3.5 bg-gray-200 rounded-full w-48" />
              <div className="h-2.5 bg-gray-100 rounded-full w-20" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-3 bg-gray-200 rounded-full w-36" />
          </td>
          <td className="px-6 py-4">
            <div className="h-5 bg-gray-200 rounded-md w-16" />
          </td>
          <td className="px-6 py-4">
            <div className="h-5 bg-gray-200 rounded-md w-20" />
          </td>
          <td className="px-6 py-4">
            <div className="h-3 bg-gray-200 rounded-full w-28" />
          </td>
        </tr>
      ))}
    </>
  )
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useTickets(0, 5)

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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Recent Tickets</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Latest activity across your support queue
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Subject', 'Customer', 'Priority', 'Status', 'Created'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {isLoading && <SkeletonRows />}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Could not load recent tickets</p>
                      <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-3 px-3 py-1.5 rounded-md bg-gray-900 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    No tickets yet.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                data?.items.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {ticket.subject}
                      </p>
                      {ticket.category && (
                        <p className="text-xs text-gray-400 mt-0.5">{ticket.category}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {ticket.customer_email}
                    </td>
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
