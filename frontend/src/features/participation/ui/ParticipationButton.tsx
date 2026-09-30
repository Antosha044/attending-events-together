import { useAppData } from '../../../app/providers/AppDataProvider'
import { Button, message } from 'antd'
import type { EventItem } from '../../../entities/event/model/types'

type Props = {
  event: Pick<EventItem, 'id' | 'going' | 'capacity'>
  block?: boolean
  size?: 'large' | 'middle' | 'small'
  className?: string
}

export default function ParticipationButton({ event, block = false, size = 'middle', className }: Props) {
  const { joinedEventIds, toggleParticipation } = useAppData()
  const [messageApi, context] = message.useMessage()
  const joined = joinedEventIds.includes(event.id)
  const full = event.going >= event.capacity && !joined

  const change = () => {
    try {
      toggleParticipation(event.id)
      messageApi.success(joined ? 'Вы покинули встречу' : 'Вы присоединились к встрече')
    } catch {
      messageApi.error('Не удалось сохранить изменение')
    }
  }

  return <>{context}<Button className={className} type="primary" size={size} block={block} disabled={full} onClick={change}>{joined ? 'Отменить участие' : full ? 'Свободных мест нет' : 'Присоединиться'}</Button></>
}
