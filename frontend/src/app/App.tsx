import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../shared/AppLayout'

const EventsPage = lazy(() => import('../pages/EventsPage'))
const EventPage = lazy(() => import('../pages/EventPage'))
const EventFormPage = lazy(() => import('../pages/EventFormPage'))
const GroupPage = lazy(() => import('../pages/GroupPage'))
const ChatPage = lazy(() => import('../pages/ChatPage'))
const AttendancePage = lazy(() => import('../pages/AttendancePage'))
const MyEventsPage = lazy(() => import('../pages/MyEventsPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<Suspense fallback={<div className="route-loading">Открываем страницу…</div>}><EventsPage /></Suspense>} />
        <Route path="/my-events" element={<Suspense fallback={<div className="route-loading">Загружаем встречи…</div>}><MyEventsPage /></Suspense>} />
        <Route path="/events/new" element={<Suspense fallback={<div className="route-loading">Открываем страницу…</div>}><EventFormPage /></Suspense>} />
        <Route path="/events/:eventId" element={<Suspense fallback={<div className="route-loading">Открываем страницу…</div>}><EventPage /></Suspense>} />
        <Route path="/events/:eventId/edit" element={<Suspense fallback={<div className="route-loading">Открываем страницу…</div>}><EventFormPage /></Suspense>} />
        <Route path="/events/:eventId/group" element={<Suspense fallback={<div className="route-loading">Открываем страницу…</div>}><GroupPage /></Suspense>} />
        <Route path="/events/:eventId/chat" element={<Suspense fallback={<div className="route-loading">Открываем страницу…</div>}><ChatPage /></Suspense>} />
        <Route path="/events/:eventId/attendance" element={<Suspense fallback={<div className="route-loading">Открываем страницу…</div>}><AttendancePage /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<div className="route-loading">Открываем страницу…</div>}><NotFoundPage /></Suspense>} />
      </Route>
    </Routes>
  )
}
