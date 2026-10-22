import { Alert, Button, Form, Input, InputNumber, Select, message } from 'antd'
import { useEffect, useState } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import type { EventInput } from '../entities/event/model/types'
import NotFoundPage from './NotFoundPage'

type EventFormValues = Pick<EventInput, 'title' | 'category' | 'city' | 'dateTime' | 'venue' | 'address' | 'description' | 'capacity' | 'price'>

const categories = ['Музыка', 'Искусство', 'Прогулка', 'Кино', 'Еда', 'Другое']
const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург']

function formatDate(dateTime: string) {
  const date = new Date(dateTime)
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }).format(date)
}

export default function EventFormPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { events, profile, saveEvent, uploadEventImage, authenticated } = useAppData()
  const event = events.find((item) => item.id === eventId)
  const editing = Boolean(eventId)
  const [messageApi, messageContext] = message.useMessage()
  const [saving, setSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!selectedImage) { setPreviewUrl(null); return }
    const url = URL.createObjectURL(selectedImage)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [selectedImage])
  if (editing && !event) return <NotFoundPage />
  if (!authenticated) return <div className="form-page"><Alert type="info" showIcon message="Войдите, чтобы создавать и изменять события" action={<Button onClick={() => window.dispatchEvent(new Event('auth-open'))}>Войти или зарегистрироваться</Button>} /></div>
  if (editing && event?.creatorId !== profile.id) return <div className="form-page"><Alert type="error" showIcon message="Изменять событие может только его организатор" /></div>

  const initialValues: EventFormValues = event ? {
    title: event.title, category: event.category, city: event.city, dateTime: event.dateTime,
    venue: event.venue, address: event.address, description: event.description, capacity: event.capacity, price: event.price,
  } : { title: '', category: '', city: profile.city || 'Москва', dateTime: '', venue: '', address: '', description: '', capacity: 6, price: 'Бесплатно' }

  const submit = async (values: EventFormValues) => {
    setSaving(true)
    const input: EventInput = {
      ...values,
      dateLabel: formatDate(values.dateTime),
      time: values.dateTime.slice(11, 16),
      image: event?.image ?? '',
    }
    try {
      const id = await saveEvent(input, event?.id)
      if (selectedImage) {
        try { await uploadEventImage(id, selectedImage) }
        catch (error) {
          messageApi.error(`Событие сохранено, но изображение не загрузилось: ${error instanceof Error ? error.message : 'ошибка загрузки'}`)
          navigate(`/events/${id}/edit`)
          return
        }
      }
      messageApi.success(editing ? 'Изменения сохранены' : 'Событие добавлено')
      navigate(`/events/${id}`)
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Не удалось сохранить событие')
    } finally { setSaving(false) }
  }

  return (
    <div className="form-page">
      {messageContext}
      <Link to={editing && event ? `/events/${event.id}` : '/events'} className="back-link"><ArrowLeftOutlined /> Назад</Link>
      <div className="page-intro"><div><div className="eyebrow">СОБЫТИЕ</div><h1>{editing ? 'Редактирование события' : 'Новое событие'}</h1></div></div>
      <div className="form-card">
        <Form layout="vertical" initialValues={initialValues} onFinish={submit}>
          <Form.Item label="Изображение события">
            <div className="event-image-editor">
              {(previewUrl || event?.image) && <img src={previewUrl || event?.image} alt="Предпросмотр изображения события" />}
              <div>
                <input
                  aria-label="Выберите изображение события"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={saving}
                  onChange={(change) => {
                    const file = change.target.files?.[0]
                    change.target.value = ''
                    if (!file) return
                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { messageApi.error('Поддерживаются JPEG, PNG и WebP'); return }
                    if (file.size > 5 * 1024 * 1024) { messageApi.error('Размер изображения не должен превышать 5 МБ'); return }
                    setSelectedImage(file)
                  }}
                />
                <small>JPEG, PNG или WebP, до 5 МБ. {event ? 'Новое изображение заменит текущее после сохранения.' : 'Можно добавить при создании или позже.'}</small>
              </div>
            </div>
          </Form.Item>
          <Form.Item label="Название" name="title" rules={[{ required: true, whitespace: true, message: 'Введите название события' }, { max: 160, message: 'Максимум 160 символов' }]}><Input size="large" maxLength={160} /></Form.Item>
          <div className="form-split">
            <Form.Item label="Категория" name="category" rules={[{ required: true, message: 'Выберите категорию' }]}><Select size="large" options={categories.map((value) => ({ value, label: value }))} /></Form.Item>
            <Form.Item label="Город" name="city" rules={[{ required: true, message: 'Выберите город' }]}><Select size="large" options={cities.map((value) => ({ value, label: value }))} /></Form.Item>
          </div>
          <Form.Item label="Описание" name="description" rules={[{ required: true, whitespace: true, message: 'Добавьте описание' }, { max: 2000, message: 'Максимум 2000 символов' }]}><Input.TextArea rows={4} maxLength={2000} showCount /></Form.Item>
          <div className="form-split">
            <Form.Item label="Место" name="venue" rules={[{ required: true, whitespace: true, message: 'Укажите место проведения' }, { max: 200, message: 'Максимум 200 символов' }]}><Input size="large" /></Form.Item>
            <Form.Item label="Адрес" name="address" rules={[{ required: true, whitespace: true, message: 'Укажите адрес' }, { max: 300, message: 'Максимум 300 символов' }]}><Input size="large" /></Form.Item>
          </div>
          <div className="form-split">
            <Form.Item label="Дата и время" name="dateTime" rules={[{ required: true, message: 'Укажите дату и время' }]}><Input size="large" type="datetime-local" /></Form.Item>
            <Form.Item label="Стоимость" name="price" rules={[{ required: true, whitespace: true, message: 'Укажите стоимость' }, { max: 40, message: 'Максимум 40 символов' }]}><Input size="large" /></Form.Item>
          </div>
          <Form.Item label="Количество мест" name="capacity" rules={[{ required: true, message: 'Укажите количество мест' }, { type: 'number', min: 1, max: 100, message: 'Допустимо от 1 до 100 мест' }, ...(event ? [{ validator: (_: unknown, value: number) => value >= event.going ? Promise.resolve() : Promise.reject(new Error(`Уже записано участников: ${event.going}`)) }] : [])]}><InputNumber size="large" min={1} max={100} /></Form.Item>
          <Button type="primary" size="large" htmlType="submit" loading={saving}>{editing ? 'Сохранить' : 'Создать событие'}</Button>
        </Form>
      </div>
    </div>
  )
}
