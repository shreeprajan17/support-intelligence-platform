import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTicket } from '../api/tickets.ts'

export function useDeleteTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteTicket(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
