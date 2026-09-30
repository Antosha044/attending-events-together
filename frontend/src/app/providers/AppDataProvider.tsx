import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { demoEvents, initialMessages } from '../../entities/event/model/demo-events'
import type { EventInput, EventItem, EventMessage } from '../../entities/event/model/types'
import type { UserProfile } from '../../entities/user/model/types'

const STORAGE_KEY = 'events-together-state-v1'
type AppData = {
  events: EventItem[]
  joinedEventIds: string[]
  profile: UserProfile
  messages: Record<string, EventMessage[]>
  attendance: Record<string, boolean>
}
type AppDataContextValue = AppData & {
  storageError: string | null
  saveProfile: (profile: UserProfile) => void
  saveEvent: (input: EventInput, id?: string) => string
  toggleParticipation: (eventId: string) => void
  sendMessage: (eventId: string, text: string) => void
  setAttendance: (eventId: string, attended: boolean) => void
}

const defaults: AppData = {
  events: demoEvents,
  joinedEventIds: [],
  profile: { name: 'Александр', email: 'alex@example.com', city: 'Москва' },
  messages: initialMessages,
  attendance: {},
}

function readData(): { data: AppData; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { data: defaults, error: null }
    const stored = JSON.parse(raw) as Partial<AppData>
    return {
      data: {
        ...defaults,
        ...stored,
        events: Array.isArray(stored.events) ? stored.events : defaults.events,
        joinedEventIds: Array.isArray(stored.joinedEventIds) ? stored.joinedEventIds : [],
        profile: stored.profile ?? defaults.profile,
        messages: stored.messages ?? defaults.messages,
        attendance: stored.attendance ?? {},
      },
      error: null,
    }
  } catch {
    return { data: defaults, error: 'Не удалось прочитать сохранённые данные браузера.' }
  }
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: PropsWithChildren) {
  const [initial] = useState(readData)
  const [data, setData] = useState(initial.data)
  const [storageError, setStorageError] = useState(initial.error)

  const update = (next: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setData(next)
      setStorageError(null)
    } catch {
      setStorageError('Не удалось сохранить изменения. Проверьте настройки хранилища браузера.')
      throw new Error('Не удалось сохранить изменения в браузере.')
    }
  }

  const value = useMemo<AppDataContextValue>(() => ({
    ...data,
    storageError,
    saveProfile: (profile) => update({ ...data, profile }),
    saveEvent: (input, id) => {
      const eventId = id ?? `event-${Date.now()}`
      const existing = data.events.find((event) => event.id === eventId)
      const nextEvent: EventItem = {
        ...input,
        id: eventId,
        going: existing?.going ?? 0,
        host: existing?.host ?? data.profile.name,
        hostInitials: existing?.hostInitials ?? (data.profile.name.trim()[0] || 'П'),
        hostColor: existing?.hostColor ?? 'blue',
      }
      update({ ...data, events: existing ? data.events.map((event) => event.id === id ? nextEvent : event) : [nextEvent, ...data.events] })
      return eventId
    },
    toggleParticipation: (eventId) => {
      const isJoined = data.joinedEventIds.includes(eventId)
      const events = data.events.map((event) => event.id === eventId ? { ...event, going: Math.max(0, event.going + (isJoined ? -1 : 1)) } : event)
      update({ ...data, events, joinedEventIds: isJoined ? data.joinedEventIds.filter((id) => id !== eventId) : [...data.joinedEventIds, eventId] })
    },
    sendMessage: (eventId, text) => {
      const nextMessages = [...(data.messages[eventId] ?? []), { id: `${eventId}-${Date.now()}`, name: data.profile.name, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), text }]
      update({ ...data, messages: { ...data.messages, [eventId]: nextMessages } })
    },
    setAttendance: (eventId, attended) => update({ ...data, attendance: { ...data.attendance, [eventId]: attended } }),
  }), [data, storageError])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used inside AppDataProvider')
  return value
}
