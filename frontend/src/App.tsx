import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { DashboardPage } from './pages/Dashboard.tsx'
import { NotFoundPage } from './pages/NotFound.tsx'
import { TicketCreatePage } from './pages/TicketCreate.tsx'
import { TicketDetailPage } from './pages/TicketDetail.tsx'
import { TicketEditPage } from './pages/TicketEdit.tsx'
import { TicketsPage } from './pages/Tickets.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/new" element={<TicketCreatePage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="tickets/:id/edit" element={<TicketEditPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
