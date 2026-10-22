import { Alert, Avatar, Button, Spin, Tag, message } from 'antd'
import { ArrowLeftOutlined, EnvironmentOutlined, MessageOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppData } from '../app/providers/AppDataProvider'
import NotFoundPage from './NotFoundPage'
import ParticipationButton from '../features/participation/ui/ParticipationButton'

export default function GroupPage() {
  const { eventId } = useParams()
  const { events, joinedEventIds, profile, authenticated, loadParticipants, setParticipantAttendance } = useAppData()
  const event = events.find((item) => item.id === eventId)
  const [people, setPeople] = useState<{ id: number; display_name: string; status: string; attended: boolean | null }[]>([])
  const [loading, setLoading] = useState(false)
  const [messageApi, messageContext] = message.useMessage()
  const [savingAttendance, setSavingAttendance] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!eventId || !authenticated) { setPeople([]); return }
    if (event && event.creatorId !== profile.id && !joinedEventIds.includes(event.id)) { setPeople([]); setLoading(false); return }
    setLoading(true)
    void loadParticipants(eventId).then(setPeople).catch(() => setPeople([])).finally(() => setLoading(false))
  }, [eventId, authenticated, joinedEventIds.join(','), event?.creatorId, profile.id])
  if (!event) return <NotFoundPage />
  const eventEnded = new Date(event.dateTime).getTime() <= now
  const isCreator = event.creatorId === profile.id
  const members = people.map((person) => ({ ...person, name: person.display_name, note: person.id === event.creatorId ? 'Организатор' : person.id === profile.id ? 'Вы' : 'Участник', initial: person.display_name.trim()[0] || 'П', color: person.id === profile.id ? '#d8eadf' : '#d7c8f3' }))

  const markAttendance = async (userId: number, attended: boolean) => {
    setSavingAttendance(userId)
    try {
      await setParticipantAttendance(event.id, userId, attended)
      setPeople(await loadParticipants(event.id))
      messageApi.success('Посещение сохранено')
    } catch (error) { messageApi.error(error instanceof Error ? error.message : 'Не удалось сохранить отметку') }
    finally { setSavingAttendance(null) }
  }

  return (
    <div className="subpage">
      {messageContext}
      <Link to={`/events/${event.id}`} className="back-link"><ArrowLeftOutlined /> К событию</Link>
      <div className="page-intro"><div><div className="eyebrow">{event.city} · {event.dateLabel}</div><h1>Участники</h1><p className="page-description">{event.title}</p></div><Tag className="open-tag" bordered={false}><span className="status-dot" /> Группа открыта</Tag></div>
      <div className="group-summary"><div><b>{event.going} из {event.capacity} участников</b><span>{event.venue}</span></div><ParticipationButton event={event} /></div>
      {!authenticated ? <Alert type="info" showIcon message="Войдите и присоединитесь к событию, чтобы увидеть участников" action={<button className="link-button" onClick={() => window.dispatchEvent(new Event('auth-open'))}>Войти</button>} /> : loading ? <Spin /> : members.length && (isCreator || joinedEventIds.includes(event.id)) ? <div className="people-list">{members.map((person) => <div className="person-row" key={person.id}><Avatar style={{ backgroundColor: person.color, color: '#354039' }}>{person.initial}</Avatar><div className="person-info"><b>{person.name}</b><span>{person.note}</span></div>{person.note === 'Организатор' && <Tag bordered={false}>Организатор</Tag>}{eventEnded && <Tag color={person.attended === null ? 'default' : person.attended ? 'green' : 'red'}>{person.attended === null ? 'Ожидает отметки' : person.attended ? 'Посетил' : 'Не посетил'}</Tag>}{isCreator && eventEnded && <div className="attendance-mark-actions"><Button size="small" loading={savingAttendance === person.id} type={person.attended === true ? 'primary' : 'default'} onClick={() => void markAttendance(person.id, true)}>Посетил</Button><Button size="small" loading={savingAttendance === person.id} type={person.attended === false ? 'primary' : 'default'} onClick={() => void markAttendance(person.id, false)}>Не был</Button></div>}</div>)}</div> : <p className="empty-state">Присоединитесь к событию, чтобы увидеть участников группы.</p>}
      <div className="meetup-location"><EnvironmentOutlined /><span><b>{event.venue}</b><small>{event.city}, {event.address}</small></span></div>
      <div className="group-actions"><Link to={`/events/${event.id}/chat`}><MessageOutlined /> Открыть чат</Link></div>
    </div>
  )
}
