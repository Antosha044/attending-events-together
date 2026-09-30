import { useAppData } from '../app/providers/AppDataProvider'
import { Button, Tag, message } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, CheckCircleFilled, EnvironmentOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import NotFoundPage from './NotFoundPage'

export default function AttendancePage() {
  const { eventId } = useParams()
  const { events, attendance, setAttendance } = useAppData()
  const event = events.find((item) => item.id === eventId)
  const [messageApi, messageContext] = message.useMessage()
  if (!event) return <NotFoundPage />
  const current = attendance[event.id]

  const update = (attended: boolean) => {
    try {
      setAttendance(event.id, attended)
      messageApi.success('Отметка сохранена')
    } catch {
      messageApi.error('Не удалось сохранить отметку')
    }
  }

  return (
    <div className="subpage attendance-page">
      {messageContext}
      <Link to={`/events/${event.id}`} className="back-link"><ArrowLeftOutlined /> К событию</Link>
      <div className="page-intro"><div><div className="eyebrow">ПОСЕЩЕНИЕ</div><h1>Отметка посещения</h1></div></div>
      <div className="attendance-card">
        <Tag bordered={false} color="green">{event.title}</Tag>
        <div className="attendance-meta"><span><CalendarOutlined /> {event.dateLabel}, {event.time}</span><span><EnvironmentOutlined /> {event.venue}</span></div>
        <div className="attendance-divider" />
        <div className="attendance-question">Вы посетили событие?</div>
        <div className="attendance-options">
          <Button size="large" type={current === true ? 'primary' : 'default'} icon={<CheckCircleFilled />} onClick={() => update(true)}>Да</Button>
          <Button size="large" type={current === false ? 'primary' : 'default'} onClick={() => update(false)}>Нет</Button>
        </div>
        {current !== undefined && <p className="attendance-result">{current ? 'Посещение отмечено' : 'Отмечено, что вы не смогли прийти'}</p>}
      </div>
    </div>
  )
}
