import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Plus,
  Search,
  SlidersHorizontal,
  Ticket,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce.ts'
import { useTickets } from '../hooks/useTickets.ts'
import type { Priority, SortBy, Status, TicketFilters } from '../types/ticket.ts'

const LIMIT = 20

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

const TABLE_HEADERS = ['Subject', 'Customer', 'Priority', 'Status', 'Created']

const SELECT_CLASS =
  'rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors'

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-4 sm:px-6">
            <div className="space-y-2">
              <div className="h-3.5 bg-gray-200 rounded-full w-52 max-w-full" />
              <div className="h-2.5 bg-gray-100 rounded-full w-20" />
            </div>
          </td>
          <td className="hidden px-4 py-4 sm:table-cell sm:px-6">
            <div className="h-3 bg-gray-200 rounded-full w-40" />
          </td>
          <td className="px-4 py-4 sm:px-6">
            <div className="h-5 bg-gray-200 rounded-md w-16" />
          </td>
          <td className="hidden px-4 py-4 sm:table-cell sm:px-6">
            <div className="h-5 bg-gray-200 rounded-md w-20" />
          </td>
          <td className="hidden px-4 py-4 lg:table-cell lg:px-6">
            <div className="h-3 bg-gray-200 rounded-full w-28" />
          </td>
        </tr>
      ))}
    </>
  )
}

export function TicketsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [rawSearch, setRawSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('')
  const [rawCategory, setRawCategory] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('created_at_desc')

  const search = useDebounce(rawSearch, 400)
  const category = useDebounce(rawCategory, 400)

  useEffect(() => {
    setPage(1)
  }, [search, category, statusFilter, priorityFilter, sortBy])

  const activeFilters: TicketFilters = { sort_by: sortBy }
  if (search) activeFilters.search = search
  if (category) activeFilters.category = category
  if (statusFilter) activeFilters.status = statusFilter as Status
  if (priorityFilter) activeFilters.priority = priorityFilter as Priority

  const skip = (page - 1) * LIMIT
  const { data, isLoading, isError, refetch, isFetching } = useTickets(skip, LIMIT, activeFilters)

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const from = total === 0 ? 0 : skip + 1
  const to = Math.min(skip + LIMIT, total)
  const hasPrev = page > 1
  const hasNext = skip + LIMIT < total

  const hasFilters =
    !!rawSearch || !!rawCategory || !!statusFilter || !!priorityFilter || sortBy !== 'created_at_desc'

  function clearFilters() {
    setRawSearch('')
    setRawCategory('')
    setStatusFilter('')
    setPriorityFilter('')
    setSortBy('created_at_desc')
    setPage(1)
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Tickets</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isLoading ? (
              <span className="inline-block h-3 w-32 bg-gray-200 rounded-full animate-pulse align-middle" />
            ) : isError ? (
              'Could not load tickets'
            ) : (
              `${total.toLocaleString()} ticket${total !== 1 ? 's' : ''}${hasFilters ? ' matched' : ' total'}`
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/tickets/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Ticket</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={rawSearch}
            onChange={e => setRawSearch(e.target.value)}
            placeholder="Search subject, description, email…"
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          {rawSearch && (
            <button
              type="button"
              onClick={() => setRawSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as Status | ''); setPage(1) }}
          className={SELECT_CLASS}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={e => { setPriorityFilter(e.target.value as Priority | ''); setPage(1) }}
          className={SELECT_CLASS}
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Category */}
        <div className="relative min-w-36">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={rawCategory}
            onChange={e => setRawCategory(e.target.value)}
            placeholder="Category…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value as SortBy); setPage(1) }}
          className={SELECT_CLASS}
          aria-label="Sort tickets"
        >
          <option value="created_at_desc">Newest first</option>
          <option value="created_at_asc">Oldest first</option>
          <option value="priority_desc">Highest priority</option>
          <option value="priority_asc">Lowest priority</option>
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex-shrink-0 px-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}

        {/* Fetching indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
            <div className="w-3 h-3 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            Updating
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {TABLE_HEADERS.map((h, i) => (
                  <th
                    key={h}
                    className={`text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 whitespace-nowrap px-4 sm:px-6 ${
                      i === 1 ? 'hidden sm:table-cell' : i === 3 ? 'hidden sm:table-cell' : i === 4 ? 'hidden lg:table-cell' : ''
                    }`}
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
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Failed to load tickets</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Make sure the backend is running at{' '}
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}
                        </code>
                      </p>
                      <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-5 px-4 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    {hasFilters ? (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">No tickets match your filters</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or clearing the filters.
                        </p>
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Inbox className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">No tickets yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Create your first ticket to get started.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/tickets/new')}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                        >
                          <Ticket className="w-4 h-4" />
                          New Ticket
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                data?.items.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${isFetching ? 'opacity-60' : 'opacity-100'}`}
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <p className="font-medium text-gray-900 truncate max-w-[12rem] sm:max-w-xs" title={ticket.subject}>
                        {ticket.subject}
                      </p>
                      {ticket.category && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{ticket.category}</p>
                      )}
                      {/* Show email on mobile since that column is hidden */}
                      <p className="text-xs text-gray-400 mt-0.5 sm:hidden truncate">{ticket.customer_email}</p>
                    </td>
                    <td className="hidden px-4 py-4 sm:table-cell sm:px-6 text-gray-600 max-w-[10rem] lg:max-w-none">
                      <span className="truncate block" title={ticket.customer_email}>{ticket.customer_email}</span>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[ticket.priority]}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 sm:table-cell sm:px-6">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}
                      >
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell lg:px-6 text-gray-500 whitespace-nowrap">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isError && !isLoading && total > LIMIT && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium text-gray-900">{from}</span>
              {' – '}
              <span className="font-medium text-gray-900">{to}</span>
              {' of '}
              <span className="font-medium text-gray-900">{total.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(p => p - 1)}
                disabled={!hasPrev || isFetching}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-500 tabular-nums px-1 min-w-[4rem] text-center">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNext || isFetching}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
