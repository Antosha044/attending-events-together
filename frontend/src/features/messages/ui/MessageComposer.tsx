import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { useAppData } from '../../../app/providers/AppDataProvider'

export default function MessageComposer({ eventId }: { eventId: string }) {
  const { sendMessage, authenticated } = useAppData()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [messageApi, context] = message.useMessage()

  const submit = () => {
    const value = text.trim()
    if (!value) return messageApi.error('Введите текст сообщения')
    if (value.length > 4000) return messageApi.error('Сообщение не должно превышать 4000 символов')
    if (!authenticated) { window.dispatchEvent(new Event('auth-open')); return }
    if (loading) return
    setLoading(true)
    void sendMessage(eventId, value).then(() => {
      setText('')
    }).catch((error: unknown) => messageApi.error(error instanceof Error ? error.message : 'Не удалось отправить сообщение')).finally(() => setLoading(false))
  }

  return <div className="chat-composer">{context}<div className="chat-input-row"><Input disabled={!authenticated || loading} value={text} maxLength={4000} placeholder={authenticated ? 'Напишите сообщение' : 'Войдите, чтобы писать в чате'} onChange={(event) => setText(event.target.value)} onPressEnter={(event) => { event.preventDefault(); submit() }} aria-label="Текст сообщения" /><Button type="primary" loading={loading} icon={<SendOutlined />} onClick={submit} aria-label="Отправить сообщение" /></div><small>{text.length}/4000</small></div>
}
