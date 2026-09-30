import { useAppData } from '../app/providers/AppDataProvider'
import { Tag } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, EnvironmentOutlined, EditOutlined, MessageOutlined, TeamOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import ParticipationButton from '../features/participation/ui/ParticipationButton'
import NotFoundPage from './NotFoundPage'

export default function EventPage() {
  const { eventId } = useParams()
  const { events } = useAppData()
  const event = events.find((item) => item.id === eventId)
  if (!event) return <NotFoundPage />

  return (
    <div className="detail-page">
      <Link to="/events" className="back-link"><ArrowLeftOutlined /> К афише</Link>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-cover"><img src={event.image} alt="" /><Tag className="detail-tag">{event.category}</Tag></div>
          <div className="detail-heading"><div><div className="eyebrow">{event.city} · {event.dateLabel} · {event.time}</div><h1>{event.title}</h1></div><Link className="edit-event-link" to={`/events/${event.id}/edit`}><EditOutlined /> Изменить</Link></div>
          <p className="detail-description">{event.description}</p>
          <div className="detail-facts">
            <div><CalendarOutlined /><span><b>{event.dateLabel}</b><small>Начало в {event.time}</small></span></div>
            <div><EnvironmentOutlined /><span><b>{event.venue}</b><small>{event.address}</small></span></div>
          </div>
          <div className="host-row"><span className={`host-avatar ${event.hostColor}`}>{event.hostInitials}</span><span>Организатор<br /><b>{event.host}</b></span></div>
        </div>
        <aside className="join-card">
          <div className="join-card-top">
            <span>УЧАСТНИКИ</span>
            <div className="capacity"><strong>{event.going}</strong><span>из {event.capacity}<br />мест</span></div>
            <div className="capacity-track"><i style={{ width: `${Math.min(event.going / event.capacity * 100, 100)}%` }} /></div>
            <p>Стоимость: <b>{event.price}</b></p>
          </div>
          <div className="join-card-bottom">
            <ParticipationButton event={event} block size="large" />
            <div className="join-links"><Link to={`/events/${event.id}/group`}><TeamOutlined /> Участники</Link><Link to={`/events/${event.id}/chat`}><MessageOutlined /> Чат</Link></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
