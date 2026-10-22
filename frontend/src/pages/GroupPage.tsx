import { Alert, Avatar, Spin, Tag } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, EnvironmentOutlined, MessageOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppData } from '../app/providers/AppDataProvider'
import NotFoundPage from './NotFoundPage'
import ParticipationButton from '../features/participation/ui/ParticipationButton'

export default function GroupPage() {
  const { eventId } = useParams()
  const { events, joinedEventIds, profile, authenticated, loadParticipants } = useAppData()
  const event = events.find((item) => item.id === eventId)
  const [people, setPeople] = useState<{ id: number; display_name: string; status: string }[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!eventId || !authenticated) { setPeople([]); return }
    if (event && event.creatorId !== profile.id && !joinedEventIds.includes(event.id)) { setPeople([]); setLoading(false); return }
    setLoading(true)
    void loadParticipants(eventId).then(setPeople).catch(() => setPeople([])).finally(() => setLoading(false))
  }, [eventId, authenticated, joinedEventIds.join(','), event?.creatorId, profile.id])
  if (!event) return <NotFoundPage />
  const members = people.map((person) => ({ name: person.display_name, note: person.id === event.creatorId ? 'Организатор' : person.id === profile.id ? 'Вы' : 'Участник', initial: person.display_name.trim()[0] || 'П', color: person.id === profile.id ? '#d8eadf' : '#d7c8f3' }))

  return (
    <div className="subpage">
      <Link to={`/events/${event.id}`} className="back-link"><ArrowLeftOutlined /> К событию</Link>
      <div className="page-intro"><div><div className="eyebrow">{event.city} · {event.dateLabel}</div><h1>Участники</h1><p className="page-description">{event.title}</p></div><Tag className="open-tag" bordered={false}><span className="status-dot" /> Группа открыта</Tag></div>
      <div className="group-summary"><div><b>{event.going} из {event.capacity} участников</b><span>{event.venue}</span></div><ParticipationButton event={event} /></div>
      {!authenticated ? <Alert type="info" showIcon message="Войдите и присоединитесь к событию, чтобы увидеть участников" action={<button className="link-button" onClick={() => window.dispatchEvent(new Event('auth-open'))}>Войти</button>} /> : loading ? <Spin /> : members.length && (event.creatorId === profile.id || joinedEventIds.includes(event.id)) ? <div className="people-list">{members.map((person) => <div className="person-row" key={person.name}><Avatar style={{ backgroundColor: person.color, color: '#354039' }}>{person.initial}</Avatar><div className="person-info"><b>{person.name}</b><span>{person.note}</span></div>{person.note === 'Организатор' ? <Tag bordered={false}>Организатор</Tag> : person.note === 'Вы' ? <Tag bordered={false}>Вы</Tag> : <CheckOutlined className="member-check" />}</div>)}</div> : <p className="empty-state">Присоединитесь к событию, чтобы увидеть участников группы.</p>}
      <div className="meetup-location"><EnvironmentOutlined /><span><b>{event.venue}</b><small>{event.city}, {event.address}</small></span></div>
      <div className="group-actions"><Link to={`/events/${event.id}/chat`}><MessageOutlined /> Открыть чат</Link><Link to={`/events/${event.id}/attendance`}>Отметить посещение</Link></div>
    </div>
  )
}
