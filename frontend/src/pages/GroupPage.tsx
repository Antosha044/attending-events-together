import { Avatar, Tag } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, EnvironmentOutlined, MessageOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import NotFoundPage from './NotFoundPage'
import ParticipationButton from '../features/participation/ui/ParticipationButton'

const people = [
  { name: 'Маша', note: 'Организатор', initial: 'М', color: '#f0c2a7' },
  { name: 'Аня', note: 'Участник', initial: 'А', color: '#d7c8f3' },
  { name: 'Илья', note: 'Участник', initial: 'И', color: '#bad2d5' },
  { name: 'Лена', note: 'Участник', initial: 'Л', color: '#e9d69e' },
]

export default function GroupPage() {
  const { eventId } = useParams()
  const { events, joinedEventIds, profile } = useAppData()
  const event = events.find((item) => item.id === eventId)
  if (!event) return <NotFoundPage />
  const joined = joinedEventIds.includes(event.id)
  const participantCount = Math.max(0, event.going - (joined ? 1 : 0))
  const visiblePeople = people.slice(0, Math.min(participantCount, people.length))
  const members = [
    ...visiblePeople,
    ...(participantCount > visiblePeople.length ? [{ name: `И ещё ${participantCount - visiblePeople.length}`, note: 'Участники события', initial: '…', color: '#eef0ec' }] : []),
    ...(joined ? [{ name: profile.name, note: 'Вы', initial: profile.name.trim()[0] || 'П', color: '#d8eadf' }] : []),
  ]

  return (
    <div className="subpage">
      <Link to={`/events/${event.id}`} className="back-link"><ArrowLeftOutlined /> К событию</Link>
      <div className="page-intro"><div><div className="eyebrow">{event.city} · {event.dateLabel}</div><h1>Участники</h1><p className="page-description">{event.title}</p></div><Tag className="open-tag" bordered={false}><span className="status-dot" /> Группа открыта</Tag></div>
      <div className="group-summary"><div><b>{event.going} из {event.capacity} участников</b><span>{event.venue}</span></div><ParticipationButton event={event} /></div>
      {members.length ? <div className="people-list">{members.map((person, index) => <div className="person-row" key={`${person.name}-${index}`}><Avatar style={{ backgroundColor: person.color, color: '#354039' }}>{person.initial}</Avatar><div className="person-info"><b>{person.name}</b><span>{person.note}</span></div>{index === 0 ? <Tag bordered={false}>Организатор</Tag> : <CheckOutlined className="member-check" />}</div>)}</div> : <p className="empty-state">Пока никто не присоединился.</p>}
      <div className="meetup-location"><EnvironmentOutlined /><span><b>{event.venue}</b><small>{event.city}, {event.address}</small></span></div>
      <div className="group-actions"><Link to={`/events/${event.id}/chat`}><MessageOutlined /> Открыть чат</Link><Link to={`/events/${event.id}/attendance`}>Отметить посещение</Link></div>
    </div>
  )
}
