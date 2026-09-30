import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { useAppData } from '../../../app/providers/AppDataProvider'

export default function MessageComposer({ eventId }: { eventId: string }) {
  const { sendMessage } = useAppData()
  const [text, setText] = useState('')
  const [messageApi, context] = message.useMessage()

  const submit = () => {
    const value = text.trim()
    if (!value) return messageApi.error('Введите текст сообщения')
    if (value.length > 4000) return messageApi.error('Сообщение не должно превышать 4000 символов')
    try {
      sendMessage(eventId, value)
      setText('')
    } catch {
      messageApi.error('Не удалось отправить сообщение')
    }
  }

  return <div className="chat-composer">{context}<div className="chat-input-row"><Input value={text} maxLength={4000} placeholder="Напишите сообщение" onChange={(event) => setText(event.target.value)} onPressEnter={(event) => { event.preventDefault(); submit() }} aria-label="Текст сообщения" /><Button type="primary" icon={<SendOutlined />} onClick={submit} aria-label="Отправить сообщение" /></div><small>{text.length}/4000</small></div>
}
