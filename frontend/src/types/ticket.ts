export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed'
export type SortBy = 'created_at_desc' | 'created_at_asc' | 'priority_desc' | 'priority_asc'

export interface TicketFilters {
  search?: string
  status?: Status
  priority?: Priority
  category?: string
  sort_by?: SortBy
}

export interface Ticket {
  id: string
  subject: string
  description: string
  customer_email: string
  category: string | null
  priority: Priority
  status: Status
  created_at: string
  updated_at: string
}

export interface TicketListResponse {
  items: Ticket[]
  total: number
  skip: number
  limit: number
}

export interface TicketCreate {
  subject: string
  description: string
  customer_email: string
  category?: string | null
  priority: Priority
}

export interface TicketUpdate {
  subject?: string
  description?: string
  customer_email?: string
  category?: string | null
  priority?: Priority
  status?: Status
}
