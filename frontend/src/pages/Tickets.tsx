import { Ticket } from 'lucide-react'

export function TicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">All Tickets</h2>
        <p className="text-sm text-gray-500 mt-1">
          Full ticket management will be implemented here.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Ticket className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900">No tickets yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Ticket list and filtering coming in the next milestone.
        </p>
      </div>
    </div>
  )
}
