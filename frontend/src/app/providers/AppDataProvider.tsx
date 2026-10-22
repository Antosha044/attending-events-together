import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { EventInput, EventItem, EventMessage } from '../../entities/event/model/types'
import type { UserProfile } from '../../entities/user/model/types'
import { apiRequest, clearTokens, getTokens, hasSession, storeTokens } from '../../shared/api'

type ApiUser = { id: number; display_name: string; email: string; city: string }
type ApiEvent = { id: number; title: string; category: string; city: string; venue: string; address: string | null; description: string | null; starts_at: string; capacity: number; price: string; image: string; host_name: string; creator_id: number; going: number }
type ApiParticipation = { id: number; event_id: number; user_id: number; status: 'joined' | 'cancelled' }
type ApiAttendance = { id: number; event_id: number; attended: boolean }
type ApiMessage = { id: number; author_id: number; body: string; sent_at: string }
type TokenPair = { access_token: string; refresh_token: string; user: ApiUser }
type Participant = { id: number; display_name: string; status: string }

type AppData = {
  events: EventItem[]; joinedEventIds: string[]; profile: UserProfile; messages: Record<string, EventMessage[]>; attendance: Record<string, boolean>
  authenticated: boolean; loading: boolean; dataError: string | null
}
type AppDataContextValue = AppData & {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, city: string) => Promise<void>
  signOut: () => Promise<void>
  saveProfile: (profile: UserProfile) => Promise<void>
  saveEvent: (input: EventInput, id?: string) => Promise<string>
  uploadEventImage: (id: string, image: Blob) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  toggleParticipation: (eventId: string) => Promise<void>
  loadMessages: (eventId: string) => Promise<void>
  loadParticipants: (eventId: string) => Promise<Participant[]>
  sendMessage: (eventId: string, text: string) => Promise<void>
  setAttendance: (eventId: string, attended: boolean) => Promise<void>
  reloadEvents: () => Promise<void>
}

const guest: UserProfile = { name: 'Гость', email: '', city: 'Москва' }
const initial: AppData = { events: [], joinedEventIds: [], profile: guest, messages: {}, attendance: {}, authenticated: false, loading: true, dataError: null }
const AppDataContext = createContext<AppDataContextValue | null>(null)

function mapUser(user: ApiUser): UserProfile { return { id: user.id, name: user.display_name, email: user.email, city: user.city } }
function mapEvent(event: ApiEvent): EventItem {
  const date = new Date(event.starts_at)
  const dateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return { id: String(event.id), creatorId: event.creator_id, title: event.title, category: event.category, dateLabel: new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }).format(date), dateTime, time: dateTime.slice(11), city: event.city, venue: event.venue, address: event.address ?? '', description: event.description ?? '', going: event.going, capacity: event.capacity, price: event.price, image: event.image || 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85', host: event.host_name, hostInitials: event.host_name.trim()[0] || 'П', hostColor: 'blue' }
}
function eventPayload(input: EventInput) {
  return { title: input.title, category: input.category, city: input.city, venue: input.venue, address: input.address || null, description: input.description || null, starts_at: new Date(input.dateTime).toISOString(), capacity: input.capacity, price: input.price, image: input.image, status: 'published' }
}
function asMessage(item: ApiMessage, name: string): EventMessage { return { id: String(item.id), name, time: new Date(item.sent_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), text: item.body } }

