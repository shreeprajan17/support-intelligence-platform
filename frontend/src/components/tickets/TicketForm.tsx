import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority, Status } from '../../types/ticket.ts'

export interface TicketFormValues {
  subject: string
  description: string
  customer_email: string
  category: string
  priority: Priority
  status: Status
}

interface TicketFormProps {
  defaultValues: TicketFormValues
  onSubmit: (values: TicketFormValues) => void
  isPending: boolean
  submitError: string | null
  mode: 'create' | 'edit'
  onCancel: () => void
}

type FieldErrors = Partial<Record<keyof TicketFormValues, string>>

function validate(values: TicketFormValues): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.subject.trim()) errors.subject = 'Subject is required.'
  if (!values.description.trim()) errors.description = 'Description is required.'
  if (!values.customer_email.trim()) {
    errors.customer_email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customer_email)) {
    errors.customer_email = 'Enter a valid email address.'
  }
  return errors
}

export function TicketForm({
  defaultValues,
  onSubmit,
  isPending,
  submitError,
  mode,
  onCancel,
}: TicketFormProps) {
  const [values, setValues] = useState<TicketFormValues>(defaultValues)
  const [errors, setErrors] = useState<FieldErrors>({})

  function set(field: keyof TicketFormValues, value: string) {
    setValues(prev => ({ ...prev, [field]: value } as TicketFormValues))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(values)
  }

  function fieldClass(field: keyof TicketFormValues) {
    return `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors bg-white dark:bg-gray-700 ${
      errors[field] ? 'border-red-400 dark:border-red-500 focus:ring-red-400 dark:focus:ring-red-400' : 'border-gray-300 dark:border-gray-600'
    }`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Subject <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          type="text"
          value={values.subject}
          onChange={e => set('subject', e.target.value)}
          maxLength={200}
          placeholder="Briefly describe the issue"
          className={fieldClass('subject')}
        />
        {errors.subject && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.subject}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Description <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <textarea
          value={values.description}
          onChange={e => set('description', e.target.value)}
          rows={4}
          placeholder="Provide as much detail as possible"
          className={`${fieldClass('description')} resize-y`}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Customer Email <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="email"
            value={values.customer_email}
            onChange={e => set('customer_email', e.target.value)}
            placeholder="customer@example.com"
            className={fieldClass('customer_email')}
          />
          {errors.customer_email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.customer_email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
          <input
            type="text"
            value={values.category}
            onChange={e => set('category', e.target.value)}
            placeholder="e.g. Billing, Account, Technical"
            className={fieldClass('category')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
          <select
            value={values.priority}
            onChange={e => set('priority', e.target.value)}
            className={fieldClass('priority')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {mode === 'edit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <select
              value={values.status}
              onChange={e => set('status', e.target.value)}
              className={fieldClass('status')}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          {isPending
            ? mode === 'create'
              ? 'Creating…'
              : 'Saving…'
            : mode === 'create'
              ? 'Create Ticket'
              : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
