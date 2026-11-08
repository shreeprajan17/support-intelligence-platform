export type Priority = 'low' | 'medium' | 'high'
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed'

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
