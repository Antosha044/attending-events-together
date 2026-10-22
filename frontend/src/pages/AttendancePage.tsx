import { Alert } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import NotFoundPage from './NotFoundPage'

export default function AttendancePage() {
  const { eventId } = useParams()
  const { events } = useAppData()
  const event = events.find((item) => item.id === eventId)
  if (!event) return <NotFoundPage />
  return (
    <div className="subpage attendance-page">
      <Link to={`/events/${event.id}/group`} className="back-link"><ArrowLeftOutlined /> К участникам</Link>
      <div className="page-intro"><div><div className="eyebrow">ПОСЕЩЕНИЕ</div><h1>Отметка посещения</h1></div></div>
      <Alert type="info" showIcon message="Посещение отмечает организатор события после его завершения. Статус каждого участника отображается в списке участников." action={<Link to={`/events/${event.id}/group`}>Открыть список участников</Link>} />
    </div>
  )
}
