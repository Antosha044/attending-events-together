import { useAppData } from '../app/providers/AppDataProvider'
import { Alert, Button, Tag, message } from 'antd'
import { useState } from 'react'
import { ArrowLeftOutlined, CalendarOutlined, CheckCircleFilled, EnvironmentOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import NotFoundPage from './NotFoundPage'

export default function AttendancePage() {
  const { eventId } = useParams()
  const { events, attendance, setAttendance, authenticated, joinedEventIds } = useAppData()
  const event = events.find((item) => item.id === eventId)
  const [messageApi, messageContext] = message.useMessage()
  const [saving, setSaving] = useState(false)
  if (!event) return <NotFoundPage />
  const current = attendance[event.id]

  const update = (attended: boolean) => {
    if (!authenticated) { window.dispatchEvent(new Event('auth-open')); return }
    if (!joinedEventIds.includes(event.id)) { messageApi.error('Присоединитесь к событию, чтобы отметить посещение'); return }
    if (saving) return
    setSaving(true)
    void setAttendance(event.id, attended).then(() => {
      messageApi.success('Отметка сохранена')
    }).catch((error: unknown) => messageApi.error(error instanceof Error ? error.message : 'Не удалось сохранить отметку')).finally(() => setSaving(false))
  }

  return (
    <div className="subpage attendance-page">
      {messageContext}
      <Link to={`/events/${event.id}`} className="back-link"><ArrowLeftOutlined /> К событию</Link>
      <div className="page-intro"><div><div className="eyebrow">ПОСЕЩЕНИЕ</div><h1>Отметка посещения</h1></div></div>
      <div className="attendance-card">
        {!authenticated && <Alert style={{ marginBottom: 18 }} type="info" showIcon message="Войдите, чтобы отметить посещение" />}
        <Tag bordered={false} color="green">{event.title}</Tag>
        <div className="attendance-meta"><span><CalendarOutlined /> {event.dateLabel}, {event.time}</span><span><EnvironmentOutlined /> {event.venue}</span></div>
        <div className="attendance-divider" />
        <div className="attendance-question">Вы посетили событие?</div>
        <div className="attendance-options">
          <Button size="large" loading={saving && current !== true} type={current === true ? 'primary' : 'default'} icon={<CheckCircleFilled />} onClick={() => update(true)}>Да</Button>
          <Button size="large" loading={saving && current !== false} type={current === false ? 'primary' : 'default'} onClick={() => update(false)}>Нет</Button>
        </div>
        {current !== undefined && <p className="attendance-result">{current ? 'Посещение отмечено' : 'Отмечено, что вы не смогли прийти'}</p>}
      </div>
    </div>
  )
}
