import { Avatar, Empty } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import MessageComposer from '../features/messages/ui/MessageComposer'
import NotFoundPage from './NotFoundPage'

export default function ChatPage() {
  const { eventId } = useParams()
  const { events, messages, profile } = useAppData()
  const event = events.find((item) => item.id === eventId)
  if (!event) return <NotFoundPage />
  const eventMessages = messages[event.id] ?? []

  return (
    <div className="chat-page">
      <Link to={`/events/${event.id}/group`} className="back-link"><ArrowLeftOutlined /> К участникам</Link>
      <section className="chat-window">
        <div className="chat-header"><Avatar style={{ background: '#d8eadf', color: '#356b55' }}>С</Avatar><div><b>{event.title}</b><span>{event.city} · {event.dateLabel}</span></div><Link to={`/events/${event.id}/group`}>Участники</Link></div>
        <div className="chat-messages" aria-live="polite">
          {eventMessages.length ? eventMessages.map((item) => {
            const own = item.name === profile.name
            return <div className={`message-row ${own ? 'own-message' : ''}`} key={item.id}><Avatar size={32} style={{ background: own ? '#d8eadf' : '#f0c2a7' }}>{item.name.trim()[0] || 'П'}</Avatar><div className="message-body"><span className="message-meta"><b>{item.name}</b> · {item.time}</span><div className="message-bubble">{item.text}</div></div></div>
          }) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Сообщений пока нет" />}
        </div>
        <MessageComposer eventId={event.id} />
      </section>
    </div>
  )
}
