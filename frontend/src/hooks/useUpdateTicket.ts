import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTicket } from '../api/tickets.ts'
import type { Ticket, TicketUpdate } from '../types/ticket.ts'

export function useUpdateTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TicketUpdate) => updateTicket(id, data),
    onSuccess: (updated: Ticket) => {
      queryClient.setQueryData(['ticket', id], updated)
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
