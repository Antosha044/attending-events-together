import { ArrowRightOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import type { EventItem } from '../entities/event/model/types'

export default function EventCard({ event, index }: { event: EventItem; index: number }) {
  return (
    <Link to={`/events/${event.id}`} className={`event-card card-delay-${index}`}>
      <div className="event-image-wrap"><img src={event.image} alt="" className="event-image" /><span className="event-category">{event.category}</span><span className="image-arrow"><ArrowRightOutlined /></span></div>
      <div className="event-card-content"><div className="event-date">{event.dateLabel} <span>·</span> {event.time}</div><h3>{event.title}</h3><div className="event-venue"><EnvironmentOutlined /> {event.venue}</div><div className="event-card-bottom"><span className="attendee-count"><UserOutlined /> {event.going} идут</span><span className="event-price">{event.price}</span></div></div>
    </Link>
  )
}
