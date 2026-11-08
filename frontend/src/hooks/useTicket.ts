import { useQuery } from '@tanstack/react-query'
import { getTicket } from '../api/tickets.ts'

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicket(id),
    staleTime: 30_000,
  })
}
