import axios from 'axios'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TicketForm } from '../components/tickets/TicketForm.tsx'
import type { TicketFormValues } from '../components/tickets/TicketForm.tsx'
import { useCreateTicket } from '../hooks/useCreateTicket.ts'
import { toast } from '../lib/toast.ts'

export function TicketCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateTicket()
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(values: TicketFormValues) {
    setSubmitError(null)
    try {
      const ticket = await mutateAsync({
        subject: values.subject,
        description: values.description,
        customer_email: values.customer_email,
        category: values.category.trim() || null,
        priority: values.priority,
      })
      toast.success('Ticket created successfully.')
      navigate(`/tickets/${ticket.id}`)
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
        onClick={() => navigate('/tickets')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Tickets
      </button>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">New Ticket</h2>
        <p className="text-sm text-gray-500 mt-1">Submit a new support request</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <TicketForm
          defaultValues={{
            subject: '',
            description: '',
            customer_email: '',
            category: '',
            priority: 'medium',
            status: 'open',
          }}
          onSubmit={values => void handleSubmit(values)}
          isPending={isPending}
          submitError={submitError}
          mode="create"
          onCancel={() => navigate('/tickets')}
        />
      </div>
    </div>
  )
}
