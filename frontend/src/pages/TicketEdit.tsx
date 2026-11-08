import axios from 'axios'
import { AlertTriangle, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TicketForm } from '../components/tickets/TicketForm.tsx'
import type { TicketFormValues } from '../components/tickets/TicketForm.tsx'
import { useTicket } from '../hooks/useTicket.ts'
import { useUpdateTicket } from '../hooks/useUpdateTicket.ts'
import { toast } from '../lib/toast.ts'

function EditSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-48" />
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TicketEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ticket, isLoading, isError, error } = useTicket(id!)
  const { mutateAsync, isPending } = useUpdateTicket(id!)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (isLoading) return <EditSkeleton />

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

  async function handleSubmit(values: TicketFormValues) {
    setSubmitError(null)
    try {
      await mutateAsync({
        subject: values.subject,
        description: values.description,
        customer_email: values.customer_email,
        category: values.category.trim() || null,
        priority: values.priority,
        status: values.status,
      })
      toast.success('Ticket updated successfully.')
      navigate(`/tickets/${id}`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === 'string') { setSubmitError(detail); return }
        if (Array.isArray(detail) && detail.length > 0) {
          setSubmitError((detail[0] as { msg?: string }).msg ?? 'Request failed')
          return
        }
      }
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/tickets/${id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Ticket
      </button>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Ticket</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">{ticket.subject}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <TicketForm
          defaultValues={{
            subject: ticket.subject,
            description: ticket.description,
            customer_email: ticket.customer_email,
            category: ticket.category ?? '',
            priority: ticket.priority,
            status: ticket.status,
          }}
          onSubmit={values => void handleSubmit(values)}
          isPending={isPending}
          submitError={submitError}
          mode="edit"
          onCancel={() => navigate(`/tickets/${id}`)}
        />
      </div>
    </div>
  )
}
