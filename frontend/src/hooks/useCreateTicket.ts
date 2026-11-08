import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTicket } from '../api/tickets.ts'
import type { TicketCreate } from '../types/ticket.ts'

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TicketCreate) => createTicket(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