export function AppDataProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState(initial)
  const [participations, setParticipations] = useState<ApiParticipation[]>([])
  const [attendanceIds, setAttendanceIds] = useState<Record<string, number>>({})
  const report = (error: unknown): never => {
    const text = error instanceof Error ? error.message : 'Не удалось выполнить запрос.'
    setData((current) => ({ ...current, dataError: text }))
    throw error
  }
  const reloadEvents = useCallback(async () => {
    try { const events = await apiRequest<ApiEvent[]>('/events'); setData((current) => ({ ...current, events: events.map(mapEvent), dataError: null })) }
    catch (error) { report(error) }
  }, [])
  const loadPrivateData = useCallback(async (user: ApiUser) => {
    const [items, records, attendance] = await Promise.all([apiRequest<ApiEvent[]>('/events'), apiRequest<ApiParticipation[]>('/participations'), apiRequest<ApiAttendance[]>('/attendances')])
    const joined = records.filter((item) => item.status === 'joined')
    const attendanceMap: Record<string, boolean> = {}; const ids: Record<string, number> = {}
    for (const item of attendance) { attendanceMap[String(item.event_id)] = item.attended; ids[String(item.event_id)] = item.id }
    setParticipations(records); setAttendanceIds(ids)
    setData((current) => ({ ...current, events: items.map(mapEvent), joinedEventIds: joined.map((item) => String(item.event_id)), attendance: attendanceMap, profile: mapUser(user), authenticated: true, loading: false, dataError: null }))
  }, [])
  useEffect(() => {
    let active = true
    const start = async () => {
      try {
        if (hasSession()) { const user = await apiRequest<ApiUser>('/auth/me'); if (active) await loadPrivateData(user) }
        else { const events = await apiRequest<ApiEvent[]>('/events'); if (active) setData((current) => ({ ...current, events: events.map(mapEvent), loading: false })) }
      } catch {
        if (active) {
          clearTokens()
          try { const events = await apiRequest<ApiEvent[]>('/events'); setData((current) => ({ ...current, events: events.map(mapEvent), loading: false, authenticated: false, profile: guest, joinedEventIds: [], attendance: {}, dataError: 'Не удалось восстановить сессию. Войдите снова.' })) }
          catch { setData((current) => ({ ...current, loading: false, dataError: 'Не удалось загрузить события. Проверьте, запущен ли сервер.' })) }
        }
      }
    }
    void start()
    const expired = () => { setParticipations([]); setAttendanceIds({}); setData((current) => ({ ...current, authenticated: false, profile: guest, joinedEventIds: [], attendance: {}, messages: {}, dataError: 'Сессия завершена. Войдите снова.' })) }
    window.addEventListener('auth-expired', expired)
    return () => { active = false; window.removeEventListener('auth-expired', expired) }
  }, [loadPrivateData])

  const acceptTokens = async (tokens: TokenPair) => { storeTokens(tokens); try { await loadPrivateData(tokens.user) } catch (error) { clearTokens(); report(error) } }
  const value = useMemo<AppDataContextValue>(() => ({
    ...data,
    signIn: async (email, password) => { try { await acceptTokens(await apiRequest<TokenPair>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), skipRefresh: true })) } catch (error) { report(error) } },
    signUp: async (name, email, password, city) => { try { await acceptTokens(await apiRequest<TokenPair>('/auth/register', { method: 'POST', body: JSON.stringify({ display_name: name, email, password, city }), skipRefresh: true })) } catch (error) { report(error) } },
    signOut: async () => {
      const refreshToken = getTokens().refresh
      try { if (refreshToken) await apiRequest<void>('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }), skipRefresh: true }) } catch { /* Remove local credentials even if the server is unavailable. */ }
      clearTokens(); setParticipations([]); setAttendanceIds({})
      setData((current) => ({ ...current, profile: guest, authenticated: false, joinedEventIds: [], attendance: {}, messages: {}, dataError: null }))
    },
    saveProfile: async (profile) => {
      try { const user = await apiRequest<ApiUser>('/auth/me', { method: 'PATCH', body: JSON.stringify({ display_name: profile.name, email: profile.email, city: profile.city }) }); setData((current) => ({ ...current, profile: mapUser(user), dataError: null })) }
      catch (error) { report(error); throw error }
    },
    saveEvent: async (input, id) => {
      try {
        const result = await apiRequest<ApiEvent>(id ? `/events/${id}` : '/events', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(eventPayload(input)) })
        if (!id) { const records = await apiRequest<ApiParticipation[]>('/participations'); setParticipations(records); setData((current) => ({ ...current, joinedEventIds: records.filter((item) => item.status === 'joined').map((item) => String(item.event_id)) })) }
        await reloadEvents(); return String(result.id)
      }
      catch (error) { report(error); throw error }
    },
    uploadEventImage: async (id, image) => {
      try { await apiRequest<ApiEvent>(`/events/${id}/image`, { method: 'PUT', body: image, headers: { 'Content-Type': image.type } }); await reloadEvents() }
      catch (error) { report(error); throw error }
    },
    deleteEvent: async (id) => { try { await apiRequest<void>(`/events/${id}`, { method: 'DELETE' }); await reloadEvents() } catch (error) { report(error) } },
    toggleParticipation: async (eventId) => {
      try {
        const existing = participations.find((item) => item.event_id === Number(eventId))
        if (data.joinedEventIds.includes(eventId) && existing) await apiRequest(`/participations/${existing.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) })
        else await apiRequest('/participations', { method: 'POST', body: JSON.stringify({ event_id: Number(eventId) }) })
        const records = await apiRequest<ApiParticipation[]>('/participations'); setParticipations(records)
        setData((current) => ({ ...current, joinedEventIds: records.filter((item) => item.status === 'joined').map((item) => String(item.event_id)), dataError: null })); await reloadEvents()
      } catch (error) { report(error) }
    },
    loadMessages: async (eventId) => {
      try {
        const [items, names] = await Promise.all([apiRequest<ApiMessage[]>(`/messages?event_id=${eventId}`), apiRequest<Participant[]>(`/events/${eventId}/participants`)]); const nameMap = new Map(names.map((person) => [person.id, person.display_name]))
        setData((current) => ({ ...current, messages: { ...current.messages, [eventId]: items.map((item) => asMessage(item, nameMap.get(item.author_id) ?? 'Участник')) }, dataError: null }))
      } catch (error) { report(error) }
    },
    loadParticipants: async (eventId) => { try { return await apiRequest<Participant[]>(`/events/${eventId}/participants`) } catch (error) { report(error); throw error } },
    sendMessage: async (eventId, text) => {
      try { const item = await apiRequest<ApiMessage>('/messages', { method: 'POST', body: JSON.stringify({ event_id: Number(eventId), body: text }) }); setData((current) => ({ ...current, messages: { ...current.messages, [eventId]: [...(current.messages[eventId] ?? []), asMessage(item, current.profile.name)] }, dataError: null })) }
      catch (error) { report(error) }
    },
    setAttendance: async (eventId, attended) => {
      try {
        const existingId = attendanceIds[eventId]
        const result = await apiRequest<ApiAttendance>(existingId ? `/attendances/${existingId}` : '/attendances', { method: existingId ? 'PATCH' : 'POST', body: JSON.stringify(existingId ? { attended } : { event_id: Number(eventId), attended }) })
        setAttendanceIds((current) => ({ ...current, [eventId]: result.id })); setData((current) => ({ ...current, attendance: { ...current.attendance, [eventId]: attended }, dataError: null }))
      } catch (error) { report(error) }
    },
    reloadEvents,
  }), [data, participations, attendanceIds, reloadEvents, loadPrivateData])
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() { const value = useContext(AppDataContext); if (!value) throw new Error('useAppData must be used inside AppDataProvider'); return value }
