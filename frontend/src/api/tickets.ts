import type { Ticket, TicketCreate, TicketFilters, TicketListResponse, TicketUpdate } from '../types/ticket.ts'
import apiClient from './client.ts'

export async function getTickets(
  skip: number,
  limit: number,
  filters: TicketFilters = {},
): Promise<TicketListResponse> {
  const params: Record<string, unknown> = { skip, limit }
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.category) params.category = filters.category
  if (filters.sort_by) params.sort_by = filters.sort_by
  const { data } = await apiClient.get<TicketListResponse>('/api/v1/tickets', { params })
  return data
}

export async function getTicket(id: string): Promise<Ticket> {
  const { data } = await apiClient.get<Ticket>(`/api/v1/tickets/${id}`)
  return data
}

export async function createTicket(payload: TicketCreate): Promise<Ticket> {
  const { data } = await apiClient.post<Ticket>('/api/v1/tickets', payload)
  return data
}

export async function updateTicket(id: string, payload: TicketUpdate): Promise<Ticket> {
  const { data } = await apiClient.patch<Ticket>(`/api/v1/tickets/${id}`, payload)
  return data
}
