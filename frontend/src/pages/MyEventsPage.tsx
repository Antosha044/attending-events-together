import { Empty } from 'antd'
import { Link } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import EventCard from '../shared/EventCard'

export default function MyEventsPage() {
  const { events, joinedEventIds } = useAppData()
  const joinedEvents = events.filter((event) => joinedEventIds.includes(event.id))

  return (
    <section className="events-section events-page">
      <div className="events-toolbar"><div><div className="eyebrow">ЛИЧНЫЙ СПИСОК</div><h1>Мои встречи</h1></div></div>
      {joinedEvents.length ? (
        <div className="events-grid">{joinedEvents.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div>
      ) : (
        <div className="events-empty"><Empty description={<span>Вы пока не записались на события. <Link to="/events">Перейти к афише</Link></span>} /></div>
      )}
    </section>
  )
}
