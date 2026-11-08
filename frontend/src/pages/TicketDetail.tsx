import axios from 'axios'
import { AlertTriangle, ChevronLeft, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTicket } from '../hooks/useTicket.ts'
import type { Priority, Status } from '../types/ticket.ts'

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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded-full w-32" />
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded-full w-80" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded-md w-16" />
          <div className="h-5 bg-gray-200 rounded-md w-20" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="h-3.5 bg-gray-200 rounded-full w-24" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-5/6" />
          <div className="h-3 bg-gray-100 rounded-full w-4/6" />
        </div>
      </div>
    </div>
  )
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ticket, isLoading, isError, error } = useTicket(id!)

  if (isLoading) return <DetailSkeleton />

  if (isError) {
    const is404 = axios.isAxiosError(error) && error.response?.status === 404
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-base font-semibold text-gray-900">
          {is404 ? 'Ticket not found' : 'Failed to load ticket'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {is404
            ? 'This ticket may have been deleted.'
            : 'Could not connect to the backend.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/tickets')}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tickets
        </button>
      </div>
    )
  }

  if (!ticket) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tickets
          </button>
          <h2 className="text-xl font-semibold text-gray-900 break-words">{ticket.subject}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[ticket.priority]}`}
            >
              {ticket.priority}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}
            >
              {STATUS_LABELS[ticket.status]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/tickets/${id}/edit`)}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Description
        </h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {ticket.description}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Details
        </h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{ticket.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</dt>
            <dd className="mt-1 text-sm text-gray-900">{ticket.customer_email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</dt>
            <dd className="mt-1 text-sm text-gray-900">{ticket.category ?? 'None'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{ticket.priority}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(ticket.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(ticket.updated_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
