import axios from 'axios'
import { AlertTriangle, ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteTicket } from '../hooks/useDeleteTicket.ts'
import { useTicket } from '../hooks/useTicket.ts'
import { toast } from '../lib/toast.ts'
import type { Priority, Status } from '../types/ticket.ts'

const PRIORITY_STYLES: Record<Priority, string> = {
  critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 ring-1 ring-inset ring-red-300 dark:ring-red-800',
  high: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800',
  medium: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-200 dark:ring-amber-800',
  low: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-200 dark:ring-green-800',
}

const STATUS_STYLES: Record<Status, string> = {
  open: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-200 dark:ring-blue-800',
  in_progress: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-200 dark:ring-amber-800',
  resolved: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800',
  closed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-600',
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
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-80" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-16" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-20" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-5/6" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-4/6" />
        </div>
      </div>
    </div>
  )
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ticket, isLoading, isError, error } = useTicket(id!)
  const { mutateAsync: deleteMutation, isPending: isDeleting } = useDeleteTicket(id!)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    try {
      await deleteMutation()
      toast.success('Ticket deleted.')
      navigate('/tickets')
    } catch {
      toast.error('Failed to delete ticket. Please try again.')
    }
  }

  if (isLoading) return <DetailSkeleton />

  if (isError) {
    const is404 = axios.isAxiosError(error) && error.response?.status === 404
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {is404 ? 'Ticket not found' : 'Failed to load ticket'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {is404
            ? 'This ticket may have been deleted.'
            : 'Could not connect to the backend.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/tickets')}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-700 text-sm font-medium text-white hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tickets
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white break-words">{ticket.subject}</h2>
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

        <div className="flex items-center gap-2 flex-shrink-0">
          {confirmDelete ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Delete this ticket?</span>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting…' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/tickets/${id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Description
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {ticket.description}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Details
        </h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ticket ID</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono break-all">{ticket.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Customer</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{ticket.customer_email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{ticket.category ?? 'None'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Priority</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">{ticket.priority}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(ticket.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(ticket.updated_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
