import { Button, Tag } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, CheckCircleFilled, EnvironmentOutlined, SmileOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { getEvent } from '../data/events'
import PageIntro from '../shared/PageIntro'
import NotFoundPage from './NotFoundPage'

export default function AttendancePage() {
  const event = getEvent(useParams().eventId ?? '')
  if (!event) return <NotFoundPage />
  return <div className="subpage attendance-page"><Link to={`/events/${event.id}`} className="back-link"><ArrowLeftOutlined /> К событию</Link><PageIntro eyebrow="ПОСЛЕ ВСТРЕЧИ" title="Как всё прошло?" description="Отметьте участие — так организатор будет знать, что вы пришли."/><div className="attendance-card"><div className="attendance-icon"><SmileOutlined /></div><Tag bordered={false} color="green">Событие состоялось</Tag><h2>{event.title}</h2><div className="attendance-meta"><span><CalendarOutlined /> {event.dateLabel}, {event.time}</span><span><EnvironmentOutlined /> {event.venue}</span></div><div className="attendance-divider"/><div className="attendance-question">Вы были на встрече?</div><div className="attendance-options"><Button size="large" type="primary" icon={<CheckCircleFilled />} disabled>Да, я пришёл(ла)</Button><Button size="large" disabled>Не получилось</Button></div><small className="attendance-note">Отметка появится после подключения серверной части.</small></div></div>
}
