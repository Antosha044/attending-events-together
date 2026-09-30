import { Button, Form, Input, InputNumber, Select } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import PageIntro from '../shared/PageIntro'
import { getEvent } from '../data/events'
import NotFoundPage from './NotFoundPage'

export default function EventFormPage() {
  const { eventId } = useParams()
  const editing = Boolean(eventId)
  const event = getEvent(eventId ?? '')
  if (editing && !event) return <NotFoundPage />
  return <div className="form-page"><Link to={editing && event ? `/events/${event.id}` : '/events'} className="back-link"><ArrowLeftOutlined /> Назад</Link><PageIntro eyebrow={editing ? 'ВАШИ ПЛАНЫ' : 'НОВАЯ ВСТРЕЧА'} title={editing ? 'Изменить событие' : 'Соберёмся вместе?'} description="Расскажите, куда хотите пойти — компания найдётся."/><div className="form-card"><Form layout="vertical" initialValues={editing && event ? { title: event.title, category: event.category, description: event.description, venue: event.venue, capacity: event.capacity } : { capacity: 6 }}><Form.Item label="Как назовём событие?" name="title"><Input size="large" placeholder="Например, вечер настольных игр" /></Form.Item><Form.Item label="Категория" name="category"><Select size="large" placeholder="Выберите категорию" options={['Музыка', 'Искусство', 'Прогулка', 'Кино', 'Еда', 'Другое'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item label="Что будем делать?" name="description"><Input.TextArea rows={4} placeholder="Пара слов о встрече и вашем плане…" /></Form.Item><div className="form-split"><Form.Item label="Место встречи" name="venue"><Input size="large" prefix={<EnvironmentOutlined />} placeholder="Кафе, парк, адрес" /></Form.Item><Form.Item label="Дата и время"><Input size="large" prefix={<CalendarOutlined />} type="datetime-local" /></Form.Item></div><Form.Item label="Сколько человек собираемся?" name="capacity"><InputNumber size="large" min={2} max={100} /></Form.Item><div className="demo-note">Это макет формы. События пока не сохраняются, серверная часть не подключена.</div><Button type="primary" size="large" disabled>{editing ? 'Сохранить изменения' : 'Опубликовать событие'}</Button></Form></div></div>
}
