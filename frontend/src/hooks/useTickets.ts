import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getTickets } from '../api/tickets.ts'
import type { TicketFilters } from '../types/ticket.ts'

export function useTickets(skip: number, limit: number, filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ['tickets', skip, limit, filters],
    queryFn: () => getTickets(skip, limit, filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
