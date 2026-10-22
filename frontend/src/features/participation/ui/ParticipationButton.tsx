import { useAppData } from '../../../app/providers/AppDataProvider'
import { useState } from 'react'
import { Button, message } from 'antd'
import type { EventItem } from '../../../entities/event/model/types'

type Props = {
  event: Pick<EventItem, 'id' | 'going' | 'capacity'>
  block?: boolean
  size?: 'large' | 'middle' | 'small'
  className?: string
}

export default function ParticipationButton({ event, block = false, size = 'middle', className }: Props) {
  const { joinedEventIds, toggleParticipation, authenticated } = useAppData()
  const [messageApi, context] = message.useMessage()
  const [loading, setLoading] = useState(false)
  const joined = joinedEventIds.includes(event.id)
  const full = event.going >= event.capacity && !joined

  const change = () => {
    if (!authenticated) { window.dispatchEvent(new Event('auth-open')); return }
    if (loading) return
    setLoading(true)
    void toggleParticipation(event.id).then(() => {
      messageApi.success(joined ? 'Вы покинули встречу' : 'Вы присоединились к встрече')
    }).catch((error: unknown) => messageApi.error(error instanceof Error ? error.message : 'Не удалось сохранить изменение')).finally(() => setLoading(false))
  }

  return <>{context}<Button className={className} type="primary" size={size} block={block} disabled={full} loading={loading} onClick={change}>{joined ? 'Отменить участие' : full ? 'Свободных мест нет' : !authenticated ? 'Войти и присоединиться' : 'Присоединиться'}</Button></>
}
